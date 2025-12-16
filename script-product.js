// Product Detail Page Script
const API_BASE_URL = 'http://localhost:5001/api';

// Get session ID
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('sessionId', sessionId);
}

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

        // Update description (after Add to Cart button)
        const addToCartBtn = productInfo.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            // Update button text with correct price
            addToCartBtn.textContent = `Add to Cart — $${product.price.toFixed(2)}`;
            // Update button to use the product ID and price
            addToCartBtn.onclick = () => handleAddToCart(product.id);

            // Add description after button
            const existingDescription = productInfo.querySelector('.product-description-text');
            if (!existingDescription) {
                const descriptionDiv = document.createElement('div');
                descriptionDiv.className = 'product-description-text';
                descriptionDiv.style.cssText = 'margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #D6D3CF;';
                descriptionDiv.innerHTML = `
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">About This Product</h3>
                    <p style="color: #666; line-height: 1.6;">${product.description}</p>
                `;
                addToCartBtn.parentElement.appendChild(descriptionDiv);
            }
        }

        // Update accordion details
        updateAccordionContent(product);
    }

    // Load related products
    loadRelatedProducts(product.category, product.id);
}

// Update accordion content with product details
function updateAccordionContent(product) {
    const accordions = document.querySelectorAll('.accordion-content');

    // Details section (first accordion)
    if (accordions[0]) {
        let detailsHTML = '<ul style="list-style: none; padding: 0;">';

        if (product.origin) {
            detailsHTML += `<li style="margin-bottom: 0.5rem;">• <strong>Origin:</strong> ${product.origin}</li>`;
        }
        if (product.weight) {
            detailsHTML += `<li style="margin-bottom: 0.5rem;">• <strong>Weight:</strong> ${product.weight}</li>`;
        }
        if (product.servings) {
            detailsHTML += `<li style="margin-bottom: 0.5rem;">• <strong>Servings:</strong> ${product.servings} servings</li>`;
        }
        if (product.organic_percentage) {
            detailsHTML += `<li style="margin-bottom: 0.5rem;">• <strong>Organic:</strong> ${product.organic_percentage}%</li>`;
        }
        if (product.category) {
            detailsHTML += `<li style="margin-bottom: 0.5rem;">• <strong>Category:</strong> ${product.category}</li>`;
        }
        detailsHTML += `<li style="margin-bottom: 0.5rem;">• <strong>Stock:</strong> ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</li>`;
        detailsHTML += '</ul>';

        accordions[0].innerHTML = detailsHTML;
    }

    // Preparation section (second accordion) - customize based on category
    if (accordions[1]) {
        let preparationHTML = '';

        if (product.category === 'Ceremonial' || product.category === 'Culinary') {
            preparationHTML = `
                <ol style="padding-left: 1.2rem;">
                    <li style="margin-bottom: 0.5rem;">Heat water to 175°F (80°C)</li>
                    <li style="margin-bottom: 0.5rem;">Add 1-2 tsp of matcha to bowl</li>
                    <li style="margin-bottom: 0.5rem;">Pour 2oz of water</li>
                    <li style="margin-bottom: 0.5rem;">Whisk in W or M motion until frothy</li>
                    <li style="margin-bottom: 0.5rem;">Enjoy immediately</li>
                </ol>
            `;
        } else if (product.category === 'Ready-to-Drink') {
            preparationHTML = '<p>Shake well before drinking. Best served chilled. Consume within 24 hours of opening.</p>';
        } else if (product.category === 'Sets') {
            preparationHTML = '<p>See included instructions for proper use of each tool. Handle with care and clean after each use.</p>';
        } else if (product.category === 'Snacks') {
            preparationHTML = '<p>Store in a cool, dry place. Best consumed within 3 months of opening.</p>';
        } else {
            preparationHTML = '<p>Follow the instructions on the package for best results.</p>';
        }

        accordions[1].innerHTML = preparationHTML;
    }
}

// Load related products
async function loadRelatedProducts(category, currentProductId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products?category=${category}&limit=4`);
        const products = await response.json();

        // Filter out current product and get 3 related ones
        const relatedProducts = products
            .filter(p => p.id !== parseInt(currentProductId))
            .slice(0, 3);

        displayRelatedProducts(relatedProducts);
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// Display related products
function displayRelatedProducts(products) {
    const container = document.querySelector('.also-like-grid');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="also-like-item" onclick="goToProduct(${product.id})" style="cursor: pointer;">
            <img src="${product.image_url}" alt="${product.name}">
            <p>${product.name}</p>
            <span>$${product.price.toFixed(2)}</span>
        </div>
    `).join('');
}

// Navigate to another product
function goToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Add to cart handler
async function handleAddToCart(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId
            },
            body: JSON.stringify({ productId, quantity: 1, sessionId })
        });

        const result = await response.json();
        if (result) {
            // Update cart count
            updateCartBadge();
            // Show cart
            toggleCart();
            // Reload cart contents
            if (window.matchaAPI) {
                window.matchaAPI.loadCart();
            }
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Update cart badge
async function updateCartBadge() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/count?sessionId=${sessionId}`, {
            headers: {
                'X-Session-ID': sessionId
            }
        });
        const data = await response.json();
        const count = data.count || 0;

        // Update all cart badges
        document.querySelectorAll('#cartCount').forEach(el => {
            el.textContent = count;
        });
    } catch (error) {
        console.error('Error updating cart badge:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    updateCartBadge();
});