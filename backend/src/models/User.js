// This file defines what a User looks like in our database

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function isNameRequired() {
      return this.authProvider !== 'firebase';
    }   // User must have a name for local auth
  },
  lname: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    required: true,
    unique: true,     // No two users can have the same email, firebase also takes care of this but it is a good precaution
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function isPasswordRequired() {
      return this.authProvider !== 'firebase';
    }
  },
  firebaseUid: { // This helps sync firebase auth with MongoDB
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: { // This shows how user authenticated, either through local or firebase. May be redundant since auth will be handled by firebase but this field can help if we do local token verification when doing API calls.
    type: String,
    enum: ['local', 'firebase'],
    default: 'local'
  },
  emailVerified: { // Makes sure only firebase-verified emails can access application
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  permissions: {
    type: [String],
    default: []
  },
  lastLoginAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now  // Automatically set to current time
  }
});

// Create and export the User model
// This lets us do things like: User.find(), User.create(), etc.
module.exports = mongoose.model('User', userSchema);
