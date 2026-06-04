const express = require('express');
const router  = express.Router();
const {
  register, login, getMe, updateProfile, changePassword,
  forgotPassword, verifyOTP, resetPassword, resendOTP, updateApiKeys,
  verifyEmail, resendVerificationOTP, firstTimePasswordChange
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register',            register);
router.post('/login',               login);
router.post('/forgot-password',     forgotPassword);
router.post('/verify-otp',          verifyOTP);
router.post('/reset-password',      resetPassword);
router.post('/resend-otp',          resendOTP);
router.post('/verify-email',        verifyEmail);
router.post('/resend-verification', resendVerificationOTP);

// ── Protected ─────────────────────────────────────────────────────────────────
router.use(protect);
router.get('/me',                   getMe);
router.put('/profile',              updateProfile);
router.put('/change-password',      changePassword);
router.put('/first-password-change', firstTimePasswordChange);
router.put('/api-keys', adminOnly,  updateApiKeys);

module.exports = router;
