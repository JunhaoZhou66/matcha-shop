const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Create a new order
router.post('/create', (req, res) => {
  const {
    userId,
    sessionId,
    shippingAddress,
    paymentMethod,
    email,
    phone
  } = req.body;

  if (!shippingAddress || !paymentMethod) {
    return res.status(400).json({
      error: 'Shipping address and payment method are required'
    });
  }

  // Get cart items
  let cartQuery = `
    SELECT c.*, p.name, p.price, p.stock
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE `;
  const cartParams = [];

  if (userId) {
    cartQuery += 'c.user_id = ?';
    cartParams.push(userId);
  } else if (sessionId) {
    cartQuery += 'c.session_id = ?';
    cartParams.push(sessionId);
  } else {
    return res.status(400).json({ error: 'User ID or Session ID required' });
  }

  db.all(cartQuery, cartParams, (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch cart items' });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Check stock availability
    const stockIssues = [];
    cartItems.forEach(item => {
      if (item.stock < item.quantity) {
        stockIssues.push(`${item.name} only has ${item.stock} in stock`);
      }
    });

    if (stockIssues.length > 0) {
      return res.status(400).json({
        error: 'Stock issues',
        issues: stockIssues
      });
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // Begin transaction
    db.serialize(() => {
      // Create order
      db.run(
        `INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method)
         VALUES (?, ?, 'pending', ?, ?)`,
        [userId, totalAmount, JSON.stringify(shippingAddress), paymentMethod],
        function(err) {
          if (err) {
            console.error('Error creating order:', err);
            return res.status(500).json({ error: 'Failed to create order' });
          }

          const orderId = this.lastID;

          // Add order items
          const stmt = db.prepare(
            `INSERT INTO order_items (order_id, product_id, quantity, price)
             VALUES (?, ?, ?, ?)`
          );

          cartItems.forEach(item => {
            stmt.run(orderId, item.product_id, item.quantity, item.price);

            // Update product stock
            db.run(
              'UPDATE products SET stock = stock - ? WHERE id = ?',
              [item.quantity, item.product_id]
            );
          });

          stmt.finalize();

          // Clear cart
          const clearQuery = userId
            ? 'DELETE FROM cart WHERE user_id = ?'
            : 'DELETE FROM cart WHERE session_id = ?';
          const clearParams = userId ? [userId] : [sessionId];

          db.run(clearQuery, clearParams, (err) => {
            if (err) {
              console.error('Error clearing cart:', err);
            }

            // Return order details
            res.json({
              success: true,
              orderId,
              totalAmount: totalAmount.toFixed(2),
              message: 'Order created successfully'
            });
          });
        }
      );
    });
  });
});

// Get order by ID
router.get('/:orderId', (req, res) => {
  const { orderId } = req.params;

  db.get(
    'SELECT * FROM orders WHERE id = ?',
    [orderId],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch order' });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Get order items
      db.all(
        `SELECT oi.*, p.name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch order items' });
          }

          res.json({
            ...order,
            shipping_address: JSON.parse(order.shipping_address || '{}'),
            items
          });
        }
      );
    }
  );
});

// Get user's orders
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

      // Parse shipping addresses
      const ordersWithParsedAddresses = orders.map(order => ({
        ...order,
        shipping_address: JSON.parse(order.shipping_address || '{}')
      }));

      res.json(ordersWithParsedAddresses);
    }
  );
});

// Update order status (for admin use)
router.patch('/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      validStatuses
    });
  }

  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, orderId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update order status' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ message: 'Order status updated', status });
    }
  );
});

// Cancel order
router.post('/:orderId/cancel', (req, res) => {
  const { orderId } = req.params;

  // Get order details first
  db.get(
    'SELECT * FROM orders WHERE id = ?',
    [orderId],
    (err, order) => {
      if (err || !order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== 'pending' && order.status !== 'processing') {
        return res.status(400).json({
          error: 'Cannot cancel order',
          reason: `Order is already ${order.status}`
        });
      }

      // Get order items to restore stock
      db.all(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch order items' });
          }

          // Begin transaction
          db.serialize(() => {
            // Restore stock
            items.forEach(item => {
              db.run(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [item.quantity, item.product_id]
              );
            });

            // Update order status
            db.run(
              'UPDATE orders SET status = ? WHERE id = ?',
              ['cancelled', orderId],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to cancel order' });
                }

                res.json({
                  message: 'Order cancelled successfully',
                  orderId,
                  refundAmount: order.total_amount
                });
              }
            );
          });
        }
      );
    }
  );
});

module.exports = router;