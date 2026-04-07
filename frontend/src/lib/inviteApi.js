import { auth } from './firebase';
import { buildApiUrl } from './apiClient';

const INVITE_EMAIL_URL = buildApiUrl('/api/email/invite');

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return { error: await response.text() };
}

export async function sendInviteEmailRequest(email) {
  const recipientEmail = typeof email === 'string' ? email.trim() : '';

  if (!recipientEmail) {
    throw new Error('Please enter an email address.');
  }

  if (!auth.currentUser) {
    throw new Error('You must be signed in to send an invite.');
  }

  const idToken = await auth.currentUser.getIdToken();

  let response;
  try {
    response = await fetch(INVITE_EMAIL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ email: recipientEmail }),
    });
  } catch (error) {
    throw new Error(`Could not reach invite email endpoint (${INVITE_EMAIL_URL})`);
  }

  const payload = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to send invite email');
  }

  return payload;
}
