const { prisma } = require('../config/db');
const { ROLES } = require('../middleware/auth');

// ─── GET /book-keeping ─────────────────────────────────────────────────────────
exports.getBookKeeping = async (req, res, next) => {
  try {
    console.log('[BookKeeping] GET /book-keeping', {
      userId: req.user.id,
      role: req.user.role,
      query: req.query,
    });

    const { module, entityType, action, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};

    if (req.user.role !== ROLES.AUDITOR && req.user.role !== ROLES.ADMIN) {
      where.userId = req.user.id;
    }

    if (module) where.module = module;
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;

    const [records, total] = await Promise.all([
      prisma.bookKeeping.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.bookKeeping.count({ where }),
    ]);

    console.log('[BookKeeping] Found records:', total);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    console.error('[BookKeeping] GET error:', err);
    next(err);
  }
};

// ─── POST /book-keeping ───────────────────────────────────────────────────────
exports.createBookKeeping = async (req, res, next) => {
  try {
    const { module, entityType, entityId, action, description, metadata, performedBy } = req.body;

    if (!module || !entityType || !entityId || !action || !description) {
      return res.status(400).json({ success: false, message: 'module, entityType, entityId, action and description are required' });
    }

    const record = await prisma.bookKeeping.create({
      data: {
        userId: req.user.id,
        module,
        entityType,
        entityId,
        action,
        description,
        metadata: metadata || {},
        performedBy: performedBy || req.user.name || req.user.role,
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

// ─── GET /book-keeping/summary ────────────────────────────────────────────────
exports.getBookKeepingSummary = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = {};

    if (req.user.role !== ROLES.AUDITOR && req.user.role !== ROLES.ADMIN) {
      where.userId = req.user.id;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [totalRecords, byModule, recent] = await Promise.all([
      prisma.bookKeeping.count({ where }),
      prisma.bookKeeping.groupBy({
        by: ['module'],
        where,
        _count: { module: true },
      }),
      prisma.bookKeeping.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalRecords,
        byModule: byModule.map(m => ({ module: m.module, count: m._count.module })),
        recent,
      },
    });
  } catch (err) { next(err); }
};
