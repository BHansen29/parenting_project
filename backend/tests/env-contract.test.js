const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const envExamplePath = path.join(__dirname, '..', '.env.example');
const envExample = fs.readFileSync(envExamplePath, 'utf8');

function getEnvValue(key) {
  const match = envExample.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
}

function testRequiredKeys() {
  const requiredKeys = [
    'SESSION_SECRET',
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_MEASUREMENT_ID',
    'FIREBASE_SERVICE_ACCOUNT_PATH'
  ];

  for (const key of requiredKeys) {
    assert.notEqual(getEnvValue(key), null, `${key} missing in .env.example`);
  }
  console.log('PASS: required firebase/session keys exist in .env.example');
}

function testNoSecretsCommitted() {
  assert.ok(!envExample.includes('BEGIN PRIVATE KEY'), 'private key leaked');
  assert.ok(!envExample.includes('AIza'), 'firebase api key leaked');
  assert.ok(!envExample.includes('-----END PRIVATE KEY-----'), 'private key leaked');
  assert.equal(
    getEnvValue('SESSION_SECRET'),
    'replace-with-a-long-random-secret',
    'SESSION_SECRET should remain a placeholder'
  );
  console.log('PASS: .env.example contains placeholders instead of real secrets');
}

testRequiredKeys();
testNoSecretsCommitted();
