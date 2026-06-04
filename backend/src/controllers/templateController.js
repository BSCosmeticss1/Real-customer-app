const { prisma } = require('../config/db');
const { paginateResult } = require('../middleware/paginate');

exports.getTemplates = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, platform } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id, isActive: true };
    if (platform) {
      where.platform = { in: [platform, 'all'] };
    }

    const [templates, total] = await Promise.all([
      prisma.messageTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.messageTemplate.count({ where }),
    ]);
    res.json({ success: true, ...paginateResult(templates, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};

exports.getTemplate = async (req, res, next) => {
  try {
    const template = await prisma.messageTemplate.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: template });
  } catch (err) { next(err); }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const { content } = req.body;
    // Auto-extract variables like {{FirstName}}
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    const variables = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];

    const template = await prisma.messageTemplate.create({
      data: { ...req.body, variables, userId: req.user.id },
    });
    res.status(201).json({ success: true, data: template });
  } catch (err) { next(err); }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const { content } = req.body;
    const data = { ...req.body };
    
    if (content) {
      const matches = content.match(/\{\{(\w+)\}\}/g) || [];
      data.variables = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
    }

    const template = await prisma.messageTemplate.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: template });
  } catch (err) { next(err); }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    await prisma.messageTemplate.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ success: true, message: 'Template deleted' });
  } catch (err) { next(err); }
};
