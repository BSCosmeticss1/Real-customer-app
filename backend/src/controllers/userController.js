const { prisma } = require('../config/db');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const ROLES = {
  ADMIN: 'ADMIN',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  MESSAGING_MANAGER: 'MESSAGING_MANAGER',
};

const ROLE_LABELS = {
  ADMIN: 'Administrator',
  INVENTORY_MANAGER: 'Inventory Manager',
  FINANCE_MANAGER: 'Finance Manager',
  MESSAGING_MANAGER: 'Messaging Manager',
};

const ROLE_DESCRIPTIONS = {
  INVENTORY_MANAGER: 'Access to Products and Stock Movements only',
  FINANCE_MANAGER: 'Access to Invoices, Expenses and Cash Flow only',
  MESSAGING_MANAGER: 'Access to Messaging, Contacts and Templates only',
};

const ROLE_PERMISSIONS = {
  ADMIN: ['*'],
  INVENTORY_MANAGER: ['inventory', 'stock_movements'],
  FINANCE_MANAGER: ['invoices', 'expenses', 'cashflow', 'dashboard'],
  MESSAGING_MANAGER: ['messaging', 'contacts', 'templates', 'logs'],
};

const ALL_SUB_MODULES = [
  "messaging", "sms", "email", "automation",
  "contacts", "inventory",
  "book-keeping", "sales-reporting", "analytics"
];

const PLAN_MODULES = {
  standard: ["messaging", "contacts", "book-keeping", "sales-reporting", "email"],
  premium: ALL_SUB_MODULES,
  enterprise: ALL_SUB_MODULES,
};

const PLAN_LIMITS = {
  standard: { users: 3, contacts: 1000, messages: 5000 },
  premium: { users: 10, contacts: 10000, messages: 50000 },
  enterprise: { users: 999, contacts: 99999, messages: 999999 },
};

const getPlanLimits = (user) => {
  const plan = user?.subscription?.plan || 'premium';
  return PLAN_LIMITS[plan] || PLAN_LIMITS.premium;
};

const getUserModules = (user) => {
  const plan = user?.subscription?.plan;
  if (plan && PLAN_MODULES[plan]) return PLAN_MODULES[plan];
  return user?.allowedFeatures || PLAN_MODULES.premium;
};

