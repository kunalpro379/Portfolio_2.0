import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
function generateSessionHash() {
  return crypto.randomBytes(32).toString('hex');
}
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const sessionHash = generateSessionHash();
    const session = new Session({
      sessionHash,
      userId: user._id,
      username: user.username,
      createdAt: new Date()
    });
    await session.save();
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        sessionHash 
      },
      JWT_SECRET,
      { expiresIn: '7h' } 
    );
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const session = await Session.findOne({ 
      sessionHash: decoded.sessionHash,
      userId: decoded.userId 
    });
    if (!session) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
});
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    await Session.deleteOne({ sessionHash: decoded.sessionHash });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const session = await Session.findOne({ 
      sessionHash: decoded.sessionHash,
      userId: decoded.userId 
    });
    if (!session) {
      return res.status(401).json({ message: 'Session expired' });
    }
    session.createdAt = new Date();
    await session.save();
    const newToken = jwt.sign(
      { 
        userId: decoded.userId, 
        username: decoded.username,
        sessionHash: decoded.sessionHash 
      },
      JWT_SECRET,
      { expiresIn: '7h' } 
    );
    res.json({ 
      message: 'Session refreshed',
      token: newToken 
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});
export default router;
