const { getFirebaseAuth } = require('../config/firebaseAdmin');

function createVerifyToken({ checkRevoked = false } = {}) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      req.user = await getFirebaseAuth().verifyIdToken(token, checkRevoked);
      return next();
    } catch (error) {
      if (typeof error.code === 'string' && error.code.startsWith('auth/')) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      console.error('Firebase token verification failed:', error);
      return res.status(500).json({ message: 'Authentication service unavailable' });
    }
  };
}

const verifyToken = createVerifyToken();
verifyToken.withRevocationCheck = () => createVerifyToken({ checkRevoked: true });

module.exports = verifyToken;
