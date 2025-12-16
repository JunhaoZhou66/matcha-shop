const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory (for frontend)
app.use(express.static(path.join(__dirname, '..')));

// API Routes
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Matcha Shop API is running' });
});

// Serve the main HTML file for all non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/product', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'product.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍵 Matcha Shop Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});

module.exports = app;