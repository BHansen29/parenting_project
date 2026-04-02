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
}

module.exports = { sendInviteEmail };
