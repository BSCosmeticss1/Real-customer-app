const nodemailer = require("nodemailer");

// ─── Email delivery (SMTP) ───────────────────────────────────────────────────
// Provider-agnostic SMTP. Configure via environment variables so you can point
// it at any host Render can reach (Gmail is blocked from Render / this network,
// so use e.g. SendGrid, Mailgun, Mailtrap, or your own domain host).
//
//   SMTP_HOST     (default smtp.gmail.com)
//   SMTP_PORT     (default 587)
//   SMTP_SECURE   "true" for implicit SSL (port 465), otherwise STARTTLS
//   SMTP_USER
//   SMTP_PASS
//   EMAIL_SENDER_NAME / EMAIL_SENDER_ADDRESS
//
// Delivery failures are NON-FATAL: they are logged and swallowed so they never
// break signup / login / forgot-password flows.

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure:
    process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: (process.env.SMTP_PASS || "").replace(/\s/g, ""),
  },
  tls: {
    rejectUnauthorized: false,
  },
  // Force IPv4 — avoids unreachable IPv6 routes (ENETUNREACH) on some hosts.
  family: 4,
});

transporter.verify(function (error) {
  if (error) {
    console.warn("📧 SMTP not reachable:", error.message);
  } else {
    console.log("📧 SMTP Server is ready to take our messages");
  }
});

/**
 * Send an email. Never throws — returns the info on success, null on failure.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 */
exports.sendEmail = async (to, subject, htmlContent) => {
  // DEV MODE: SMTP is often blocked locally (e.g. Gmail), so instead of
  // hanging on a timeout we print the message to the console. The OTP / link
  // is right there for local testing. Production still uses real SMTP.
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n📧 [DEV MODE] Email to ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log("   Body:");
    console.log(htmlContent);
    console.log("");
    return { dev: true, messageId: "dev-console" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_SENDER_NAME || "My Real Customer App"}" <${process.env.EMAIL_SENDER_ADDRESS || process.env.SMTP_USER}>`,
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
