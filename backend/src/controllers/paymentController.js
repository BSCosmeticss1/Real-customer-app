const axios = require('axios');
const { prisma } = require('../config/db');
const { paginateResult } = require('../middleware/paginate');
const crypto = require('crypto');

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
    const { planType } = req.body; // 'monthly' or 'yearly'
    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({ success: false, message: 'Valid planType (monthly or yearly) is required' });
    }

    const amount = planType === 'monthly' ? 30000 : 120000;
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
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription`,
        metadata: { planType, isSubscription: true },
      },
    });

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

    // Mark invoice as paid if linked
    if (payment?.invoiceId && txData.status === 'success') {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'paid', paidAt: new Date() },
      });
    }

    // Handle subscription completion
    if (txData.metadata?.isSubscription && txData.status === 'success') {
      const expiresAt = new Date();
      if (txData.metadata.planType === 'monthly') {
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
            expiresAt: expiresAt.toISOString(),
            paystackCustomerCode: txData.customer.customer_code,
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
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const { event, data } = req.body;
    if (event === 'charge.success') {
      await prisma.payment.update({
        where: { reference: data.reference },
        data: { status: 'success', paystackData: data, paidAt: new Date() },
      });
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
