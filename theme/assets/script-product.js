/* Kyoto Mist - Product Page Script */

// Product Page Functions
const ProductPage = {
  // Current variant
  currentVariant: null,

  // Initialize product page
  init: function() {
    this.bindVariantSelectors();
    this.bindAddToCartButton();
  },

  // Bind variant selector events
  bindVariantSelectors: function() {
    const variantSelectors = document.querySelectorAll('[data-variant-selector]');
    variantSelectors.forEach(selector => {
      selector.addEventListener('change', (e) => {
        this.updateVariant(e.target.value);
      });
    });
  },

  // Update variant selection
  updateVariant: function(variantId) {
    const variants = window.productVariants || [];
    const variant = variants.find(v => v.id == variantId);

    if (variant) {
      this.currentVariant = variant;
      this.updatePrice(variant);
      this.updateButton(variant);
      this.updateURL(variant);
    }
  },

  // Update displayed price
  updatePrice: function(variant) {
    const priceElement = document.querySelector('.pd-price p');
    if (priceElement) {
      priceElement.textContent = `$${(variant.price / 100).toFixed(2)} USD`;
    }

    const buttonPrice = document.querySelector('.add-to-cart-btn');
    if (buttonPrice && variant.available) {
      buttonPrice.textContent = `Add to Cart — $${(variant.price / 100).toFixed(2)}`;
    }
  },

  // Update add to cart button state
  updateButton: function(variant) {
    const button = document.querySelector('.add-to-cart-btn');
    if (!button) return;

    if (variant.available) {
      button.disabled = false;
      button.textContent = `Add to Cart — $${(variant.price / 100).toFixed(2)}`;
    } else {
      button.disabled = true;
      button.textContent = 'Sold Out';
    }
  },

  // Update URL with variant
  updateURL: function(variant) {
    if (history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      history.replaceState({}, '', url);
    }
  },

  // Bind add to cart button
  bindAddToCartButton: function() {
    const button = document.querySelector('.add-to-cart-btn');
    if (!button) return;

    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const variantId = this.currentVariant?.id || button.dataset.variantId;
      if (!variantId) {
        console.error('No variant selected');
        return;
      }

      // Disable button during request
      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = 'Adding...';

      try {
        await addToCart(variantId, 1);
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  ProductPage.init();

  // Set initial variant if on product page
  const initialVariant = document.querySelector('[data-variant-selector]');
  if (initialVariant) {
    ProductPage.updateVariant(initialVariant.value);
  }
});
