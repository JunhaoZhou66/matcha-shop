// Admin Dashboard Script
const API_BASE_URL = 'http://localhost:5001/api';

// Dashboard data
let dashboardData = {
    products: [],
    cart: [],
    orders: [],
    stats: {}
};

// Load all dashboard data
async function loadDashboard() {
    try {
        // Load products
        const productsResponse = await fetch(`${API_BASE_URL}/products`);
        dashboardData.products = await productsResponse.json();

        // Load stats
        calculateStats();

        // Display all data
        displayStats();
        displayCategoryChart();
        displayProductsTable();
        displayCartTable();
        displayOrdersTable();

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Calculate statistics
function calculateStats() {
    const products = dashboardData.products;

    dashboardData.stats = {
        totalProducts: products.length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
        totalStock: products.reduce((sum, p) => sum + p.stock, 0),
        lowStock: products.filter(p => p.stock < 20).length,
        categories: [...new Set(products.map(p => p.category))].length,
        averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length
    };
}

// Display statistics cards
function displayStats() {
    const statsGrid = document.getElementById('statsGrid');

    statsGrid.innerHTML = `
        <div class="stat-card">
            <h3>Total Products</h3>
            <div class="value">${dashboardData.stats.totalProducts}</div>
            <div class="change">📦 Active items</div>
        </div>
        <div class="stat-card">
            <h3>Total Inventory Value</h3>
            <div class="value">$${dashboardData.stats.totalValue.toFixed(0)}</div>
            <div class="change">💰 Stock value</div>
        </div>
        <div class="stat-card">
            <h3>Total Stock Units</h3>
            <div class="value">${dashboardData.stats.totalStock}</div>
            <div class="change">📊 Items in inventory</div>
        </div>
        <div class="stat-card">
            <h3>Low Stock Alert</h3>
            <div class="value" style="color: ${dashboardData.stats.lowStock > 0 ? '#DC3545' : '#28A745'}">
                ${dashboardData.stats.lowStock}
            </div>
            <div class="change">⚠️ Items < 20 units</div>
        </div>
        <div class="stat-card">
            <h3>Categories</h3>
            <div class="value">${dashboardData.stats.categories}</div>
            <div class="change">🏷️ Product types</div>
        </div>
        <div class="stat-card">
            <h3>Average Price</h3>
            <div class="value">$${dashboardData.stats.averagePrice.toFixed(2)}</div>
            <div class="change">💵 Per product</div>
        </div>
    `;
}

// Display category chart
function displayCategoryChart() {
    const products = dashboardData.products;
    const categories = {};

    // Count products by category
    products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });

    // Create bar chart
    const chartContainer = document.getElementById('categoryChart');
    const maxCount = Math.max(...Object.values(categories));

    chartContainer.innerHTML = Object.entries(categories).map(([category, count]) => {
        const height = (count / maxCount) * 100;
        return `
            <div class="bar" style="height: ${height}%;">
                <div class="bar-value">${count}</div>
                <div class="bar-label">${category}</div>
            </div>
        `;
    }).join('');
}

// Display products table
function displayProductsTable() {
    const tbody = document.querySelector('#productsTable tbody');

    if (dashboardData.products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = dashboardData.products.map(product => {
        let stockStatus = 'status-available';
        let stockText = 'Available';

        if (product.stock === 0) {
            stockStatus = 'status-out';
            stockText = 'Out of Stock';
        } else if (product.stock < 20) {
            stockStatus = 'status-low';
            stockText = 'Low Stock';
        }

        return `
            <tr>
                <td>${product.id}</td>
                <td><strong>${product.name}</strong></td>
                <td>${product.category || 'N/A'}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge ${stockStatus}">${stockText}</span></td>
                <td>${product.origin || 'N/A'}</td>
            </tr>
        `;
    }).join('');
}

// Display cart table
async function displayCartTable() {
    const tbody = document.querySelector('#cartTable tbody');

    try {
        const response = await fetch(`${API_BASE_URL}/admin/carts`);
        const cartData = await response.json();

        if (cartData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No cart items found</td></tr>';
            return;
        }

        tbody.innerHTML = cartData.map(item => `
            <tr>
                <td>#${item.id}</td>
                <td>${item.session_id ? item.session_id.substring(0, 20) + '...' : 'N/A'}</td>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>${new Date(item.created_at).toLocaleString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading cart data:', error);
        tbody.innerHTML = '<tr><td colspan="5">Error loading cart data</td></tr>';
    }
}

// Display orders table
async function displayOrdersTable() {
    const tbody = document.querySelector('#ordersTable tbody');

    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders`);
        const orders = await response.json();

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No orders found</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => {
            let statusColor = '#FFC107';
            if (order.status === 'processing') statusColor = '#17A2B8';
            if (order.status === 'shipped') statusColor = '#17A2B8';
            if (order.status === 'delivered') statusColor = '#28A745';
            if (order.status === 'cancelled') statusColor = '#DC3545';

            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.customer_name}</td>
                    <td>$${order.total_amount.toFixed(2)}</td>
                    <td><span class="status-badge" style="background: ${statusColor}20; color: ${statusColor}">${order.status}</span></td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        tbody.innerHTML = '<tr><td colspan="5">Error loading orders</td></tr>';
    }
}

// Refresh dashboard
function refreshDashboard() {
    // Show loading state
    document.getElementById('statsGrid').innerHTML = '<div class="loading">Refreshing...</div>';

    // Reload data
    setTimeout(() => {
        loadDashboard();
    }, 500);
}

// Export data as JSON
function exportData() {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `matcha-data-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();

    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadDashboard();
    }, 30000);
});