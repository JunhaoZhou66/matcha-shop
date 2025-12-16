// API Configuration - uses relative URL for production compatibility
const API_BASE_URL = '/api';

// Session Management
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('sessionId', sessionId);
}

// State Management
const state = {
    products: [],
    cart: [],
    cartCount: 0,
    user: null,
    token: localStorage.getItem('token')
};

// Utility Functions
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// API Functions
const api = {
    // Products
    async getProducts(category = null) {
        try {
            const url = category && category !== 'all'
                ? `${API_BASE_URL}/products?category=${category}`
                : `${API_BASE_URL}/products`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    },

    async getProduct(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    },

    // Cart
    async getCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart?sessionId=${sessionId}`, {
                headers: {
                    'X-Session-ID': sessionId
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart:', error);
            return { items: [], subtotal: 0, shipping: 0, total: 0 };
        }
    },

    async addToCart(productId, quantity = 1) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                body: JSON.stringify({ productId, quantity, sessionId })
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding to cart:', error);
            return null;
        }
    },

    async updateCartItem(cartItemId, quantity) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                body: JSON.stringify({ cartItemId, quantity })
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating cart:', error);
            return null;
        }
    },

    async removeFromCart(itemId) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'X-Session-ID': sessionId
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error removing from cart:', error);
            return null;
        }
    },

    async getCartCount() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/count?sessionId=${sessionId}`, {
                headers: {
                    'X-Session-ID': sessionId
                }
            });
            const data = await response.json();
            return data.count || 0;
        } catch (error) {
            console.error('Error fetching cart count:', error);
            return 0;
        }
    },

    // Orders
    async createOrder(orderData) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                body: JSON.stringify({ ...orderData, sessionId })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            return null;
        }
    }
};

