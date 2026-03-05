// This file defines our API endpoints (URLs the frontend can call)

const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const User = require('../models/User');
const planRoutes = require('./plan');

/* Middleware to check if a user is authenticated
 * This gets used like the following
 * router.get('/dashboard', isAuthenticated, (req, res) =>{...})
**/
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next(); // User is authenticated, proceed to the next middleware or route handler
    } else {
        res.status(401).json({ message: 'Unauthorized, please log in' });
    }
};


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

// GET /api/documents - Get all documents
router.get('/documents', async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/documents/:id - Get a single document by ID
router.get('/documents/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/documents - Create a new document
router.post('/documents', async (req, res) => {
  try {
    const document = await Document.create(req.body);
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api - Show available endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'Parenting API',
    endpoints: {
      health: 'GET /api/health - Check server status',
      documents: 'GET /api/documents - Get all documents',
      document: 'GET /api/documents/:id - Get a document by ID',
      createDocument: 'POST /api/documents - Create a new document',
      login: 'POST /api/login - Login a user and get current session',
      createUser: 'POST /api/createUser - Create a new user'
    }
  });
});

router.use('/plan', planRoutes);

module.exports = router;
