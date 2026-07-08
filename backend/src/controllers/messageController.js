const { prisma } = require('../config/db');
const { sendMessage } = require('../services/messagingService');
const { sendEmail } = require('../services/emailService');
const { paginateResult } = require('../middleware/paginate');
const schedule = require('node-schedule');

// Store scheduled jobs in memory
const scheduledJobs = {};

// @route POST /messages/send
exports.sendNow = async (req, res, next) => {
  console.log('[sendNow] Starting send...');
  console.log('[sendNow] Request body:', req.body);
  try {
    const { platform, content, contacts: contactIds } = req.body;
    if (!platform || !content || !contactIds?.length) {
      console.error('[sendNow] ERROR: Missing required fields');
      return res.status(400).json({ success: false, message: 'platform, content, and contacts are required' });
    }

    console.log('[sendNow] Fetching user with id:', req.user.id);
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    console.log('[sendNow] User found:', user?.id);
    
    console.log('[sendNow] Fetching contacts with ids:', contactIds);
    const contacts = await prisma.contact.findMany({
      where: { id: { in: contactIds }, userId: req.user.id },
    });
    console.log('[sendNow] Contacts found:', contacts.length);

    const results = { sent: 0, failed: 0 };
    const logs = [];

    for (const contact of contacts) {
      console.log(`[sendNow] Processing contact: ${contact.name} (${contact.id})`);
      const logData = {
        userId: req.user.id,
        contactId: contact.id,
        contactName: contact.name,
        platform,
        content,
        status: 'pending',
      };
      try {
        console.log(`[sendNow] Calling sendMessage for ${contact.name}...`);
        const result = await sendMessage(platform, contact, content, user.apiKeys);
        console.log(`[sendNow] Success for ${contact.name}!`);
        logData.status = 'sent';
        logData.externalId = result?.messages?.[0]?.id || result?.messageId;
        results.sent++;
      } catch (err) {
        console.error(`[sendNow] Failed for ${contact.name}:`, err.message);
        logData.status = 'failed';
        logData.error = err.message;
        results.failed++;
      }
      logs.push(logData);
    }

    console.log('[sendNow] Creating message logs...');
    await prisma.messageLog.createMany({
      data: logs,
    });
    
    console.log('[sendNow] Done! Results:', results);
    res.json({ success: true, data: results, message: `Sent: ${results.sent}, Failed: ${results.failed}` });
  } catch (err) {
    console.error('[sendNow] Unhandled error:', err);
    next(err);
  }
};

// @route POST /messages/schedule
exports.scheduleMessage = async (req, res, next) => {
  try {
    const { platform, content, contacts: contactIds, scheduledAt, recurrence, templateId } = req.body;
    if (!platform || !content || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'platform, content, and scheduledAt are required' });
    }

    const scheduled = await prisma.scheduledMessage.create({
      data: {
        userId: req.user.id,
        platform,
        content,
        scheduledAt: new Date(scheduledAt),
        recurrence: recurrence || 'none',
        templateId,
        status: 'pending',
        contacts: {
          connect: (contactIds || []).map(id => ({ id })),
        },
      },
      include: { contacts: true },
    });

    // Schedule the job
    scheduleJob(scheduled, req.user.id);

    res.status(201).json({ success: true, data: scheduled });
  } catch (err) { next(err); }
};

// Helper: schedule a job
const scheduleJob = (scheduledMsg, userId) => {
  const date = new Date(scheduledMsg.scheduledAt);
  if (date <= new Date()) return; // already past

  const job = schedule.scheduleJob(scheduledMsg.id, date, async () => {
    await executeScheduledMessage(scheduledMsg.id, userId);

    if (scheduledMsg.recurrence !== 'none') {
      const next = getNextRunDate(scheduledMsg.recurrence, date);
      const updated = await prisma.scheduledMessage.update({
        where: { id: scheduledMsg.id },
        data: { scheduledAt: next, nextRunAt: next },
        include: { contacts: true },
      });
      scheduleJob(updated, userId);
    }
  });

  scheduledJobs[scheduledMsg.id] = job;
};

