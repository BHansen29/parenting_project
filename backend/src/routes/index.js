// This file defines our API endpoints (URLs the frontend can call)

const express = require('express');
const router = express.Router();

// GET /api/health - Check if server and database are working
router.get('/health', (req, res) => {
  const mongoose = require('mongoose');

  // Check if we're connected to MongoDB
  // readyState: 0 = disconnected, 1 = connected
  const isConnected = mongoose.connection.readyState === 1;

  res.json({
    server: 'running',
    database: isConnected ? 'connected' : 'disconnected'
  });
});

// GET /api - Show available endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'Parenting API',
    endpoints: {
      health: 'GET /api/health - Check server status'
    }
  });
});

module.exports = router;
