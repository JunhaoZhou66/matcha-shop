const db = require('./database');

const updateProductImages = () => {
  // 更新的图片URL - 使用更具体的抹茶产品图片
  const imageUpdates = [
    // 抹茶粉系列
    { id: 1, image_url: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=400&h=400&fit=crop' }, // Ceremonial Grade
    { id: 2, image_url: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400&h=400&fit=crop' }, // Premium Ceremonial
    { id: 3, image_url: 'https://images.unsplash.com/photo-1571950006418-f226dc106482?w=400&h=400&fit=crop' }, // Daily Ritual Tin
    { id: 4, image_url: 'https://images.unsplash.com/photo-1563822249548-9eb72bc1db8e?w=400&h=400&fit=crop' }, // Culinary Grade
    { id: 5, image_url: 'https://images.unsplash.com/photo-1536638150493-274712571212?w=400&h=400&fit=crop' }, // Barista Blend Latte
    { id: 6, image_url: 'https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=400&h=400&fit=crop' }, // Organic Matcha Supreme

    // 工具套装
    { id: 7, image_url: 'https://images.unsplash.com/photo-1626803775151-61d756612fcd?w=400&h=400&fit=crop' }, // Bamboo Whisk Set
    { id: 8, image_url: 'https://images.unsplash.com/photo-1595659147062-296a05b30885?w=400&h=400&fit=crop' }, // Complete Ceremony Set
    { id: 9, image_url: 'https://images.unsplash.com/photo-1567922045116-2a00fae2ed03?w=400&h=400&fit=crop' }, // Starter Kit
    { id: 10, image_url: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=400&h=400&fit=crop' }, // Travel Set

    // 即饮产品
    { id: 11, image_url: 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=400&h=400&fit=crop' }, // Cold Brew
    { id: 12, image_url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400&h=400&fit=crop' }, // Energy Shot
    { id: 13, image_url: 'https://images.unsplash.com/photo-1625021659542-becb7a24e1ca?w=400&h=400&fit=crop' }, // Sparkling Matcha

    // 抹茶零食
    { id: 14, image_url: 'https://images.unsplash.com/photo-1618110908373-8fdf0336bb38?w=400&h=400&fit=crop' }, // Chocolate Bar
    { id: 15, image_url: 'https://images.unsplash.com/photo-1558985212-92c2ff0b56e7?w=400&h=400&fit=crop' }, // Cookies
    { id: 16, image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784ba3?w=400&h=400&fit=crop' }, // Honey
    { id: 17, image_url: 'https://images.unsplash.com/photo-1604908554025-16d652b5c691?w=400&h=400&fit=crop' }, // Mochi

    // 限定版
    { id: 18, image_url: 'https://images.unsplash.com/photo-1520860560195-0f14c411476e?w=400&h=400&fit=crop' }, // Sakura Blend
    { id: 19, image_url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=400&fit=crop' }, // Harvest Moon
    { id: 20, image_url: 'https://images.unsplash.com/photo-1616469829718-0faf16324280?w=400&h=400&fit=crop' }  // Master's Reserve
  ];

  // Pexels alternative URLs (backup options for matcha products)
  const alternativeImages = [
    'https://cdn.pixabay.com/photo/2017/06/08/08/23/matcha-2382985_640.jpg',
    'https://cdn.pixabay.com/photo/2016/07/26/17/59/matcha-1543276_640.jpg',
    'https://cdn.pixabay.com/photo/2018/05/21/12/52/matcha-3418320_640.jpg',
    'https://cdn.pixabay.com/photo/2017/04/17/11/03/matcha-2237384_640.jpg',
    'https://cdn.pixabay.com/photo/2021/10/14/20/27/matcha-6710062_640.jpg',
    'https://cdn.pixabay.com/photo/2017/06/24/13/17/matcha-2437714_640.jpg',
    'https://cdn.pixabay.com/photo/2021/12/13/00/37/matcha-latte-6867268_640.jpg',
    'https://cdn.pixabay.com/photo/2016/11/29/13/00/biscuit-1869700_640.jpg',
    'https://cdn.pixabay.com/photo/2017/01/04/20/55/matcha-1952962_640.jpg',
    'https://cdn.pixabay.com/photo/2020/03/21/11/17/macarons-4953689_640.jpg',
    'https://cdn.pixabay.com/photo/2019/10/07/10/41/matcha-tea-4532308_640.jpg',
    'https://cdn.pixabay.com/photo/2017/10/13/16/45/matcha-2848125_640.jpg',
    'https://cdn.pixabay.com/photo/2017/03/23/19/57/japan-2169311_640.jpg',
    'https://cdn.pixabay.com/photo/2021/01/05/21/36/matcha-5892481_640.jpg',
    'https://cdn.pixabay.com/photo/2020/11/11/11/37/matcha-5732232_640.jpg',
    'https://cdn.pixabay.com/photo/2017/05/02/22/43/tea-2279837_640.jpg',
    'https://cdn.pixabay.com/photo/2020/06/21/13/11/matcha-5325041_640.jpg',
    'https://cdn.pixabay.com/photo/2017/09/21/14/51/matcha-powder-2772166_640.jpg',
    'https://cdn.pixabay.com/photo/2020/04/17/14/07/matcha-5055178_640.jpg',
    'https://cdn.pixabay.com/photo/2021/02/06/08/37/matcha-5987301_640.jpg'
  ];

  const stmt = db.prepare('UPDATE products SET image_url = ? WHERE id = ?');

  imageUpdates.forEach((update, index) => {
    stmt.run(update.image_url, update.id, (err) => {
      if (err) {
        console.error(`Error updating image for product ${update.id}:`, err);
        // Try alternative image if main update fails
        if (alternativeImages[index]) {
          stmt.run(alternativeImages[index], update.id, (err2) => {
            if (!err2) {
              console.log(`✅ Updated product ${update.id} with alternative image`);
            }
          });
        }
      } else {
        console.log(`✅ Updated image for product ID ${update.id}`);
      }
    });
  });

  stmt.finalize(() => {
    console.log('🎨 All product images updated successfully!');
  });
};

// Run if called directly
if (require.main === module) {
  updateProductImages();
  setTimeout(() => {
    db.close();
  }, 2000);
}

module.exports = { updateProductImages };