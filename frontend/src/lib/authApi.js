// URL builder used so all frontend API calls share the same base host.
import { buildApiUrl } from './apiClient';

// Backend endpoint that verifies Firebase token and syncs user profile into MongoDB.
const AUTH_SYNC_URL = buildApiUrl('/api/auth/firebase/session');

// Parse API responses safely across JSON and non-JSON responses.
async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';

  // Most backend responses should be JSON.
  if (contentType.includes('application/json')) {
    return response.json();
  }

  // Fallback: return plain text as an error message wrapper.
  return { error: await response.text() };
}

// Verify Firebase user with backend and persist profile fields in Mongo.
export async function syncFirebaseUserProfile(firebaseUser) {
  // Firebase ID token proves the client is authenticated.
  const idToken = await firebaseUser.getIdToken();

  let response;
  try {
    // Send token + display name so backend can create/update user profile.
    response = await fetch(AUTH_SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        name: firebaseUser.displayName || '',
      }),
    });
  } catch (error) {
    // Network-level failure (backend unavailable, DNS issue, CORS/network interruption).
    throw new Error(`Could not reach backend sync endpoint (${AUTH_SYNC_URL})`);
  }

  // Parse server response body before checking status for better error messaging.
  const payload = await parseResponseBody(response);
  if (!response.ok) {
    // Prefer backend error text when available.
    throw new Error(payload.error || 'Failed to sync Firebase user profile');
  }

  // Return normalized backend payload to the caller.
  return payload;
}

// Attempt Mongo sync without blocking auth flow if backend/database is unavailable.
export async function syncFirebaseUserProfileSafely(firebaseUser) {
  try {
    return await syncFirebaseUserProfile(firebaseUser);
  } catch (error) {
    console.warn('Continuing without MongoDB profile sync:', error);
    return null;
  }
}
