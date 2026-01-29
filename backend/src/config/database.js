// This file connects our app to MongoDB

const mongoose = require('mongoose');

async function connectDB() {
  try {
    // Connect to MongoDB using the URL from our .env file
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1); // Stop the app if we can't connect
  }
}

module.exports = connectDB;
