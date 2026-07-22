const { prisma } = require('../config/db');
const { paginateResult } = require('../middleware/paginate');
const csv = require('csv-parser');
const fs = require('fs');
const { getPlanLimits } = require('./userController');

// @route GET /contacts
exports.getContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, segment, tags } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { userId: req.user.id, isActive: true };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (segment) where.segment = segment;
    if (tags) {
      where.tags = { hasSome: tags.split(',') };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({ success: true, ...paginateResult(contacts, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};

// @route GET /contacts/:id
exports.getContact = async (req, res, next) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (err) { next(err); }
};

// @route POST /contacts
exports.createContact = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { subscription: true }
    });
    const limits = getPlanLimits(user);
    const contactCount = await prisma.contact.count({ where: { userId: req.user.id } });
    
    if (limits.contacts !== 99999 && contactCount >= limits.contacts) {
      return res.status(403).json({ 
        success: false, 
        message: `Contact limit reached. Your ${user?.subscription?.plan || 'current'} plan allows up to ${limits.contacts.toLocaleString()} contacts. Please upgrade your plan to add more contacts.` 
      });
    }

    const contact = await prisma.contact.create({
      data: { ...req.body, userId: req.user.id },
    });
    res.status(201).json({ success: true, data: contact });
  } catch (err) { next(err); }
};

// @route PUT /contacts/:id
exports.updateContact = async (req, res, next) => {
  try {
    const contact = await prisma.contact.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body,
    });
    
    if (contact.count === 0) return res.status(404).json({ success: false, message: 'Contact not found' });
    
    const updatedContact = await prisma.contact.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updatedContact });
  } catch (err) { next(err); }
};

// @route DELETE /contacts/:id
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await prisma.contact.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (contact.count === 0) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) { next(err); }
};

// @route POST /contacts/import
exports.importContacts = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { subscription: true }
    });
    const limits = getPlanLimits(user);
    const contactCount = await prisma.contact.count({ where: { userId: req.user.id } });
    const newContacts = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          const contact = {
            userId: req.user.id,
            name: row.name || row.Name || row.full_name || '',
            company: row.company || row.Company || '',
            email: row.email || row.Email || '',
            phone: row.phone || row.Phone || row.mobile || '',
            whatsapp: row.whatsapp || row.WhatsApp || row.whatsapp_number || '',
            facebook: row.facebook || row.Facebook || '',
            instagram: row.instagram || row.Instagram || '',
            tiktok: row.tiktok || row.TikTok || '',
            segment: row.segment || row.Segment || '',
            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
            source: 'import',
          };
          if (contact.name) newContacts.push(contact);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (limits.contacts !== 99999 && contactCount + newContacts.length > limits.contacts) {
      return res.status(403).json({ 
        success: false, 
        message: `Contact limit would be exceeded. Your ${user?.subscription?.plan || 'current'} plan allows up to ${limits.contacts.toLocaleString()} contacts. You currently have ${contactCount.toLocaleString()} contacts and are trying to import ${newContacts.length} more. Please upgrade your plan.` 
      });
    }

    // Upsert contacts
    let imported = 0;
    for (const c of newContacts) {
      // Find existing contact by phone, email, or name
      const existing = await prisma.contact.findFirst({
        where: {
          userId: req.user.id,
          OR: [
            c.phone ? { phone: c.phone } : null,
            c.email ? { email: c.email } : null,
            c.name ? { name: c.name } : null,
          ].filter(Boolean),
        },
      });

      if (existing) {
        await prisma.contact.update({
          where: { id: existing.id },
          data: c,
        });
      } else {
        await prisma.contact.create({
          data: c,
        });
      }
      imported++;
    }

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({ success: true, data: { imported, errors: 0 } });
  } catch (err) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    next(err);
  }
};

// @route GET /contacts/export
exports.exportContacts = async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.user.id, isActive: true },
    });
    const headers = 'name,company,email,phone,whatsapp,facebook,instagram,tiktok,segment,tags\n';
    const rows = contacts.map(c =>
      [c.name, c.company, c.email, c.phone, c.whatsapp, c.facebook, c.instagram, c.tiktok, c.segment, (c.tags || []).join(';')]
        .map(v => `"${(v || '').replace(/"/g, '""')}"`)
        .join(',')
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(headers + rows);
  } catch (err) { next(err); }
};
