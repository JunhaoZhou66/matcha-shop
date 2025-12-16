// Simple Product Page Script - All-in-One
const API_BASE_URL = 'http://localhost:5001/api';

// Session Management
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('sessionId', sessionId);
}

// Current product data
let currentProduct = null;

// Utility function
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Get product ID from URL
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Load product details
async function loadProductDetails() {
    const productId = getProductId();
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        const product = await response.json();
        currentProduct = product;
        displayProduct(product);
    } catch (error) {
        console.error('Error loading product:', error);
        document.querySelector('.product-container').innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <h2>Product Not Found</h2>
                <p>Sorry, we couldn't find the product you're looking for.</p>
                <a href="index.html" style="color: #7A9A6E;">← Back to Shop</a>
            </div>
        `;
    }
}

// Display product details
function displayProduct(product) {
    // Update product image
    const productImage = document.querySelector('.product-img-large');
    if (productImage) {
        productImage.src = product.image_url;
        productImage.alt = product.name;
    }

    // Update product info
    const productInfo = document.querySelector('.product-info');
    if (productInfo) {
        // Update name
        const nameElement = productInfo.querySelector('h1');
        if (nameElement) {
            nameElement.textContent = product.name;
        }

        // Update price
        const priceElement = productInfo.querySelector('p');
        if (priceElement) {
            priceElement.innerHTML = `$${product.price.toFixed(2)} USD`;
        }

        // Update button
        const addToCartBtn = productInfo.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            // Update button text with correct price
            addToCartBtn.textContent = `Add to Cart — $${product.price.toFixed(2)}`;
            // Remove any existing onclick
            addToCartBtn.removeAttribute('onclick');
            // Add new event listener
            addToCartBtn.addEventListener('click', function() {
                addToCartHandler(product.id, product.name, product.price);
            });
        }
    }
}

// Simple add to cart function
async function addToCartHandler(productId, productName, productPrice) {
    console.log('Adding to cart:', productId, productName, productPrice);

    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add to cart');
        }

        const result = await response.json();
        console.log('Add to cart result:', result);

        // Update cart count
        await updateCartCount();

        // Show cart drawer
        if (typeof toggleCart === 'function') {
            toggleCart();
        }

        // Load cart data if available
        await loadCartData();

        // Show success message
        showSuccessMessage(productName);

    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

// Update cart count
async function updateCartCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/count?sessionId=${sessionId}`, {
            headers: {
                'X-Session-ID': sessionId
            }
        });
        const data = await response.json();
        const count = data.count || 0;

        // Update all cart count elements
        document.querySelectorAll('#cartCount').forEach(el => {
            el.textContent = count;
        });
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Load cart data
async function loadCartData() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart?sessionId=${sessionId}`, {
            headers: {
                'X-Session-ID': sessionId
            }
        });
        const cartData = await response.json();

        // If script-api.js is loaded, use its render function
        if (window.renderCart) {
            window.renderCart(cartData);
        } else {
            // Simple cart update
            updateCartDisplay(cartData);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Simple cart display update
function updateCartDisplay(cartData) {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;

    const { items, subtotal, shipping, total } = cartData;

    if (items.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: #666;">Your cart is empty</p>
            </div>
        `;
    } else {
        // Simple cart item display
        cartItems.innerHTML = items.map(item => `
            <div class="cart-item">
                <img src="${item.image_url}" alt="${item.name}">
                <div style="flex: 1; padding: 0 1rem;">
                    <div style="font-weight: bold;">${item.name}</div>
                    <div style="color: #666;">Quantity: ${item.quantity}</div>
                    <div style="color: #7A9A6E;">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }

    // Update totals
    const subtotalElement = document.querySelector('.cart-subtotal');
    if (subtotalElement) {
        subtotalElement.innerHTML = `
            <span>Subtotal</span>
            <span>$${subtotal}</span>
        `;
    }
}

// Show success message
function showSuccessMessage(productName) {
    // Create a simple notification
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
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    notification.textContent = `✓ ${productName} added to cart!`;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Override the global addToCart function if it exists
window.addToCart = function(name, price) {
    if (currentProduct) {
        addToCartHandler(currentProduct.id, currentProduct.name, currentProduct.price);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Product page script loaded');
    loadProductDetails();
    updateCartCount();
});

// Export functions for external use
window.productPageFunctions = {
    addToCartHandler,
    updateCartCount,
    loadCartData
};