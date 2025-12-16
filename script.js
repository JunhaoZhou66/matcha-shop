/* script.js */

// 动态注入购物车 HTML 结构 (避免每个页面都写一遍)
const cartHtml = `
    <div class="cart-drawer-overlay" id="cartOverlay" onclick="toggleCart()"></div>
    <div class="cart-drawer" id="cartDrawer">
        <div class="cart-header">
            <span class="serif" style="font-size: 1.2rem;">Your Bag (<span id="cartCount">1</span>)</span>
            <span class="close-cart" onclick="toggleCart()">&times;</span>
        </div>
        
        <div class="shipping-bar">
            <p style="font-size: 0.8rem; margin-bottom: 5px;">You are $11.00 away from <strong>Free Shipping</strong></p>
            <div class="progress-bg">
                <div class="progress-fill" style="width: 75%;"></div>
            </div>
        </div>

        <div class="cart-items">
            <div class="cart-item">
                <img src="https://images.unsplash.com/photo-1582793988951-9aed5509eb97?q=80&w=200" alt="Product">
                <div style="display: flex; flex-direction: column; justify-content: center; width: 100%;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span class="serif">Ceremonial Grade Matcha</span>
                        <span>$39.00</span>
                    </div>
                    <span style="font-size: 0.8rem; color: #888;">Size: 30g</span>
                    <div style="display: flex; justify-content: space-between; margin-top: 10px; align-items: center;">
                        <div style="border: 1px solid #ddd; padding: 2px 8px; font-size: 0.8rem;">
                            <span style="cursor:pointer; padding-right:5px;">-</span> 1 <span style="cursor:pointer; padding-left:5px;">+</span>
                        </div>
                        <span style="font-size: 0.7rem; border-bottom: 1px solid #333; cursor: pointer;">REMOVE</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee;">
                <p class="serif" style="margin-bottom: 1rem;">You might also like</p>
                <div style="display: flex; gap: 1rem;">
                    <div style="width: 80px; height: 80px; background: #f0f0f0; overflow: hidden;">
                        <img src="https://images.unsplash.com/photo-1626803775151-61d756612fcd?q=80&w=200" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div>
                        <p style="font-size: 0.9rem;">Bamboo Whisk</p>
                        <p style="font-size: 0.8rem; color: #666;">$24.00</p>
                        <button style="margin-top: 5px; background: none; border: 1px solid #ccc; padding: 2px 10px; font-size: 0.7rem; cursor: pointer;">ADD</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="cart-footer">
            <div class="cart-subtotal">
                <span>Subtotal</span>
                <span>$39.00</span>
            </div>
            <p style="font-size: 0.8rem; color: #666; margin-bottom: 1rem;">Shipping & taxes calculated at checkout.</p>
            <button class="add-to-cart-btn" style="margin-bottom: 0;">CHECKOUT</button>
        </div>
    </div>
`;

// 页面加载时执行
document.addEventListener("DOMContentLoaded", function() {
    // 1. 注入购物车HTML
    const placeholder = document.getElementById('cart-drawer-placeholder');
    if(placeholder) placeholder.innerHTML = cartHtml;
});

// 打开/关闭 购物车
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    
    // 切换 class active
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
}

// 加入购物车逻辑 (模拟)
function addToCart(product, price) {
    // 如果有产品页面的处理函数，使用它
    if (window.productPageFunctions && window.productPageFunctions.addToCartHandler) {
        // 从产品名称推测产品ID（临时解决方案）
        const productId = 1; // 默认ID
        window.productPageFunctions.addToCartHandler(productId, product, price);
    } else {
        toggleCart(); // 只要点了加入购物车，就自动弹出侧边栏
        // 这里可以添加逻辑：更新数量，更新总价等
        console.log("Added " + product + " to bag at $" + price);
    }
}

// 手风琴折叠效果 (详情页)
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