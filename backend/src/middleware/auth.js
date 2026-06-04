const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

// Roles (copied from the Prisma schema or a common file)
const ROLES = {
  ADMIN: 'ADMIN',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  MESSAGING_MANAGER: 'MESSAGING_MANAGER',
};

// ─── Attach user from JWT ─────────────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find user using Prisma
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Remove password for security
    delete req.user.password;
    
    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact your administrator.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized — token invalid' });
  }
};

// ─── Admin only ───────────────────────────────────────────────────────────────
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// ─── Allow specific roles (admin always passes) ───────────────────────────────
exports.requireRole = (...roles) => (req, res, next) => {
  if (req.user.role === ROLES.ADMIN) return next();
  if (roles.includes(req.user.role)) return next();
  return res.status(403).json({
    success: false,
    message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
  });
};

exports.authorize = (...roles) => exports.requireRole(...roles);