const getNextRunDate = (recurrence, from) => {
  const d = new Date(from);
  if (recurrence === 'daily') d.setDate(d.getDate() + 1);
  else if (recurrence === 'weekly') d.setDate(d.getDate() + 7);
  else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
  return d;
};

const executeScheduledMessage = async (scheduledMsgId, userId) => {
  try {
    const scheduledMsg = await prisma.scheduledMessage.findUnique({
      where: { id: scheduledMsgId },
      include: { contacts: true },
    });
    
    if (!scheduledMsg || scheduledMsg.status === 'cancelled') return;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const contacts = scheduledMsg.contacts.filter(c => c.isActive);

    const logs = [];
    for (const contact of contacts) {
      const logData = {
        userId: userId,
        contactId: contact.id,
        contactName: contact.name,
        platform: scheduledMsg.platform,
        content: scheduledMsg.content,
        scheduledMessageId: scheduledMsgId,
        status: 'pending',
      };
      try {
        const result = await sendMessage(scheduledMsg.platform, contact, scheduledMsg.content, user?.apiKeys);
        logData.status = 'sent';
        logData.externalId = result?.messages?.[0]?.id || result?.messageId;
      } catch (err) {
        logData.status = 'failed';
        logData.error = err.message;
      }
      logs.push(logData);
    }

    if (logs.length > 0) {
      await prisma.messageLog.createMany({ data: logs });
    }
    
    const failedCount = logs.filter(l => l.status === 'failed').length;
    await prisma.scheduledMessage.update({
      where: { id: scheduledMsgId },
      data: {
        status: scheduledMsg.recurrence === 'none' ? (failedCount === logs.length ? 'failed' : 'sent') : 'pending',
        lastRunAt: new Date(),
      },
    });
  } catch (err) {
    console.error('Error executing scheduled message:', err);
  }
};

// Initialize scheduled jobs on server start
exports.initScheduledJobs = async () => {
  try {
    const pending = await prisma.scheduledMessage.findMany({
      where: { status: 'pending', scheduledAt: { gt: new Date() } },
      include: { contacts: true },
    });
    for (const msg of pending) {
      scheduleJob(msg, msg.userId);
    }
    console.log(`✅ Initialized ${pending.length} scheduled message job(s)`);
  } catch (err) {
    console.error('Failed to init scheduled jobs:', err);
  }
};

// @route GET /messages/scheduled
exports.getScheduled = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id };
    const [messages, total] = await Promise.all([
      prisma.scheduledMessage.findMany({
        where,
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: Number(limit),
        include: { template: { select: { name: true } } },
      }),
      prisma.scheduledMessage.count({ where }),
    ]);
    res.json({ success: true, ...paginateResult(messages, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};

// @route DELETE /messages/scheduled/:id
exports.cancelScheduled = async (req, res, next) => {
  try {
    const msg = await prisma.scheduledMessage.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { status: 'cancelled' },
    });
    
    if (msg.count === 0) return res.status(404).json({ success: false, message: 'Scheduled message not found' });
    
    // Cancel the in-memory job
    if (scheduledJobs[req.params.id]) {
      scheduledJobs[req.params.id].cancel();
      delete scheduledJobs[req.params.id];
    }
    res.json({ success: true, message: 'Scheduled message cancelled' });
  } catch (err) { next(err); }
};

