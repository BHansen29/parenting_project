require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});

const redirectUri = process.env.GMAIL_REDIRECT_URI || 'http://localhost';
const authorizationCode = process.argv[2];

if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
  console.error('Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET first.');
  process.exit(1);
}

async function main() {
  if (!authorizationCode) {
    const params = new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/gmail.send',
      access_type: 'offline',
      prompt: 'consent',
    });
    console.log(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
    return;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: authorizationCode,
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    console.error(payload);
    process.exit(1);
  }

  console.log(`GMAIL_REFRESH_TOKEN=${payload.refresh_token || ''}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
