const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware xác thực JWT
function authenticateJWT(req, res, next) {
  console.log('JWT middleware - headers:', req.headers);
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verify error:', err.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.log('JWT verify success:', user);
    req.user = user; // Đảm bảo gán payload vào req.user
    next();
  });
}

module.exports = authenticateJWT; 