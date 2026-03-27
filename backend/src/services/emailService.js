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

// Send invitation email with token link
async function sendInviteEmailWithToken(toAddress, token) {
  if (!toAddress) {
    throw new Error('A recipient email address is required');
  }
  if (!token) {
    throw new Error('An invitation token is required');
  }

  const config = getEmailConfig();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const inviteLink = `${frontendUrl}/invite/${token}`;

  const result = await getTransporter().sendMail({
    from: config.from,
    to: toAddress,
    replyTo: config.replyTo,
    subject: 'You\'re invited to collaborate on a parenting plan',
    text: `You've been invited to collaborate on a parenting plan.\n\nClick the link below to accept the invitation:\n${inviteLink}\n\nThis invitation will expire in 7 days.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">You're Invited!</h2>
        <p>You've been invited to collaborate on a parenting plan.</p>
        <p style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${inviteLink}">${inviteLink}</a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          This invitation will expire in 7 days.
        </p>
      </div>
    `,
  });

  return {
    accepted: result.accepted,
    rejected: result.rejected,
    messageId: result.messageId,
  };
}

module.exports = { sendInviteEmail, sendInviteEmailWithToken };
