const { prisma } = require('../config/db');
const { paginateResult } = require('../middleware/paginate');
const { logBookKeeping } = require('../services/bookKeepingService');

// =================== INVOICES ===================

exports.getInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: { items: true },
      }),
      prisma.invoice.count({ where }),
    ]);
    res.json({ success: true, ...paginateResult(invoices, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true },
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const { client, clientEmail, dueDate, tax = 0, items } = req.body;

    if (!client || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Client name and at least one item are required' 
      });
    }

    // Generate unique invoice number per user
    const invoiceCount = await prisma.invoice.count({ where: { userId: req.user.id } });
    const invoiceNumber = `INV-${req.user.id.slice(-6).toUpperCase()}-${(invoiceCount + 1).toString().padStart(4, '0')}`;

    // Calculate totals
    const subtotal = items.reduce((s, item) => s + (Number(item.quantity) * Number(item.price)), 0);
    const taxAmount = subtotal * (Number(tax) / 100);
    const total = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        userId: req.user.id,
        invoiceNumber,
        client,
        clientEmail: clientEmail || '',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7*24*60*60*1000),
        tax: Number(tax),
        subtotal,
        taxAmount,
        total,
        status: 'pending',
        items: {
          create: items.map(item => ({
            description: item.description,
            quantity: Number(item.quantity),
            price: Number(item.price),
            total: Number(item.quantity) * Number(item.price),
          })),
        },
      },
      include: { items: true },
    });

    await logBookKeeping(
      req.user.id,
      'invoices',
      'invoice',
      invoice.id,
      'CREATED',
      `Invoice ${invoice.invoiceNumber} created for ${client}`,
      { invoiceNumber, client, total, status: invoice.status },
      req.user.name || req.user.role,
    );

    res.status(201).json({
      success: true,
      data: invoice
    });

  } catch (err) {
    console.error("Create Invoice Error:", err);
    next(err);
  }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const { items, ...rest } = req.body;
    
    // If items are provided, we need to handle them specially in Prisma
    const data = { ...rest };
    if (items) {
      // For simplicity, we'll delete old items and create new ones
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: req.params.id } });
      
      const subtotal = items.reduce((s, item) => s + (Number(item.quantity) * Number(item.price)), 0);
      const tax = rest.tax || 0;
      const taxAmount = subtotal * (Number(tax) / 100);
      
      data.subtotal = subtotal;
      data.taxAmount = taxAmount;
      data.total = subtotal + taxAmount;
      data.items = {
        create: items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          price: Number(item.price),
          total: Number(item.quantity) * Number(item.price),
        })),
      };
    }

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data,
      include: { items: true },
    });

    await logBookKeeping(
      req.user.id,
      'invoices',
      'invoice',
      req.params.id,
      'UPDATED',
      `Invoice ${invoice.invoiceNumber} updated`,
      { invoiceNumber: invoice.invoiceNumber, total: invoice.total },
      req.user.name || req.user.role,
    );

    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    await prisma.invoice.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (invoice) {
      await logBookKeeping(
        req.user.id,
        'invoices',
        'invoice',
        req.params.id,
        'DELETED',
        `Invoice ${invoice.invoiceNumber} deleted`,
        { invoiceNumber: invoice.invoiceNumber, client: invoice.client },
        req.user.name || req.user.role,
      );
    }

    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) { next(err); }
};

exports.markInvoicePaid = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: 'paid', paidAt: new Date() },
      include: { items: true },
    });

    await logBookKeeping(
      req.user.id,
      'invoices',
      'invoice',
      req.params.id,
      'PAID',
      `Invoice ${invoice.invoiceNumber} marked as paid`,
      { invoiceNumber: invoice.invoiceNumber, total: invoice.total },
      req.user.name || req.user.role,
    );

    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

// =================== EXPENSES ===================

exports.getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id };
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.expense.count({ where }),
    ]);
    res.json({ success: true, ...paginateResult(expenses, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};

exports.createExpense = async (req, res, next) => {
  try {
    const expense = await prisma.expense.create({
      data: { ...req.body, userId: req.user.id },
    });

    await logBookKeeping(
      req.user.id,
      'expenses',
      'expense',
      expense.id,
      'CREATED',
      `Expense recorded: ${expense.description}`,
      { description: expense.description, amount: expense.amount, category: expense.category },
      req.user.name || req.user.role,
    );

    res.status(201).json({ success: true, data: expense });
  } catch (err) { next(err); }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: req.body,
    });

    await logBookKeeping(
      req.user.id,
      'expenses',
      'expense',
      req.params.id,
      'UPDATED',
      `Expense updated: ${expense.description}`,
      { description: expense.description, amount: expense.amount },
      req.user.name || req.user.role,
    );

    res.json({ success: true, data: expense });
  } catch (err) { next(err); }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    await prisma.expense.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (expense) {
      await logBookKeeping(
        req.user.id,
        'expenses',
        'expense',
        req.params.id,
        'DELETED',
        `Expense deleted: ${expense.description}`,
        { description: expense.description, amount: expense.amount },
        req.user.name || req.user.role,
      );
    }

    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) { next(err); }
};
