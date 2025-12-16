/* Kyoto Mist - Shopify Theme Script */

// Cart State
const cartState = {
  items: [],
  itemCount: 0,
  totalPrice: 0
};

// Toggle Cart Drawer
function toggleCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');

  if (drawer && overlay) {
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');

    if (drawer.classList.contains('active')) {
      loadCart();
    }
  }
}

// Load Cart Data from Shopify
async function loadCart() {
  try {
    const response = await fetch('/cart.js');
    const cart = await response.json();

    cartState.items = cart.items;
    cartState.itemCount = cart.item_count;
    cartState.totalPrice = cart.total_price;

    renderCart(cart);
    updateCartCount(cart.item_count);
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}

// Render Cart Contents
function renderCart(cart) {
  const cartItems = document.querySelector('.cart-items');
  const cartCount = document.getElementById('cartCount');
  const cartSubtotal = document.querySelector('.cart-subtotal span:last-child');

  if (cartCount) {
    cartCount.textContent = cart.item_count;
  }

  if (!cartItems) return;

  // Free shipping threshold (in cents)
  const freeShippingThreshold = 5000; // $50
  const remaining = Math.max(0, freeShippingThreshold - cart.total_price);
  const percentage = Math.min(100, (cart.total_price / freeShippingThreshold) * 100);

  // Update shipping bar
  const shippingBar = document.querySelector('.shipping-bar');
  if (shippingBar) {
    shippingBar.innerHTML = `
      ${remaining > 0 ?
        `<p style="font-size: 0.8rem; margin-bottom: 5px;">You are $${(remaining / 100).toFixed(2)} away from <strong>Free Shipping</strong></p>` :
        `<p style="font-size: 0.8rem; margin-bottom: 5px;">✓ You qualify for <strong>Free Shipping!</strong></p>`
      }
      <div class="progress-bg">
        <div class="progress-fill" style="width: ${percentage}%;"></div>
      </div>
    `;
  }

  if (cart.items.length === 0) {
    cartItems.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <p style="color: #666;">Your cart is empty</p>
        <button onclick="toggleCart()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #7A9A6E; color: white; border: none; cursor: pointer;">CONTINUE SHOPPING</button>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <img src="${item.image}" alt="${item.title}">
        <div style="display: flex; flex-direction: column; justify-content: center; width: 100%;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span class="serif">${item.product_title}</span>
            <span>${formatMoney(item.line_price)}</span>
          </div>
          <span style="font-size: 0.8rem; color: #888;">${item.variant_title || ''}</span>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; align-items: center;">
            <div style="border: 1px solid #ddd; padding: 2px 8px; font-size: 0.8rem; display: flex; align-items: center; gap: 10px;">
              <span onclick="updateQuantity('${item.key}', ${item.quantity - 1})" style="cursor:pointer; font-size: 1.2rem; line-height: 1;">-</span>
              <span>${item.quantity}</span>
              <span onclick="updateQuantity('${item.key}', ${item.quantity + 1})" style="cursor:pointer; font-size: 1.2rem; line-height: 1;">+</span>
            </div>
            <span onclick="removeItem('${item.key}')" style="font-size: 0.7rem; border-bottom: 1px solid #333; cursor: pointer;">REMOVE</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Update subtotal
  if (cartSubtotal) {
    cartSubtotal.textContent = formatMoney(cart.total_price);
  }
}

// Format money (Shopify uses cents)
function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2);
}

// Update Cart Count Badge
function updateCartCount(count) {
  document.querySelectorAll('#cartCount, .cart-count').forEach(el => {
    el.textContent = count;
  });
}

// Add to Cart
async function addToCart(variantId, quantity = 1) {
  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity
      })
    });

    if (!response.ok) throw new Error('Failed to add to cart');

    await loadCart();
    toggleCart();
    showNotification('Added to cart!');

  } catch (error) {
    console.error('Error adding to cart:', error);
    showNotification('Failed to add item', true);
  }
}

// Update Quantity
async function updateQuantity(key, quantity) {
  if (quantity <= 0) {
    await removeItem(key);
    return;
  }

  try {
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: key,
        quantity: quantity
      })
    });

    if (!response.ok) throw new Error('Failed to update cart');

    await loadCart();

  } catch (error) {
    console.error('Error updating cart:', error);
  }
}

// Remove Item
async function removeItem(key) {
  await updateQuantity(key, 0);
  showNotification('Item removed');
}

// Show Notification
function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isError ? '#dc3545' : '#7A9A6E'};
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

// Accordion Toggle (for product page)
function toggleAccordion(header) {
  const content = header.nextElementSibling;
  const icon = header.querySelector('span:last-child');

  if (content.style.maxHeight) {
    content.style.maxHeight = null;
    icon.innerText = "+";
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
    icon.innerText = "-";
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  // Load initial cart count
  loadCart();
});
