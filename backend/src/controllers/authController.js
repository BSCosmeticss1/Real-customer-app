const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const { sendEmail } = require('../services/emailService');

// Roles
const ROLES = {
  ADMIN: 'ADMIN',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  MESSAGING_MANAGER: 'MESSAGING_MANAGER',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  delete user.password;
  res.status(statusCode).json({ success: true, data: { token, user } });
};

// ─── PUBLIC: Register ────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password manually
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: ROLES.ADMIN,
        verificationOTP,
        verificationExpires,
      },
    });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#4F46E5">Verify Your Email</h2>
        <p>Hi ${name}, welcome to My Real Customer App! Please use the code below to verify your email address:</p>
        <h1 style="color:#4F46E5;font-size:40px;letter-spacing:8px;margin:20px 0">${verificationOTP}</h1>
        <p>This code expires in 15 minutes.</p>
      </div>`;
    await sendEmail(user.email, 'Verify Your Email — My Real Customer App', html);

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── PUBLIC: Verify Email ─────────────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        verificationOTP: otp,
        verificationExpires: { gt: new Date() },
      },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationOTP: null,
        verificationExpires: null,
        onboardingStatus: 'VERIFIED',
      },
    });

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (err) { next(err); }
};

// ─── PUBLIC: Resend Verification OTP ──────────────────────────────────────────
exports.resendVerificationOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationOTP: otp,
        verificationExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const html = `<p>Your new verification code is: <strong>${otp}</strong></p>`;
    await sendEmail(user.email, 'Verification Code Resent', html);

    res.status(200).json({ success: true, message: 'Verification code sent' });
  } catch (err) { next(err); }
};

// ─── PUBLIC: Login ────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact your administrator.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    sendToken(updatedUser, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── PROTECTED: Get current user ──────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

// ─── PROTECTED: Update profile ────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, settings, bankDetails, notificationPrefs } = req.body;
    const data = {};

    if (name) data.name = name;
    if (email) data.email = email.toLowerCase();

    if (req.user.role === ROLES.ADMIN) {
      if (settings)           data.settings           = { ...(req.user.settings || {}), ...settings };
      if (bankDetails)        data.bankDetails        = bankDetails;
      if (notificationPrefs)  data.notificationPrefs  = notificationPrefs;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── PROTECTED: Change password ───────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── PROTECTED (admin only): Update API keys ──────────────────────────────────
exports.updateApiKeys = async (req, res, next) => {
  try {
    const { whatsappToken, whatsappPhoneId, facebookToken, facebookPageId, instagramToken, paystackKey } = req.body;
    
    const currentApiKeys = req.user.apiKeys || {};
    const newApiKeys = { ...currentApiKeys };

    if (whatsappToken)   newApiKeys.whatsappToken   = whatsappToken;
    if (whatsappPhoneId) newApiKeys.whatsappPhoneId = whatsappPhoneId;
    if (facebookToken)   newApiKeys.facebookToken   = facebookToken;
    if (facebookPageId)  newApiKeys.facebookPageId  = facebookPageId;
    if (instagramToken)  newApiKeys.instagramToken  = instagramToken;
    if (paystackKey)     newApiKeys.paystackKey     = paystackKey;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { apiKeys: newApiKeys },
    });

    res.status(200).json({ success: true, message: 'API keys updated' });
  } catch (err) {
    next(err);
  }
};

// ─── PUBLIC: Forgot password ──────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOTP: otp,
        resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#4F46E5">Password Reset Request</h2>
        <p>Hi ${user.name}, your one-time password is:</p>
        <h1 style="color:#4F46E5;font-size:40px;letter-spacing:8px;margin:20px 0">${otp}</h1>
        <p>Expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
      </div>`;
    await sendEmail(user.email, 'Password Reset OTP — My Real Customer App', html);

    res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (err) { next(err); }
};

// ─── PUBLIC: Verify OTP ───────────────────────────────────────────────────────
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        resetPasswordOTP: otp,
        resetPasswordExpires: { gt: new Date() },
      },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (err) { next(err); }
};

// ─── PUBLIC: Reset password ───────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        resetPasswordOTP: otp,
        resetPasswordExpires: { gt: new Date() },
      },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordOTP: null,
        resetPasswordExpires: null,
      },
    });

    res.status(200).json({ success: true, message: 'Password reset successfully. You may now log in.' });
  } catch (err) { next(err); }
};

// ─── PROTECTED: First time password change ────────────────────────────────────
exports.firstTimePasswordChange = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

// ─── PUBLIC: Resend OTP (for Password Reset) ──────────────────────────────────
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOTP: otp,
        resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const html = `<p>Your new password reset code is: <strong>${otp}</strong></p>`;
    await sendEmail(user.email, 'Password Reset OTP Resent', html);

    res.status(200).json({ success: true, message: 'OTP resent to your email' });
  } catch (err) { next(err); }
};