// ─── GET /users ───────────────────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      id: { not: req.user.id },
      createdBy: req.user.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role && ROLES[role.toUpperCase()]) {
      where.role = role.toUpperCase();
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    // Remove passwords
    users.forEach(u => delete u.password);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /users/roles ─────────────────────────────────────────────────────────
exports.getRoles = async (req, res) => {
  const roles = Object.entries(ROLE_LABELS)
    .filter(([key]) => key !== ROLES.ADMIN)
    .map(([value, label]) => ({
      value,
      label,
      description: ROLE_DESCRIPTIONS[value],
      permissions: ROLE_PERMISSIONS[value],
    }));
  res.json({ success: true, data: roles });
};

// ─── POST /users ─────────────────────────────────────────────────────────────
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, role, allowedFeatures } = req.body;
    const normalizedRole = role ? role.toUpperCase() : null;

    if (!name || !email || !normalizedRole) {
      return res.status(400).json({ success: false, message: 'Name, email and role are required' });
    }
    if (!ROLES[normalizedRole] || normalizedRole === ROLES.ADMIN) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Choose: ${Object.keys(ROLES).filter(r => r !== ROLES.ADMIN).join(', ')}`,
      });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const admin = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { subscription: true, allowedFeatures: true }
    });

    const limits = getPlanLimits(admin);
    const currentUserCount = await prisma.user.count({
      where: { createdBy: req.user.id, role: { not: 'ADMIN' } }
    });

    if (limits.users !== 999 && currentUserCount >= limits.users) {
      return res.status(403).json({ 
        success: false, 
        message: `User limit reached. Your ${admin?.subscription?.plan || 'current'} plan allows up to ${limits.users} users. Please upgrade your plan to add more team members.` 
      });
    }

    let adminModules = [];
    if (admin?.subscription?.plan && PLAN_MODULES[admin.subscription.plan]) {
      adminModules = PLAN_MODULES[admin.subscription.plan];
    } else if (admin?.allowedFeatures && Array.isArray(admin.allowedFeatures)) {
      adminModules = admin.allowedFeatures;
    } else {
      adminModules = PLAN_MODULES.premium;
    }

    const requestedModules = Array.isArray(allowedFeatures) ? allowedFeatures : [];
    const validModules = requestedModules.filter((m) => adminModules.includes(m));

    const tempPassword = crypto.randomBytes(5).toString('hex') + 'A1!';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: normalizedRole,
        createdBy: req.user.id,
        isActive: true,
        mustChangePassword: true,
        onboardingStatus: 'COMPLETED',
        isVerified: true,
        allowedFeatures: validModules,
      },
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .email-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8fafc;
            padding: 40px 20px;
          }
          .content-card {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #4f46e5;
            margin-bottom: 30px;
            text-align: center;
          }
          .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 16px;
            text-align: center;
          }
          .description {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 32px;
            text-align: center;
          }
          .credentials-box {
            background-color: #f1f5f9;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          .credential-item {
            margin-bottom: 12px;
            font-size: 14px;
          }
          .credential-label {
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: block;
            margin-bottom: 4px;
          }
          .credential-value {
            font-family: 'Courier New', Courier, monospace;
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
          }
          .cta-button {
            display: block;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 32px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="content-card">
            <div class="logo">Real Customer App</div>
            <h1 class="welcome-text">Welcome to the team, ${name}! 👋</h1>
            <p class="description">
              <strong>${req.user.name}</strong> from <strong>${req.user.settings?.businessName || 'your organization'}</strong> has invited you to join their workspace.
            </p>
            
            <div class="credentials-box">
              <div class="credential-item">
                <span class="credential-label">Your Email</span>
                <span class="credential-value">${email}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">Temporary Password</span>
                <span class="credential-value">${tempPassword}</span>
              </div>
            </div>

            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="cta-button">
              Access Your Workspace
            </a>

            <p style="font-size: 13px; color: #64748b; text-align: center;">
              Note: You will be required to change this password when you first log in for security purposes.
            </p>
          </div>
          <div class="footer" style="margin-top: 24px;">
            &copy; ${new Date().getFullYear()} Real Customer App. All rights reserved.
          </div>
        </div>
      </body>
      </html>`;

    sendEmail(email, `You've been added to My Real Customer App`, html).catch(err =>
      console.warn('⚠️ Welcome email failed:', err.message)
    );

    delete user.password;
    res.status(201).json({
      success: true,
      message: `User created. Login credentials sent to ${email}`,
      data: user,
    });
  } catch (err) { next(err); }
};

// ─── GET /users/:id ───────────────────────────────────────────────────────────
exports.getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, createdBy: req.user.id },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    delete user.password;
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// ─── PUT /users/:id ───────────────────────────────────────────────────────────
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, allowedFeatures } = req.body;
    const normalizedRole = role ? role.toUpperCase() : null;

    const user = await prisma.user.findFirst({
      where: { id: req.params.id, createdBy: req.user.id },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (normalizedRole && (normalizedRole === ROLES.ADMIN || !ROLES[normalizedRole])) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const admin = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { subscription: true, allowedFeatures: true }
    });

    let adminModules = [];
    if (admin?.subscription?.plan && PLAN_MODULES[admin.subscription.plan]) {
      adminModules = PLAN_MODULES[admin.subscription.plan];
    } else if (admin?.allowedFeatures && Array.isArray(admin.allowedFeatures)) {
      adminModules = admin.allowedFeatures;
    } else {
      adminModules = PLAN_MODULES.premium;
    }

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email.toLowerCase();
    if (normalizedRole) data.role = normalizedRole;
    if (allowedFeatures !== undefined) {
      const requestedModules = Array.isArray(allowedFeatures) ? allowedFeatures : [];
      data.allowedFeatures = requestedModules.filter((m) => adminModules.includes(m));
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });
    delete updated.password;
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// ─── PUT /users/:id/toggle-status ─────────────────────────────────────────────
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, createdBy: req.user.id },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: !user.isActive },
    });

    delete updated.password;
    res.json({
      success: true,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    });
  } catch (err) { next(err); }
};

// ─── PUT /users/:id/reset-password ─────────────────────────────────────────────
exports.resetUserPassword = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, createdBy: req.user.id },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const tempPassword = crypto.randomBytes(5).toString('hex') + 'A1!';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    const html = `<p>Your password has been reset to: <strong>${tempPassword}</strong></p>`;
    sendEmail(user.email, 'Password Reset', html).catch(err => console.warn('⚠️ Email failed:', err.message));

    res.json({ success: true, message: 'Password reset successful. Credentials sent to user.' });
  } catch (err) { next(err); }
};

// ─── DELETE /users/:id ────────────────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, createdBy: req.user.id },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) { next(err); }
};
