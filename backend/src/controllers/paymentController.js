const axios = require('axios');
const { prisma } = require('../config/db');
const { paginateResult } = require('../middleware/paginate');
const crypto = require('crypto');
const { logBookKeeping } = require('../services/bookKeepingService');

// @route POST /payments/paystack/initialize
exports.initializePaystack = async (req, res, next) => {
  try {
    const { amount, email, invoiceId, description } = req.body;
    if (!amount || !email) {
      return res.status(400).json({ success: false, message: 'amount and email are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const secretKey = (user?.apiKeys || {}).paystackKey || process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return res.status(400).json({ success: false, message: 'Paystack not configured. Add your secret key in Settings.' });
    }

    const reference = `MP_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100), // Paystack uses kobo
        reference,
        callback_url: `${process.env.CLIENT_URL}/payment/verify`,
        metadata: { invoiceId, userId: req.user.id, description },
      },
      { headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' } }
    );

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId: req.user.id,
        reference,
        amount,
        currency: 'NGN',
        method: 'paystack',
        status: 'pending',
        description,
        invoiceId: invoiceId || null,
        metadata: { email },
      },
    });

    await logBookKeeping(
      req.user.id,
      'cashflow',
      'payment',
      reference,
      'INITIALIZED',
      `Payment initialized: ${description || 'Invoice payment'}`,
      { amount, currency: 'NGN', method: 'paystack', reference, invoiceId },
      req.user.name || req.user.role,
    );

    res.json({ success: true, data: response.data.data });
  } catch (err) {
    if (err.response?.data) {
      return res.status(400).json({ success: false, message: err.response.data.message });
    }
    next(err);
  }
};

// @route POST /payments/paystack/initialize-subscription
exports.initializeSubscription = async (req, res, next) => {
  try {
    const { planType, interval, selectedFeatures, amount } = req.body;
    const VALID_PLANS = ['standard', 'premium', 'enterprise'];
    const VALID_INTERVALS = ['monthly', 'yearly'];
    if (!planType || !VALID_PLANS.includes(planType)) {
      return res.status(400).json({ success: false, message: 'Valid planType (standard, premium or enterprise) is required' });
    }
    if (!interval || !VALID_INTERVALS.includes(interval)) {
      return res.status(400).json({ success: false, message: 'Valid interval (monthly or yearly) is required' });
    }
    if (!selectedFeatures || !Array.isArray(selectedFeatures) || selectedFeatures.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one feature must be selected' });
    }
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const email = req.user.email;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const secretKey = (user?.apiKeys || {}).paystackKey || process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return res.status(400).json({ success: false, message: 'Paystack not configured.' });
    }

    const reference = `SUB_${Date.now()}_${req.user.id.slice(-6).toUpperCase()}`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100),
        reference,
        callback_url: `${process.env.CLIENT_URL}/onboarding/verify-payment`,
        metadata: { 
          userId: req.user.id, 
          planType, 
          interval,
          selectedFeatures,
          isSubscription: true 
        },
      },
      { headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' } }
    );

    await prisma.payment.create({
      data: {
        userId: req.user.id,
        reference,
        amount,
        currency: 'NGN',
        method: 'paystack',
        status: 'pending',
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription - ${selectedFeatures.length} features`,
        metadata: { planType, interval, selectedFeatures, isSubscription: true },
      },
    });

    await logBookKeeping(
      req.user.id,
      'cashflow',
      'payment',
      reference,
      'INITIALIZED',
      `Subscription payment initialized: ${planType} plan`,
      { amount, planType, selectedFeatures },
      req.user.name || req.user.role,
    );

    res.json({ success: true, data: response.data.data });
  } catch (err) {
    if (err.response?.data) {
      return res.status(400).json({ success: false, message: err.response.data.message });
    }
    next(err);
  }
};

