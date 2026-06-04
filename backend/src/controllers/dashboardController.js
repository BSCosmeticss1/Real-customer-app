const { prisma } = require('../config/db');

// @route GET /dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [
      totalContacts,
      messagesSent,
      pendingMessages,
      failedMessages,
      paidInvoices,
      totalExpensesAgg,
      lowStockItems,
    ] = await Promise.all([
      prisma.contact.count({ where: { userId, isActive: true } }),
      prisma.messageLog.count({ where: { userId, status: 'sent' } }),
      prisma.messageLog.count({ where: { userId, status: 'pending' } }),
      prisma.messageLog.count({ where: { userId, status: 'failed' } }),
      prisma.invoice.findMany({ where: { userId, status: 'paid' } }),
      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      // For low stock items, Prisma doesn't support $expr directly in where
      // We can use queryRaw or findMany and filter (if small set) or use specific field
      prisma.product.findMany({
        where: { userId, isActive: true },
      }),
    ]);

    const totalRevenue = paidInvoices.reduce((s, inv) => s + inv.total, 0);
    const expensesTotal = totalExpensesAgg._sum.amount || 0;
    
    // Manual filter for low stock items since we can't do column comparison in Prisma easily without raw SQL
    const lowStockCount = lowStockItems.filter(p => p.quantity <= p.reorderLevel).length;

    res.json({
      success: true,
      data: {
        totalContacts,
        messagesSent,
        pendingMessages,
        failedMessages,
        totalRevenue,
        totalExpenses: expensesTotal,
        netCashFlow: totalRevenue - expensesTotal,
        lowStockItems: lowStockCount,
      },
    });
  } catch (err) { next(err); }
};

// @route GET /dashboard/activity
exports.getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const logs = await prisma.messageLog.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: 10,
      include: { contact: { select: { name: true } } },
    });
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};

// @route GET /dashboard/cashflow
exports.getCashFlow = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const months = 6;

    const cashFlow = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);

      const [incomeData, expenseData] = await Promise.all([
        prisma.invoice.aggregate({
          where: { userId, status: 'paid', paidAt: { gte: start, lte: end } },
          _sum: { total: true },
        }),
        prisma.expense.aggregate({
          where: { userId, date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ]);

      cashFlow.push({
        month: date.toLocaleString('default', { month: 'short' }),
        income: incomeData._sum.total || 0,
        expenses: expenseData._sum.amount || 0,
      });
    }

    res.json({ success: true, data: cashFlow });
  } catch (err) { next(err); }
};
