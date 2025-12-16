const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'matcha-secret-key-2024';

// Register new user
router.post('/register', [
  body('username').isLength({ min: 3 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user exists
    db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username],
      async (err, existingUser) => {
        if (existingUser) {
          return res.status(409).json({
            error: 'User already exists with this email or username'
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        db.run(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hashedPassword],
          function(err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ error: 'Failed to create user' });
            }

            const userId = this.lastID;

            // Generate token
            const token = jwt.sign(
              { userId, username, email },
              JWT_SECRET,
              { expiresIn: '7d' }
            );

            res.status(201).json({
              message: 'User created successfully',
              token,
              user: {
                id: userId,
                username,
                email
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      try {
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
          {
            userId: user.id,
            username: user.username,
            email: user.email
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
      }
    }
  );
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Get user profile
router.get('/profile', verifyToken, (req, res) => {
  const { userId } = req.user;

  db.get(
    'SELECT id, username, email, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    }
  );
});

// Update user profile
router.put('/profile', verifyToken, [
  body('username').optional().isLength({ min: 3 }).trim(),
  body('email').optional().isEmail().normalizeEmail()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.user;
  const { username, email } = req.body;

  const updates = [];
  const params = [];

  if (username) {
    updates.push('username = ?');
    params.push(username);
  }

  if (email) {
    updates.push('email = ?');
    params.push(email);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }

  params.push(userId);

  db.run(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({
            error: 'Username or email already exists'
          });
        }
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Change password
router.post('/change-password', verifyToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;

  db.get(
    'SELECT password FROM users WHERE id = ?',
    [userId],
    async (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      try {
        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        db.run(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, userId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to update password' });
            }

            res.json({ message: 'Password changed successfully' });
          }
        );
      } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
      }
    }
  );
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ message: 'Logout successful' });
});

module.exports = router;