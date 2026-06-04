const nodemailer = require('nodemailer');

// ─── Nodemailer Transport Configuration ──────────────────────────────────────
// Using SMTP settings from .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: (process.env.SMTP_PASS || '').replace(/\s/g, ''),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('📧 SMTP Verification Failed:', error.message);
  } else {
    console.log('📧 SMTP Server is ready to take our messages');
  }
});

/**
 * Send an email using Nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 */
exports.sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_SENDER_NAME || 'My Real Customer App'}" <${process.env.EMAIL_SENDER_ADDRESS || process.env.SMTP_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Email delivery failed to ${to}`);
    console.error(`   Error Message: ${err.message}`);
    
    // Provide helpful hints for common SMTP errors
    if (err.message.includes('EAUTH')) {
      console.error('   ► FIX: SMTP Authentication failed. Check SMTP_USER and SMTP_PASS in .env');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('   ► FIX: Connection refused. Check SMTP_HOST and SMTP_PORT in .env');
    }
    
    throw err;
  }
};
