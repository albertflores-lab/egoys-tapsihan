// api/_auth.js — JWT auth helpers for serverless functions

const jwt = require('jsonwebtoken');

function getSecret() {
  return process.env.JWT_SECRET || 'egoys_dev_secret_change_in_production';
}

function verifyToken(req) {
  const auth = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized — please log in' });
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = verifyToken(req);
  if (!user) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  if (user.role !== 'admin') { res.status(403).json({ error: 'Admin only' }); return null; }
  return user;
}

function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

module.exports = { verifyToken, requireAuth, requireAdmin, signToken, setCors };