// @route POST /messages/sms/send
exports.sendSMS = async (req, res, next) => {
  try {
    const { content, contacts: contactIds, phoneNumbers } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'content is required' });
    }

    const parsedContactIds = Array.isArray(contactIds) ? contactIds : [];
    const parsedNumbers = Array.isArray(phoneNumbers) ? phoneNumbers : [];

    if (parsedContactIds.length === 0 && parsedNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one contact or phone number',
      });
    }

    // Resolve contacts owned by the user
    const contacts = parsedContactIds.length
      ? await prisma.contact.findMany({
          where: { id: { in: parsedContactIds }, userId: req.user.id },
        })
      : [];

    const seen = new Set();
    const recipients = [];

    for (const c of contacts) {
      const phone = c.phone || c.whatsapp;
      if (!phone) continue;
      const normalized = String(phone).replace(/[\s\-\(\)\.]/g, '').replace(/^\+/, '');
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      recipients.push({ phone, contactId: c.id, contactName: c.name });
    }

    for (const raw of parsedNumbers) {
      const phone = String(raw).trim();
      if (!phone) continue;
      const normalized = phone.replace(/[\s\-\(\)\.]/g, '').replace(/^\+/, '');
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      recipients.push({ phone, contactId: null, contactName: phone });
    }

    if (recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid phone numbers found' });
    }

    const results = { sent: 0, failed: 0 };
    const logs = [];

    for (const recipient of recipients) {
      const logData = {
        userId: req.user.id,
        contactId: recipient.contactId,
        contactName: recipient.contactName,
        platform: 'sms',
        content,
        status: 'pending',
      };
      try {
        const result = await sendMessage('sms', { phone: recipient.phone }, content, null);
        logData.status = 'sent';
        logData.externalId = result?.messageId;
        results.sent++;
      } catch (err) {
        logData.status = 'failed';
        logData.error = err.message;
        results.failed++;
      }
      logs.push(logData);
    }

    await prisma.messageLog.createMany({ data: logs });

    res.json({
      success: true,
      data: results,
      message: `SMS Sent: ${results.sent}, Failed: ${results.failed}`,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /messages/email/send
exports.sendEmail = async (req, res, next) => {
  try {
    const { subject, content, contacts: contactIds, emails } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ success: false, message: 'subject and content are required' });
    }

    const parsedContactIds = Array.isArray(contactIds) ? contactIds : [];
    const parsedEmails = Array.isArray(emails) ? emails : [];

    if (parsedContactIds.length === 0 && parsedEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one contact or email address',
      });
    }

    const contacts = parsedContactIds.length
      ? await prisma.contact.findMany({
          where: { id: { in: parsedContactIds }, userId: req.user.id },
        })
      : [];

    const seen = new Set();
    const recipients = [];

    for (const c of contacts) {
      if (!c.email) continue;
      const normalized = String(c.email).trim().toLowerCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      recipients.push({ email: c.email, contactId: c.id, contactName: c.name });
    }

    for (const raw of parsedEmails) {
      const email = String(raw).trim();
      if (!email) continue;
      const normalized = email.toLowerCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      recipients.push({ email, contactId: null, contactName: email });
    }

    if (recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid email addresses found' });
    }

    const html = content
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    const results = { sent: 0, failed: 0 };
    const logs = [];

    for (const recipient of recipients) {
      const logData = {
        userId: req.user.id,
        contactId: recipient.contactId,
        contactName: recipient.contactName,
        platform: 'email',
        content,
        status: 'pending',
      };
      try {
        await sendEmail(recipient.email, subject, html);
        logData.status = 'sent';
        results.sent++;
      } catch (err) {
        logData.status = 'failed';
        logData.error = err.message;
        results.failed++;
      }
      logs.push(logData);
    }

    await prisma.messageLog.createMany({ data: logs });

    res.json({
      success: true,
      data: results,
      message: `Email Sent: ${results.sent}, Failed: ${results.failed}`,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /messages/email/logs
exports.getEmailLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id, platform: 'email' };
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
      prisma.messageLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: Number(limit),
        include: { contact: { select: { name: true } } },
      }),
      prisma.messageLog.count({ where }),
    ]);
    res.json({ success: true, ...paginateResult(logs, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};

// @route GET /messages/sms/logs
exports.getSMSLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id, platform: 'sms' };
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
      prisma.messageLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: Number(limit),
        include: { contact: { select: { name: true } } },
      }),
      prisma.messageLog.count({ where }),
    ]);
    res.json({ success: true, ...paginateResult(logs, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};

// @route GET /messages/logs
exports.getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, platform, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (platform) where.platform = platform;
    if (startDate || endDate) {
      where.sentAt = {};
      if (startDate) where.sentAt.gte = new Date(startDate);
      if (endDate) where.sentAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.messageLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: Number(limit),
        include: { contact: { select: { name: true, company: true } } },
      }),
      prisma.messageLog.count({ where }),
    ]);
    res.json({ success: true, ...paginateResult(logs, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};
