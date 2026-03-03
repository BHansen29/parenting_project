// Load environment variables from .env file (like MONGODB_URI, PORT)
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Import the packages we need
const express = require('express');  // Web framework for creating APIs
const cors = require('cors');        // Allows frontend to talk to backend
const connectDB = require('./config/database');
const routes = require('./routes');

// Create our Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - these run on every request
app.use(cors());           // Allow requests from frontend
app.use(express.json());   // Parse JSON data from requests

// Use our routes for any URL starting with /api
app.use('/api', routes);

// Home page route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Parenting API!' });
});

// Start the server
async function startServer() {
  await connectDB();  // Connect to database first

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
