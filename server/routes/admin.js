const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get dashboard statistics
router.get('/stats', (req, res) => {
  const stats = {};

  // Get product statistics
  db.get(
    `SELECT
      COUNT(*) as total_products,
      SUM(price * stock) as total_value,
      SUM(stock) as total_stock,
      AVG(price) as avg_price,
      COUNT(DISTINCT category) as total_categories
    FROM products`,
    (err, productStats) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch product stats' });
      }

      stats.products = productStats;

      // Get low stock count
      db.get(
        'SELECT COUNT(*) as low_stock FROM products WHERE stock < 20',
        (err, lowStock) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch low stock count' });
          }

          stats.lowStock = lowStock.low_stock;

          // Get cart statistics
          db.get(
            'SELECT COUNT(DISTINCT session_id) as active_carts, COUNT(*) as total_items FROM cart',
            (err, cartStats) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to fetch cart stats' });
              }

              stats.carts = cartStats;

              // Get order statistics
              db.get(
                `SELECT
                  COUNT(*) as total_orders,
                  SUM(total_amount) as total_revenue,
                  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
                  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders
                FROM orders`,
                (err, orderStats) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to fetch order stats' });
                  }

                  stats.orders = orderStats;
                  res.json(stats);
                }
              );
            }
          );
        }
      );
    }
  );
});

// Get all cart items with product details
router.get('/carts', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;

  db.all(
    `SELECT
      c.id,
      c.session_id,
      c.user_id,
      c.quantity,
      c.created_at,
      p.name as product_name,
      p.price,
      p.category
    FROM cart c
    JOIN products p ON c.product_id = p.id
    ORDER BY c.created_at DESC
    LIMIT ?`,
    [limit],
    (err, carts) => {
      if (err) {
        console.error('Error fetching carts:', err);
        return res.status(500).json({ error: 'Failed to fetch cart data' });
      }
      res.json(carts);
    }
  );
});

// Get all orders with details
router.get('/orders', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;

  db.all(
    `SELECT
      o.id,
      o.user_id,
      o.total_amount,
      o.status,
      o.payment_method,
      o.created_at,
      u.username as customer_name,
      u.email as customer_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT ?`,
    [limit],
    (err, orders) => {
      if (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

      // For orders without users (guest checkouts), add placeholder data
      const ordersWithCustomerInfo = orders.map(order => ({
        ...order,
        customer_name: order.customer_name || `Guest #${order.id}`,
        customer_email: order.customer_email || 'guest@matcha.com'
      }));

      res.json(ordersWithCustomerInfo);
    }
  );
});

// Get product categories with counts
router.get('/categories', (req, res) => {
  db.all(
    `SELECT
      category,
      COUNT(*) as product_count,
      SUM(stock) as total_stock,
      AVG(price) as avg_price
    FROM products
    GROUP BY category
    ORDER BY product_count DESC`,
    (err, categories) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }
      res.json(categories);
    }
  );
});

// Get inventory alerts (low stock, out of stock)
router.get('/alerts', (req, res) => {
  db.all(
    `SELECT
      id,
      name,
      stock,
      category,
      CASE
        WHEN stock = 0 THEN 'out_of_stock'
        WHEN stock < 20 THEN 'low_stock'
      END as alert_type
    FROM products
    WHERE stock < 20
    ORDER BY stock ASC`,
    (err, alerts) => {
      if (err) {
        console.error('Error fetching alerts:', err);
        return res.status(500).json({ error: 'Failed to fetch alerts' });
      }
      res.json(alerts);
    }
  );
});

// Database health check
router.get('/health', (req, res) => {
  const checks = {};

  // Check products table
  db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
    checks.products = err ? 'error' : `ok (${result.count} items)`;

    // Check cart table
    db.get('SELECT COUNT(*) as count FROM cart', (err, result) => {
      checks.cart = err ? 'error' : `ok (${result.count} items)`;

      // Check orders table
      db.get('SELECT COUNT(*) as count FROM orders', (err, result) => {
        checks.orders = err ? 'error' : `ok (${result.count} items)`;

        // Check users table
        db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
          checks.users = err ? 'error' : `ok (${result.count} items)`;

          const allHealthy = Object.values(checks).every(status => status.includes('ok'));

          res.json({
            status: allHealthy ? 'healthy' : 'degraded',
            database: 'SQLite',
            tables: checks,
            timestamp: new Date().toISOString()
          });
        });
      });
    });
  });
});

module.exports = router;