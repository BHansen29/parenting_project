const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function parseServiceAccountJson(serviceAccountJson) {
  try {
    return JSON.parse(serviceAccountJson);
  } catch (error) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
}

function resolveServiceAccountPath(serviceAccountPath) {
  if (path.isAbsolute(serviceAccountPath)) {
    return serviceAccountPath;
  }

  const candidatePaths = [
    path.resolve(process.cwd(), serviceAccountPath),
    path.resolve(__dirname, '../../../', serviceAccountPath)
  ];

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  throw new Error(
    `Firebase service account file not found. Checked: ${candidatePaths.join(', ')}`
  );
}

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return parseServiceAccountJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.'
    );
  }

  const resolvedPath = resolveServiceAccountPath(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  const rawFile = fs.readFileSync(resolvedPath, 'utf8');
  return parseServiceAccountJson(rawFile);
}

function getFirebaseAuth() {
  if (!admin.apps.length) {
    const serviceAccount = getServiceAccount();

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  return admin.auth();
}

module.exports = { getFirebaseAuth };
