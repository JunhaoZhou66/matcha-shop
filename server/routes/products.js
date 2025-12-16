const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all products
router.get('/', (req, res) => {
  const { category, sort, limit } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  // Filter by category
  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }

  // Sort options
  if (sort === 'price_asc') {
    query += ' ORDER BY price ASC';
  } else if (sort === 'price_desc') {
    query += ' ORDER BY price DESC';
  } else if (sort === 'name') {
    query += ' ORDER BY name ASC';
  } else {
    query += ' ORDER BY created_at DESC';
  }

  // Limit results
  if (limit) {
    query += ` LIMIT ${parseInt(limit)}`;
  }

  db.all(query, params, (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(products);
  });
});

// Get single product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  });
});

// Get product categories
router.get('/categories/list', (req, res) => {
  db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL', (err, categories) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.json(categories.map(c => c.category));
  });
});

// Search products
router.get('/search/:query', (req, res) => {
  const { query } = req.params;
  const searchQuery = `%${query}%`;

  db.all(
    'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?',
    [searchQuery, searchQuery],
    (err, products) => {
      if (err) {
        console.error('Error searching products:', err);
        return res.status(500).json({ error: 'Search failed' });
      }
      res.json(products);
    }
  );
});

// Get featured products (limited stock or limited edition)
router.get('/featured/list', (req, res) => {
  db.all(
    `SELECT * FROM products
     WHERE category = 'Limited Edition' OR stock < 20
     ORDER BY stock ASC
     LIMIT 6`,
    (err, products) => {
      if (err) {
        console.error('Error fetching featured products:', err);
        return res.status(500).json({ error: 'Failed to fetch featured products' });
      }
      res.json(products);
    }
  );
});

// Update product stock (for admin use)
router.patch('/:id/stock', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) {
    return res.status(400).json({ error: 'Quantity is required' });
  }

  db.run(
    'UPDATE products SET stock = stock + ? WHERE id = ?',
    [quantity, id],
    function(err) {
      if (err) {
        console.error('Error updating stock:', err);
        return res.status(500).json({ error: 'Failed to update stock' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Stock updated successfully', productId: id });
    }
  );
});

module.exports = router;