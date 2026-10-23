const path = require('path');
const dotenv = require('dotenv');

const backendEnvPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: backendEnvPath });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: rootEnvPath });
}

const mongoose = require('mongoose');
const User = require('../src/models/User');
const { getFirebaseAuth } = require('../src/config/firebaseAdmin');

async function grantAdmin(emailArgument) {
  const email = emailArgument && emailArgument.trim().toLowerCase();
  if (!email) {
    throw new Error('Usage: npm run grant-admin -- <verified-firebase-email>');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  let firebaseUser;
  try {
    firebaseUser = await getFirebaseAuth().getUserByEmail(email);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new Error(
        `No Firebase account was found for ${email}. Create the account through the app first.`
      );
    }
    throw error;
  }

  if (typeof firebaseUser.email !== 'string' || firebaseUser.email.toLowerCase() !== email) {
    throw new Error('Firebase returned an account with a different email address');
  }

  if (!firebaseUser.emailVerified) {
    throw new Error(
      `The Firebase account for ${email} is not verified. Verify its email, sign in again, and rerun this command.`
    );
  }

  if (firebaseUser.disabled) {
    throw new Error(`The Firebase account for ${email} is disabled`);
  }

  const userByUid = await User.findOne({ firebaseUid: firebaseUser.uid });
  const userByEmail = await User.findOne({ email });
  if (userByUid && userByEmail && userByUid.id !== userByEmail.id) {
    throw new Error('MongoDB has conflicting profiles for this Firebase account; resolve them before granting admin');
  }

  const user = userByUid || userByEmail;
  if (user && user.authProvider !== 'firebase') {
    throw new Error(
      'A non-Firebase MongoDB account already uses this email. Resolve the account link before granting admin.'
    );
  }

  if (user && user.firebaseUid && user.firebaseUid !== firebaseUser.uid) {
    throw new Error('This email is already linked to a different Firebase identity');
  }

  const isNewProfile = !user;
  const adminUser = user || new User({
    email,
    name: firebaseUser.displayName || email.split('@')[0],
    authProvider: 'firebase',
    firebaseUid: firebaseUser.uid
  });
  adminUser.email = email;
  adminUser.firebaseUid = firebaseUser.uid;
  adminUser.authProvider = 'firebase';
  adminUser.emailVerified = true;
  adminUser.role = 'admin';
  await adminUser.save();

  console.log(`${isNewProfile ? 'Created profile and granted' : 'Granted'} administrator access to ${email}`);
}

grantAdmin(process.argv[2])
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
