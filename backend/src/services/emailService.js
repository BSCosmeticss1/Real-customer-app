const nodemailer = require("nodemailer");

// ─── Email delivery ───────────────────────────────────────────────────────────
// Render blocks outbound SMTP (ports 465/587) to Gmail, so we deliver over HTTPS
// via Resend's REST API (port 443) when RESEND_API_KEY is set. Otherwise we fall
// back to Gmail SMTP (nodemailer). Either way, delivery failures are NON-FATAL —
// they are logged and swallowed so they never break signup/login flows.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.EMAIL_FROM || "onboarding@resend.dev";

// Fallback Gmail SMTP transport (used only when RESEND_API_KEY is absent)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: (process.env.SMTP_PASS || "").replace(/\s/g, ""),
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4,
});

// Only probe Gmail if we're not using Resend (avoids a 20s timeout at startup)
if (!RESEND_API_KEY) {
  transporter.verify(function (error) {
    if (error) {
      console.error("📧 SMTP Verification Failed:", error.message);
    } else {
      console.log("📧 SMTP Server is ready to take our messages");
    }
  });
}

/**
 * Send an email. Never throws — returns true on success, null on failure.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 */
exports.sendEmail = async (to, subject, htmlContent) => {
  if (RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [to],
          subject,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const detail = await res.text();
        console.error(`❌ Resend email failed (${res.status}): ${detail}`);
        return null;
      }

      console.log(`📧 Email sent to ${to} via Resend`);
      return true;
    } catch (err) {
      console.error(`❌ Resend delivery failed to ${to}: ${err.message}`);
      return null;
    }
  }

  // Fallback: Gmail SMTP (non-fatal)
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_SENDER_NAME || "My Real Customer App"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`📧 Email sent to ${to} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Email delivery failed to ${to}: ${err.message}`);
    return null;
  }
};
