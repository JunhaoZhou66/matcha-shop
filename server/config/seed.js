const db = require('./database');

const seedProducts = () => {
  const products = [
    // 抹茶粉系列 (Matcha Powder Series)
    {
      name: 'Ceremonial Grade Matcha',
      price: 39.00,
      description: 'First flush spring harvest from Uji, Kyoto. Perfect for traditional tea ceremonies.',
      category: 'Ceremonial',
      image_url: 'https://source.unsplash.com/400x400/?matcha,powder',
      stock: 50,
      origin: 'Uji, Kyoto Prefecture',
      weight: '30g',
      servings: 15,
      organic_percentage: 94
    },
    {
      name: 'Premium Ceremonial Matcha',
      price: 58.00,
      description: 'Ultra-premium grade from shaded tea gardens. Vibrant jade color with umami sweetness.',
      category: 'Ceremonial',
      image_url: 'https://source.unsplash.com/400x400/?matcha,premium',
      stock: 30,
      origin: 'Nishio, Aichi Prefecture',
      weight: '40g',
      servings: 20,
      organic_percentage: 100
    },
    {
      name: 'Daily Ritual Tin',
      price: 45.00,
      description: 'Versatile ceremonial-grade matcha for daily enjoyment. Smooth and balanced flavor.',
      category: 'Ceremonial',
      image_url: 'https://source.unsplash.com/400x400/?green,tea',
      stock: 75,
      origin: 'Kagoshima Prefecture',
      weight: '50g',
      servings: 25,
      organic_percentage: 90
    },
    {
      name: 'Culinary Grade Matcha',
      price: 24.00,
      description: 'Perfect for lattes, smoothies, and baking. Bold flavor that stands up to milk and sweeteners.',
      category: 'Culinary',
      image_url: 'https://source.unsplash.com/400x400/?matcha,culinary',
      stock: 100,
      origin: 'Shizuoka Prefecture',
      weight: '100g',
      servings: 50,
      organic_percentage: 85
    },
    {
      name: 'Barista Blend Latte',
      price: 32.00,
      description: 'Specially crafted for café-quality matcha lattes. Creamy texture with slight sweetness.',
      category: 'Culinary',
      image_url: 'https://source.unsplash.com/400x400/?matcha,latte',
      stock: 80,
      origin: 'Kyoto Prefecture',
      weight: '80g',
      servings: 40,
      organic_percentage: 88
    },
    {
      name: 'Organic Matcha Supreme',
      price: 65.00,
      description: '100% organic, single-origin matcha from heritage tea gardens. Limited harvest.',
      category: 'Ceremonial',
      image_url: 'https://source.unsplash.com/400x400/?organic,matcha',
      stock: 20,
      origin: 'Uji, Kyoto Prefecture',
      weight: '30g',
      servings: 15,
      organic_percentage: 100
    },

    // 抹茶工具套装 (Matcha Tools & Sets)
    {
      name: 'Bamboo Whisk Set',
      price: 28.00,
      description: 'Traditional 100-prong bamboo whisk (chasen) with ceramic holder.',
      category: 'Sets',
      image_url: 'https://source.unsplash.com/400x400/?bamboo,whisk',
      stock: 45,
      origin: 'Japan',
      weight: '150g',
      servings: null,
      organic_percentage: null
    },
    {
      name: 'Complete Ceremony Set',
      price: 89.00,
      description: 'Everything needed for traditional tea ceremony: bowl, whisk, scoop, and 30g ceremonial matcha.',
      category: 'Sets',
      image_url: 'https://source.unsplash.com/400x400/?tea,ceremony',
      stock: 25,
      origin: 'Japan',
      weight: '500g',
      servings: 15,
      organic_percentage: null
    },
    {
      name: 'Starter Kit Essential',
      price: 55.00,
      description: 'Perfect for beginners: whisk, bowl, scoop, and 40g daily matcha.',
      category: 'Sets',
      image_url: 'https://source.unsplash.com/400x400/?matcha,kit',
      stock: 60,
      origin: 'Japan',
      weight: '400g',
      servings: 20,
      organic_percentage: null
    },
    {
      name: 'Travel Matcha Set',
      price: 42.00,
      description: 'Portable set with travel case, mini whisk, and 20g matcha.',
      category: 'Sets',
      image_url: 'https://source.unsplash.com/400x400/?travel,matcha',
      stock: 35,
      origin: 'Japan',
      weight: '200g',
      servings: 10,
      organic_percentage: null
    },

    // 即饮抹茶产品 (Ready-to-Drink)
    {
      name: 'Matcha Cold Brew (6-Pack)',
      price: 28.00,
      description: 'Ready-to-drink organic matcha cold brew. No sugar added.',
      category: 'Ready-to-Drink',
      image_url: 'https://source.unsplash.com/400x400/?matcha,bottle',
      stock: 70,
      origin: 'Japan',
      weight: '1.5L',
      servings: 6,
      organic_percentage: 95
    },
    {
      name: 'Matcha Energy Shot (12-Pack)',
      price: 36.00,
      description: 'Concentrated matcha energy shots with L-theanine for sustained focus.',
      category: 'Ready-to-Drink',
      image_url: 'https://source.unsplash.com/400x400/?energy,drink',
      stock: 55,
      origin: 'Japan',
      weight: '720ml',
      servings: 12,
      organic_percentage: 90
    },
    {
      name: 'Sparkling Matcha (4-Pack)',
      price: 22.00,
      description: 'Refreshing carbonated matcha beverage with natural citrus notes.',
      category: 'Ready-to-Drink',
      image_url: 'https://source.unsplash.com/400x400/?sparkling,matcha',
      stock: 40,
      origin: 'Japan',
      weight: '1L',
      servings: 4,
      organic_percentage: 85
    },

    // 抹茶食品 (Matcha Foods)
    {
      name: 'Matcha Chocolate Bar',
      price: 12.00,
      description: 'Premium dark chocolate infused with ceremonial-grade matcha.',
      category: 'Snacks',
      image_url: 'https://source.unsplash.com/400x400/?chocolate,matcha',
      stock: 90,
      origin: 'Japan',
      weight: '80g',
      servings: 4,
      organic_percentage: 75
    },
    {
      name: 'Matcha Cookies (Box of 12)',
      price: 18.00,
      description: 'Artisanal butter cookies with matcha cream filling.',
      category: 'Snacks',
      image_url: 'https://source.unsplash.com/400x400/?cookies,matcha',
      stock: 65,
      origin: 'Japan',
      weight: '240g',
      servings: 12,
      organic_percentage: 70
    },
    {
      name: 'Matcha Honey',
      price: 16.00,
      description: 'Raw honey infused with premium matcha powder. Perfect for tea or toast.',
      category: 'Snacks',
      image_url: 'https://source.unsplash.com/400x400/?honey,green',
      stock: 50,
      origin: 'Japan',
      weight: '250g',
      servings: 20,
      organic_percentage: 100
    },
    {
      name: 'Matcha Mochi (8 pieces)',
      price: 14.00,
      description: 'Traditional Japanese rice cakes filled with matcha cream.',
      category: 'Snacks',
      image_url: 'https://source.unsplash.com/400x400/?mochi,japanese',
      stock: 45,
      origin: 'Japan',
      weight: '200g',
      servings: 8,
      organic_percentage: 80
    },

    // 限定版系列 (Limited Edition)
    {
      name: 'Sakura Matcha Blend',
      price: 48.00,
      description: 'Limited spring edition with subtle cherry blossom notes.',
      category: 'Limited Edition',
      image_url: 'https://source.unsplash.com/400x400/?sakura,matcha',
      stock: 15,
      origin: 'Kyoto Prefecture',
      weight: '30g',
      servings: 15,
      organic_percentage: 92
    },
    {
      name: 'Harvest Moon Matcha',
      price: 72.00,
      description: 'Rare autumn harvest with deep umami and complex flavor profile.',
      category: 'Limited Edition',
      image_url: 'https://source.unsplash.com/400x400/?autumn,matcha',
      stock: 10,
      origin: 'Uji, Kyoto Prefecture',
      weight: '25g',
      servings: 12,
      organic_percentage: 100
    },
    {
      name: 'Master\'s Reserve',
      price: 95.00,
      description: 'Tea master\'s personal selection. Aged for enhanced complexity.',
      category: 'Limited Edition',
      image_url: 'https://source.unsplash.com/400x400/?luxury,matcha',
      stock: 8,
      origin: 'Nishio, Aichi Prefecture',
      weight: '20g',
      servings: 10,
      organic_percentage: 100
    }
  ];

  // Clear existing products
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('Error clearing products:', err);
      return;
    }

    // Insert new products
    const stmt = db.prepare(`
      INSERT INTO products (name, price, description, category, image_url, stock, origin, weight, servings, organic_percentage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    products.forEach(product => {
      stmt.run(
        product.name,
        product.price,
        product.description,
        product.category,
        product.image_url,
        product.stock,
        product.origin,
        product.weight,
        product.servings,
        product.organic_percentage,
        (err) => {
          if (err) {
            console.error(`Error inserting ${product.name}:`, err);
          } else {
            console.log(`✅ Added product: ${product.name}`);
          }
        }
      );
    });

    stmt.finalize();
    console.log('🌱 Database seeded with', products.length, 'products');
  });
};

// Run seed if called directly
if (require.main === module) {
  seedProducts();
  setTimeout(() => {
    db.close();
  }, 2000);
}

module.exports = { seedProducts };