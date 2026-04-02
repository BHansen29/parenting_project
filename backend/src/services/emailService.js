const nodemailer = require('nodemailer');

/*
 * Email is sent via Gmail SMTP using Nodemailer.
 * To set this up, create a dedicated Gmail account, enable 2FA,
 * and generate an App Password (Google Account → Security → App Passwords).
 * Add the following to your .env:
 *
 *   EMAIL_HOST=smtp.gmail.com
 *   EMAIL_PORT=587
 *   EMAIL_USER=sharecare.noreply@gmail.com
 *   EMAIL_PASS=<gmail-app-password>
 */
const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = process.env;
if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
  console.warn('Warning: Email env vars (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) are not set — invite emails will fail');
}

// Transporter is created once at startup and reused across all requests
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  // Port 465 uses implicit TLS; 587 uses STARTTLS (more common)
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendInviteEmail(toEmail, inviteLink) {
  await transporter.sendMail({
    from: `"ShareCare" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'You have been invited to ShareCare',
    text: `You have been invited to collaborate on a ShareCare parenting plan.\n\nAccept your invitation here:\n${inviteLink}\n\nThis link expires in 7 days.`,
    html: `
      <p>You have been invited to collaborate on a <strong>ShareCare</strong> parenting plan.</p>
      <p><a href="${inviteLink}">Accept your invitation</a></p>
      <p>This link expires in 7 days.</p>
    `,
  });
let transporter;

// Gmail SMTP env values arrive as strings, so normalize the secure flag once.
function parseSecureFlag(value) {
  if (typeof value !== 'string') {
    return true;
  }

  return value.toLowerCase() !== 'false';
}

// Read and validate the SMTP configuration used by Nodemailer.
function getEmailConfig() {
  const config = {
    host: process.env.EMAIL_SMTP_HOST,
    port: Number(process.env.EMAIL_SMTP_PORT || 465),
    secure: parseSecureFlag(process.env.EMAIL_SMTP_SECURE),
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
    from: process.env.EMAIL_FROM_ADDRESS,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
  };

  const missing = Object.entries({
    EMAIL_SMTP_HOST: config.host,
    EMAIL_SMTP_USER: config.user,
    EMAIL_SMTP_PASS: config.pass,
    EMAIL_FROM_ADDRESS: config.from,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Email service is not configured. Missing: ${missing.join(', ')}`);
  }

  if (Number.isNaN(config.port)) {
    throw new Error('EMAIL_SMTP_PORT must be a valid number');
  }

  return config;
}

// Lazily create the transporter so routes can import this service without
// immediately failing before env vars are loaded.
function getTransporter() {
  if (!transporter) {
    const config = getEmailConfig();
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  return transporter;
}

// Send a simple invite-style email. The body is still placeholder content for now.
async function sendInviteEmail(toAddress) {
  if (!toAddress) {
    throw new Error('A recipient email address is required');
  }

  const config = getEmailConfig();
  const result = await getTransporter().sendMail({
    from: config.from,
    to: toAddress,
    replyTo: config.replyTo,
    subject: 'ShareCare email delivery check',
    text: 'This is a test email from ShareCare using Gmail SMTP.',
    html: '<p>This is a test email from <strong>ShareCare</strong> using Gmail SMTP.</p>',
  });

  return {
    accepted: result.accepted,
    rejected: result.rejected,
    messageId: result.messageId,
  };
}

module.exports = { sendInviteEmail };
