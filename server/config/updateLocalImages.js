const db = require('./database');

// 更新商品图片为本地路径
const updateToLocalImages = () => {
  const imageUpdates = [
    { id: 1, image_url: '/images/products/ceremonial-grade.jpg' },
    { id: 2, image_url: '/images/products/premium-ceremonial.jpg' },
    { id: 3, image_url: '/images/products/daily-ritual.jpg' },
    { id: 4, image_url: '/images/products/culinary-grade.jpg' },
    { id: 5, image_url: '/images/products/barista-blend.jpg' },
    { id: 6, image_url: '/images/products/organic-supreme.jpg' },
    { id: 7, image_url: '/images/products/bamboo-whisk.jpg' },
    { id: 8, image_url: '/images/products/ceremony-set.jpg' },
    { id: 9, image_url: '/images/products/starter-kit.jpg' },
    { id: 10, image_url: '/images/products/travel-set.jpg' },
    { id: 11, image_url: '/images/products/cold-brew.jpg' },
    { id: 12, image_url: '/images/products/energy-shot.jpg' },
    { id: 13, image_url: '/images/products/sparkling-matcha.jpg' },
    { id: 14, image_url: '/images/products/chocolate-bar.jpg' },
    { id: 15, image_url: '/images/products/cookies.jpg' },
    { id: 16, image_url: '/images/products/honey.jpg' },
    { id: 17, image_url: '/images/products/mochi.jpg' },
    { id: 18, image_url: '/images/products/sakura-blend.jpg' },
    { id: 19, image_url: '/images/products/harvest-moon.jpg' },
    { id: 20, image_url: '/images/products/masters-reserve.jpg' }
  ];

  const stmt = db.prepare('UPDATE products SET image_url = ? WHERE id = ?');

  imageUpdates.forEach((update) => {
    stmt.run(update.image_url, update.id, (err) => {
      if (err) {
        console.error(`Error updating image for product ${update.id}:`, err);
      } else {
        console.log(`✅ Updated product ${update.id} to use local image: ${update.image_url}`);
      }
    });
  });

  stmt.finalize(() => {
    console.log('🎨 All products updated to use local images!');
    console.log('\n📁 图片文件夹位置: /images/products/');
    console.log('⚠️  注意: 您需要将实际的图片文件放入该文件夹');
    console.log('\n建议的图片命名:');
    imageUpdates.forEach(item => {
      console.log(`  - ${item.image_url.split('/').pop()}`);
    });
  });
};

// Run if called directly
if (require.main === module) {
  updateToLocalImages();
  setTimeout(() => {
    db.close();
  }, 2000);
}

module.exports = { updateToLocalImages };