// UI Functions
function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" style="cursor: pointer;" onclick="goToProduct(${product.id})">
            <div class="product-img-wrap">
                <img src="${product.image_url}" alt="${product.name}" class="product-img">
            </div>
            <h3 class="product-name">${product.name}</h3>
            <span class="product-price">$${product.price.toFixed(2)} USD</span>
        </div>
    `).join('');
}

// Navigate to product page
function goToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function renderCart(cartData) {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;

    const { items, subtotal, shipping, total, freeShippingThreshold } = cartData;

    // Update cart count
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cartCount').forEach(el => el.textContent = cartCount);
    state.cartCount = cartCount;

    // Update shipping bar
    const shippingBar = document.querySelector('.shipping-bar');
    if (shippingBar) {
        const remaining = Math.max(0, freeShippingThreshold - parseFloat(subtotal));
        const percentage = Math.min(100, (parseFloat(subtotal) / freeShippingThreshold) * 100);

        shippingBar.innerHTML = `
            ${remaining > 0 ?
                `<p style="font-size: 0.8rem; margin-bottom: 5px;">You are $${remaining.toFixed(2)} away from <strong>Free Shipping</strong></p>` :
                `<p style="font-size: 0.8rem; margin-bottom: 5px;">✓ You qualify for <strong>Free Shipping!</strong></p>`
            }
            <div class="progress-bg">
                <div class="progress-fill" style="width: ${percentage}%;"></div>
            </div>
        `;
    }

    // Render cart items
    if (items.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: #666;">Your cart is empty</p>
                <button onclick="toggleCart()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #7A9A6E; color: white; border: none; cursor: pointer;">CONTINUE SHOPPING</button>
            </div>
        `;
    } else {
        cartItems.innerHTML = items.map(item => `
            <div class="cart-item">
                <img src="${item.image_url}" alt="${item.name}">
                <div style="display: flex; flex-direction: column; justify-content: center; width: 100%;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span class="serif">${item.name}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <span style="font-size: 0.8rem; color: #888;">Price: $${item.price.toFixed(2)}</span>
                    <div style="display: flex; justify-content: space-between; margin-top: 10px; align-items: center;">
                        <div style="border: 1px solid #ddd; padding: 2px 8px; font-size: 0.8rem; display: flex; align-items: center; gap: 10px;">
                            <span onclick="updateQuantity(${item.id}, ${item.quantity - 1})" style="cursor:pointer; font-size: 1.2rem; line-height: 1;">-</span>
                            <span>${item.quantity}</span>
                            <span onclick="updateQuantity(${item.id}, ${item.quantity + 1})" style="cursor:pointer; font-size: 1.2rem; line-height: 1;">+</span>
                        </div>
                        <span onclick="removeItem(${item.id})" style="font-size: 0.7rem; border-bottom: 1px solid #333; cursor: pointer;">REMOVE</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update footer
    const cartFooter = document.querySelector('.cart-footer');
    if (cartFooter) {
        const subtotalElement = cartFooter.querySelector('.cart-subtotal');
        if (subtotalElement) {
            subtotalElement.innerHTML = `
                <span>Subtotal</span>
                <span>$${subtotal}</span>
            `;
        }

        if (parseFloat(shipping) > 0) {
            const shippingElement = document.createElement('div');
            shippingElement.className = 'cart-subtotal';
            shippingElement.innerHTML = `
                <span>Shipping</span>
                <span>$${shipping}</span>
            `;
            subtotalElement.after(shippingElement);
        }
    }
}

// Event Handlers
async function handleAddToCart(productId) {
    const result = await api.addToCart(productId);
    if (result) {
        await loadCart();
        toggleCart();
        showNotification(`Added to cart!`);
    }
}

async function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity <= 0) {
        await removeItem(cartItemId);
    } else {
        const result = await api.updateCartItem(cartItemId, newQuantity);
        if (result) {
            await loadCart();
        }
    }
}

async function removeItem(cartItemId) {
    const result = await api.removeFromCart(cartItemId);
    if (result) {
        await loadCart();
        showNotification('Item removed from cart');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #7A9A6E;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize Functions
async function loadProducts(category = null) {
    const products = await api.getProducts(category);
    state.products = products;
    renderProducts(products);
}

async function loadCart() {
    const cartData = await api.getCart();
    state.cart = cartData.items;
    renderCart(cartData);
}

async function updateCartBadge() {
    const count = await api.getCartCount();
    state.cartCount = count;

    // Update all cart badges
    document.querySelectorAll('.cart-badge').forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

// Filter products by category
function filterProducts(category) {
    // Update active state
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load filtered products
    loadProducts(category === 'all' ? null : category);
}

// Checkout function
async function checkout() {
    // Simple checkout - in real app would have payment processing
    const checkoutData = {
        shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA'
        },
        paymentMethod: 'credit_card'
    };

    const order = await api.createOrder(checkoutData);
    if (order && order.success) {
        alert(`Order placed successfully! Order ID: ${order.orderId}`);
        toggleCart();
        await loadCart(); // This will show empty cart
    } else {
        alert('Failed to place order. Please try again.');
    }
}

// Override original toggleCart to maintain state
const originalToggleCart = window.toggleCart;
window.toggleCart = function() {
    originalToggleCart();
    // Load cart data when opening
    const drawer = document.getElementById('cartDrawer');
    if (drawer.classList.contains('active')) {
        loadCart();
    }
}

// Page initialization
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize cart
    await updateCartBadge();

    // Load products if on homepage
    if (document.getElementById('productsGrid')) {
        await loadProducts();
    }

    // Add checkout handler
    const checkoutBtn = document.querySelector('.cart-footer .add-to-cart-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = checkout;
    }

    // Add category filter handlers
    const categoryFilters = document.querySelectorAll('.categories span');
    categoryFilters.forEach(filter => {
        filter.classList.add('category-filter');
        filter.style.cursor = 'pointer';

        filter.onclick = function() {
            const categoryMap = {
                'Shop All': 'all',
                'Ceremonial': 'Ceremonial',
                'Culinary': 'Culinary',
                'Sets': 'Sets'
            };
            const category = categoryMap[this.textContent] || 'all';
            filterProducts(category);
        };
    });

    // Initialize if cart is already open
    const drawer = document.getElementById('cartDrawer');
    if (drawer && drawer.classList.contains('active')) {
        await loadCart();
    }
});

// Export for use in other scripts
window.matchaAPI = {
    api,
    state,
    loadProducts,
    loadCart,
    handleAddToCart,
    updateQuantity,
    removeItem
};

// Also export renderCart globally
window.renderCart = renderCart;