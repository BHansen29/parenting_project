const nodemailer = require('nodemailer');

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

// Send a simple example email that confirms Gmail SMTP is working end to end.
async function sendExampleEmail(toAddress) {
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

module.exports = { sendExampleEmail };
