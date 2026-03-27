import { auth } from './firebase';
import { buildApiUrl } from './apiClient';

const CASE_BASE_URL = buildApiUrl('/api/v1/cases');

/**
 * Create a new case and get caseId
 * @returns {Promise<{caseId: string}>}
 */
export async function createCase() {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to create a case.');
  }

  const idToken = await auth.currentUser.getIdToken();

  const response = await fetch(CASE_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Failed to create case');
  }

  return response.json();
}

/**
 * Send invite to co-parent
 * @param {string} caseId
 * @param {string} email
 * @returns {Promise<{status: 'sent'|'pending'|'expired', message: string}>}
 */
export async function sendCaseInvite(caseId, email) {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to send invites.');
  }

  const idToken = await auth.currentUser.getIdToken();

  const response = await fetch(`${CASE_BASE_URL}/${caseId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Failed to send invite');
  }

  return response.json();
}
