const { prisma } = require('../config/db');

// Get all sales reports for a user
exports.getSalesReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, customerName } = req.query;

    const where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    if (customerName) {
      where.customerName = { contains: String(customerName), mode: 'insensitive' };
    }

    const reports = await prisma.salesReport.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// Get sales report statistics
exports.getSalesStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalReports = await prisma.salesReport.count({ where: { userId } });

    const reportsLast30Days = await prisma.salesReport.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } }
    });

    const totalRevenue = reportsLast30Days.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
    const monthlyRevenue = reportsLast30Days.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

    const totalPaid = await prisma.salesReport.aggregate({
      where: { userId, paid: true },
      _sum: { amountPaid: true }
    });

    const totalBalance = await prisma.salesReport.aggregate({
      where: { userId, paid: false },
      _sum: { balance: true }
    });

    const paidCount = await prisma.salesReport.count({ where: { userId, paid: true } });
    const pendingCount = await prisma.salesReport.count({ where: { userId, paid: false } });

    res.json({
      totalReports,
      totalRevenue,
      monthlyRevenue,
      totalPaid: totalPaid._sum.amountPaid || 0,
      totalBalance: totalBalance._sum.balance || 0,
      paidCount,
      pendingCount
    });
  } catch (error) {
    next(error);
  }
};

// Create a new sales report
exports.createSalesReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      serialNumber,
      customerName,
      customerAddress,
      quantity,
      item,
      amountPaid,
      paid,
      balance,
      date,
      accountHistory
    } = req.body;

    if (!customerName || !item || !date) {
      return res.status(400).json({ success: false, message: 'customerName, item, and date are required' });
    }

    const lastReport = await prisma.salesReport.findFirst({
      where: { userId },
      orderBy: { serialNumber: 'desc' }
    });

    const nextSerial = lastReport ? lastReport.serialNumber + 1 : 1;

    const report = await prisma.salesReport.create({
      data: {
        userId,
        serialNumber: serialNumber || nextSerial,
        customerName,
        customerAddress: customerAddress || '',
        quantity: quantity || 1,
        item,
        amountPaid: amountPaid || 0,
        paid: paid || false,
        balance: balance || 0,
        date: new Date(date),
        accountHistory: accountHistory || ''
      }
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

// Update a sales report
exports.updateSalesReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      serialNumber,
      customerName,
      customerAddress,
      quantity,
      item,
      amountPaid,
      paid,
      balance,
      date,
      accountHistory
    } = req.body;

    const report = await prisma.salesReport.findFirst({
      where: { id, userId }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Sales report not found' });
    }

    const updated = await prisma.salesReport.update({
      where: { id },
      data: {
        serialNumber: serialNumber ?? report.serialNumber,
        customerName: customerName ?? report.customerName,
        customerAddress: customerAddress !== undefined ? customerAddress : report.customerAddress,
        quantity: quantity ?? report.quantity,
        item: item ?? report.item,
        amountPaid: amountPaid ?? report.amountPaid,
        paid: paid ?? report.paid,
        balance: balance ?? report.balance,
        date: date ? new Date(date) : report.date,
        accountHistory: accountHistory !== undefined ? accountHistory : report.accountHistory
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete a sales report
exports.deleteSalesReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const report = await prisma.salesReport.findFirst({
      where: { id, userId }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Sales report not found' });
    }

    await prisma.salesReport.delete({ where: { id } });

    res.json({ success: true, message: 'Sales report deleted successfully' });
  } catch (error) {
    next(error);
  }
};
