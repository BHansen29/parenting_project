require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/get-token.js <email> <password>');
  process.exit(1);
}

const apiKey = process.env.VITE_FIREBASE_API_KEY;
if (!apiKey) {
  console.error('Error: VITE_FIREBASE_API_KEY not found in .env');
  process.exit(1);
}

async function main() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const data = await res.json();

  if (data.error) {
    console.error('Error:', data.error.message);
    process.exit(1);
  }

  console.log('\nUID:  ', data.localId);
  console.log('Token:', data.idToken, '\n');
}

main();
