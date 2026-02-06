// This file defines our API endpoints (URLs the frontend can call)

const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const User = require('../models/User');

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

// POST /api/login - login user
// req must contain user login info in JSON (name, email, password)
router.post('/login', async (req, res) => {
  try {
    /** 
     * validate user creds here
     * may require something like 'express-session'
    **/
    const user = await User.findOne(req.body)
    if (user) {
      // found user, proceed to login
      // set session information here
      // redirect users to home page of application/dashboard
      res.redirect('/dashboard')
    } else {
      // todo: make more descriptive res depending on if password wrong, user doesn't exist, etc.
      res.send('Login failed')
    }
  } catch (err) {
    console.error('Error during user search: ', err)
    res.status(400).json({ error: err.message });
  } 
})

// POST /api/create_user - create user
// req must contain user login info in JSON (name, email, password)
router.post('/createUser', async (req, res) => {
  try {
    const user = await User.findOne(req.body.email)
    // might not need this logic if unique property of email is accounted for in User.create()
    if (!user) {
      await User.create(req.body)
      res.status(201);
    } else {
      res.send('User already exists!')
    }

  } catch (err) {
    console.error('Error during user creation: ', err)
    res.status(400).json({ error: err.message });
  } 
})

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

module.exports = router;