// @route GET /payments/paystack/verify/:reference
exports.verifyPaystack = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const secretKey = (user?.apiKeys || {}).paystackKey || process.env.PAYSTACK_SECRET_KEY;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );

    const txData = response.data.data;

    const payment = await prisma.payment.update({
      where: { reference },
      data: {
        status: txData.status === 'success' ? 'success' : 'failed',
        paystackData: txData,
        paidAt: txData.status === 'success' ? new Date() : undefined,
      },
    });

    await logBookKeeping(
      payment.userId,
      'cashflow',
      'payment',
      payment.reference,
      txData.status === 'success' ? 'PAID' : 'FAILED',
      `Payment ${txData.status}: ${payment.description || 'Payment verification'}`,
      { amount: payment.amount, currency: payment.currency, method: payment.method, status: txData.status },
      req.user.name || req.user.role,
    );

    // Mark invoice as paid if linked
    if (payment?.invoiceId && txData.status === 'success') {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'paid', paidAt: new Date() },
      });
    }

    // Handle subscription completion
    if (txData.metadata?.isSubscription && txData.status === 'success') {
      const interval = txData.metadata.interval || 'monthly';
      const expiresAt = new Date();
      if (interval === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      await prisma.user.update({
        where: { id: txData.metadata.userId },
        data: {
          subscription: {
            status: 'active',
            plan: txData.metadata.planType,
            interval,
            expiresAt: expiresAt.toISOString(),
            paystackCustomerCode: txData.customer.customer_code,
            selectedFeatures: txData.metadata.selectedFeatures || [],
          },
          onboardingStatus: 'COMPLETED',
        },
      });
    }

    res.json({ success: true, data: { status: txData.status, payment } });
  } catch (err) {
    if (err.response?.data) {
      return res.status(400).json({ success: false, message: err.response.data.message });
    }
    next(err);
  }
};

// @route POST /payments/paystack/webhook
exports.paystackWebhook = async (req, res, next) => {
  try {
    // req.body arrives as a raw Buffer here (see the express.raw() mount in
    // server.js, scoped to this exact path) — HMAC verification must run
    // against those exact bytes, not a re-serialized JS object, or every
    // signature check fails.
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({ success: false, message: 'Invalid webhook body' });
    }
    const rawBody = req.body;

    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      return res.status(400).json({ success: false, message: 'Malformed webhook payload' });
    }

    const { event, data } = payload || {};

    // Users can configure their own Paystack secret key (see initializePaystack),
    // so verify against whichever key actually signed this payment, falling
    // back to the platform default for payments initialized without one.
    let secretKey = process.env.PAYSTACK_SECRET_KEY;
    let payment = null;
    if (data?.reference) {
      payment = await prisma.payment.findUnique({
        where: { reference: data.reference },
        include: { user: { select: { apiKeys: true } } },
      });
      if (payment?.user?.apiKeys?.paystackKey) {
        secretKey = payment.user.apiKeys.paystackKey;
      }
    }

    if (!secretKey) {
      return res.status(400).json({ success: false, message: 'Paystack not configured' });
    }

    const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    if (event === 'charge.success' && payment) {
      await prisma.payment.update({
        where: { reference: data.reference },
        data: { status: 'success', paystackData: data, paidAt: new Date() },
      });

      await logBookKeeping(
        payment.userId,
        'cashflow',
        'payment',
        payment.reference,
        'PAID',
        `Payment confirmed via webhook: ${payment.description || 'Payment'}`,
        { amount: payment.amount, currency: payment.currency, reference: payment.reference },
        'Paystack Webhook',
      );
    }

    res.json({ success: true });
  } catch (err) { next(err); }
};

// @route GET /payments/bank-details
exports.getBankDetails = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ success: true, data: user.bankDetails || {} });
  } catch (err) { next(err); }
};

// @route GET /payments/history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: { invoice: { select: { invoiceNumber: true, client: true } } },
      }),
      prisma.payment.count({ where }),
    ]);
    res.json({ success: true, ...paginateResult(payments, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};
