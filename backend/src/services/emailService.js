let cachedAccessToken = null;
let cachedAccessTokenExpiresAt = 0;

function getEmailConfig() {
  const config = {
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    user: process.env.GMAIL_USER,
    from: process.env.GMAIL_FROM_ADDRESS
      || process.env.EMAIL_FROM_ADDRESS
      || (process.env.GMAIL_USER ? `"ShareCare" <${process.env.GMAIL_USER}>` : null),
    replyTo: process.env.EMAIL_REPLY_TO || process.env.GMAIL_REPLY_TO || undefined,
  };

  const missing = Object.entries({
    GMAIL_CLIENT_ID: config.clientId,
    GMAIL_CLIENT_SECRET: config.clientSecret,
    GMAIL_REFRESH_TOKEN: config.refreshToken,
    GMAIL_USER: config.user,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Gmail API is not configured. Missing: ${missing.join(', ')}`);
  }

  return config;
}

async function getAccessToken(config) {
  if (cachedAccessToken && Date.now() < cachedAccessTokenExpiresAt) {
    return cachedAccessToken;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const description = payload.error_description || payload.error || 'OAuth token refresh failed';
    const error = new Error(description);
    error.code = payload.error || 'GMAIL_OAUTH_ERROR';
    throw error;
  }

  cachedAccessToken = payload.access_token;
  cachedAccessTokenExpiresAt = Date.now() + ((payload.expires_in || 3600) - 60) * 1000;
  return cachedAccessToken;
}

function encodeBase64Url(value) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sendInviteEmail(toAddress, inviteLink) {
  if (!toAddress) {
    throw new Error('A recipient email address is required');
  }

  const config = getEmailConfig();
  const accessToken = await getAccessToken(config);
  const hasInviteLink = typeof inviteLink === 'string' && inviteLink.trim().length > 0;
  const subject = hasInviteLink
    ? 'You have been invited to ShareCare'
    : 'ShareCare email delivery check';
  const text = hasInviteLink
    ? `You have been invited to collaborate on a ShareCare parenting plan.\n\nAccept your invitation here:\n${inviteLink}\n\nThis link expires in 7 days.`
    : 'This is a test email from ShareCare using the Gmail API.';
  const html = hasInviteLink
    ? `
      <p>You have been invited to collaborate on a <strong>ShareCare</strong> parenting plan.</p>
      <p><a href="${inviteLink}">Accept your invitation</a></p>
      <p>This link expires in 7 days.</p>
    `
    : '<p>This is a test email from <strong>ShareCare</strong> using the Gmail API.</p>';

  const headers = [
    `From: ${config.from}`,
    `To: ${toAddress}`,
    `Subject: ${subject}`,
  ];
  if (config.replyTo) headers.push(`Reply-To: ${config.replyTo}`);
  headers.push(
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="sharecare-boundary"',
  );

  const message = [
    ...headers,
    '',
    '--sharecare-boundary',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    text,
    '--sharecare-boundary',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    html,
    '--sharecare-boundary--',
  ].join('\r\n');

  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodeBase64Url(message) }),
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    const reason = payload.error?.message || 'Gmail API rejected the message';
    const error = new Error(reason);
    error.code = payload.error?.status || 'GMAIL_API_ERROR';
    throw error;
  }

  return {
    accepted: [toAddress],
    rejected: [],
    messageId: payload.id,
  };
}

module.exports = { sendInviteEmail };
