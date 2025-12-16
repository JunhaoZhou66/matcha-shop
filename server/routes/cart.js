const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Get cart items (by session ID or user ID)
router.get('/', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  const userId = req.query.userId;

  let query = `
    SELECT c.*, p.name, p.price, p.image_url, p.description
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (userId) {
    query += ' AND c.user_id = ?';
    params.push(userId);
  } else if (sessionId) {
    query += ' AND c.session_id = ?';
    params.push(sessionId);
  } else {
    return res.status(400).json({ error: 'Session ID or User ID required' });
  }

  db.all(query, params, (err, items) => {
    if (err) {
      console.error('Error fetching cart:', err);
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const total = subtotal + shipping;

    res.json({
      items,
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      freeShippingThreshold: 50
    });
  });
});

// Add item to cart
router.post('/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const sessionId = req.headers['x-session-id'] || req.body.sessionId || uuidv4();
  const userId = req.body.userId || null;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  // Check if product exists and has stock
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const checkQuery = userId
      ? 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?'
      : 'SELECT * FROM cart WHERE session_id = ? AND product_id = ?';
    const checkParams = userId ? [userId, productId] : [sessionId, productId];

    db.get(checkQuery, checkParams, (err, existingItem) => {
      if (existingItem) {
        // Update quantity
        const updateQuery = 'UPDATE cart SET quantity = quantity + ? WHERE id = ?';
        db.run(updateQuery, [quantity, existingItem.id], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to update cart' });
          }
          res.json({
            message: 'Cart updated',
            sessionId,
            productName: product.name,
            quantity: existingItem.quantity + quantity
          });
        });
      } else {
        // Insert new item
        const insertQuery = `
          INSERT INTO cart (user_id, product_id, quantity, session_id)
          VALUES (?, ?, ?, ?)
        `;
        db.run(insertQuery, [userId, productId, quantity, sessionId], (err) => {
          if (err) {
            console.error('Error adding to cart:', err);
            return res.status(500).json({ error: 'Failed to add to cart' });
          }
          res.json({
            message: 'Added to cart',
            sessionId,
            productName: product.name,
            quantity
          });
        });
      }
    });
  });
});

// Update cart item quantity
router.put('/update', (req, res) => {
  const { cartItemId, quantity } = req.body;

  if (!cartItemId || quantity === undefined) {
    return res.status(400).json({ error: 'Cart item ID and quantity are required' });
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    db.run('DELETE FROM cart WHERE id = ?', [cartItemId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to remove item' });
      }
      res.json({ message: 'Item removed from cart' });
    });
  } else {
    db.run(
      'UPDATE cart SET quantity = ? WHERE id = ?',
      [quantity, cartItemId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update quantity' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Cart item not found' });
        }
        res.json({ message: 'Quantity updated' });
      }
    );
  }
});

// Remove item from cart
router.delete('/remove/:itemId', (req, res) => {
  const { itemId } = req.params;

  db.run('DELETE FROM cart WHERE id = ?', [itemId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to remove item' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item removed from cart' });
  });
});

// Clear cart
router.delete('/clear', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  const userId = req.query.userId;

  let query = 'DELETE FROM cart WHERE ';
  const params = [];

  if (userId) {
    query += 'user_id = ?';
    params.push(userId);
  } else if (sessionId) {
    query += 'session_id = ?';
    params.push(sessionId);
  } else {
    return res.status(400).json({ error: 'Session ID or User ID required' });
  }

  db.run(query, params, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to clear cart' });
    }
    res.json({ message: 'Cart cleared' });
  });
});

// Get cart count
router.get('/count', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  const userId = req.query.userId;

  let query = 'SELECT SUM(quantity) as count FROM cart WHERE ';
  const params = [];

  if (userId) {
    query += 'user_id = ?';
    params.push(userId);
  } else if (sessionId) {
    query += 'session_id = ?';
    params.push(sessionId);
  } else {
    return res.json({ count: 0 });
  }

  db.get(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get cart count' });
    }
    res.json({ count: result.count || 0 });
  });
});

module.exports = router;