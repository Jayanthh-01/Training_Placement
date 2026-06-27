const jwt = require('jsonwebtoken');

// Checks the token is valid and attaches the user to the request
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];   // format: "Bearer <token>"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;                 // now req.user has { id, role }
    next();                             // allow the request to continue
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Only lets officers through
function officerOnly(req, res, next) {
  if (req.user.role !== 'officer')
    return res.status(403).json({ error: 'Officer access only' });
  next();
}

module.exports = { authenticate, officerOnly };