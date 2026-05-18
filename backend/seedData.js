const watchImages = {
  Luxury: [
    'images/Rolex2.png',
    'images/item1.jpg',
    'images/item5.jpg',
    'images/item6.jpg',
    'images/Rado.jpg'
  ],
  Sport: [
    'images/item2.jpg',
    'images/item3.jpg',
    'images/fitness band.jpg',
    'images/smartwatch logo.jpg',
    'images/item4.jpg'
  ],
  Classic: [
    'images/item3.jpg',
    'images/item4.jpg',
    'images/item5.jpg',
    'images/Rado.jpg',
    'images/Rolex2.png'
  ],
  Smart: [
    'images/smartwatch logo.jpg',
    'images/fitness band.jpg',
    'images/item2.jpg',
    'images/item1.jpg',
    'images/item3.jpg'
  ],
  Fitness: [
    'images/fitness band.jpg',
    'images/smartwatch logo.jpg',
    'images/item2.jpg',
    'images/item4.jpg'
  ],
  Casual: [
    'images/item4.jpg',
    'images/item1.jpg',
    'images/item3.jpg',
    'images/item5.jpg'
  ],
  Premium: [
    'images/Rolex2.png',
    'images/item6.jpg',
    'images/item5.jpg',
    'images/Rado.jpg',
    'images/item1.jpg'
  ],
  Digital: [
    'images/item2.jpg',
    'images/item3.jpg',
    'images/item4.jpg',
    'images/fitness band.jpg'
  ],
  Women: [
    'images/item5.jpg',
    'images/women-logo.jpg',
    'images/item1.jpg',
    'images/item3.jpg'
  ],
  Men: [
    'images/Rolex2.png',
    'images/item1.jpg',
    'images/item6.jpg',
    'images/item2.jpg',
    'images/item4.jpg'
  ]
};

const categories = [
  'Luxury', 'Sport', 'Classic', 'Smart', 'Fitness', 
  'Casual', 'Premium', 'Digital', 'Women', 'Men'
];

const brandData = {
  Luxury: {
    brands: ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega', 'Cartier', 'Richard Mille'],
    models: ['Nautilus', 'Royal Oak', 'Submariner', 'Seamaster', 'Tank', 'RM 11-03', 'Cosmograph Daytona', 'Calatrava', 'Speedmaster Pro', 'Santos'],
    tags: ['luxury', 'exclusive', 'swiss', 'automatic', 'investment', 'masterpiece']
  },
  Sport: {
    brands: ['Omega', 'TAG Heuer', 'Seiko', 'Garmin', 'Casio', 'Citizen'],
    models: ['Speedmaster Sport', 'Carrera Chrono', 'Prospex Diver', 'Fenix 7X', 'G-Shock Mudmaster', 'Promaster Marine', 'Aquaracer', 'Seiko 5 Sport', 'Formula 1', 'Forerunner 955'],
    tags: ['sport', 'waterproof', 'rugged', 'chronograph', 'diver', 'outdoor']
  },
  Classic: {
    brands: ['Rolex', 'Cartier', 'Tissot', 'Seiko', 'Hamilton', 'Longines'],
    models: ['Datejust', 'Tank Must', 'Le Locle', 'Presage Cocktail', 'Jazzmaster', 'Master Collection', 'Intramatic', 'Presage Sharp Edged', 'Cellini', 'Heritage Classic'],
    tags: ['classic', 'elegant', 'vintage', 'dress-watch', 'leather', 'automatic']
  },
  Smart: {
    brands: ['Apple', 'Samsung', 'Garmin', 'Fossil', 'Fitbit'],
    models: ['Watch Ultra', 'Galaxy Watch 6', 'Venu 3', 'Gen 6 Smartwatch', 'Versa 4', 'Watch Series 9', 'Galaxy Watch Pro', 'Lily 2', 'Sense 2', 'Pixel Watch 2'],
    tags: ['smart', 'touchscreen', 'gps', 'bluetooth', 'heart-rate', 'wearable']
  },
  Fitness: {
    brands: ['Garmin', 'Fitbit', 'Apple', 'Samsung', 'Polar'],
    models: ['Forerunner 265', 'Charge 6', 'Watch SE Fitness', 'Galaxy Watch Fit', 'Vantage V3', 'Instinct 2', 'Luxe', 'Vivosmart 5', 'Pacer Pro', 'Ignite 3'],
    tags: ['fitness', 'tracker', 'health', 'heart-rate', 'calorie-counter', 'workout']
  },
  Casual: {
    brands: ['Fossil', 'Casio', 'Timex', 'Seiko', 'Daniel Wellington'],
    models: ['Minimalist Leather', 'Classic Digital', 'Weekender', '5 Sports Casual', 'Classic Sheffield', 'Grant Chronograph', 'Vintage A158W', 'Expedition', 'Presage Casual', 'Petite Sterling'],
    tags: ['casual', 'daily-wear', 'stylish', 'quartz', 'minimalist', 'affordable']
  },
  Premium: {
    brands: ['Grand Seiko', 'Hublot', 'IWC Schaffhausen', 'Omega', 'Breitling'],
    models: ['Spring Drive', 'Big Bang', 'Portugieser', 'Globemaster', 'Navitimer B01', 'Snowflake', 'Classic Fusion', 'Pilot Watch', 'Superocean', 'Chronomats'],
    tags: ['premium', 'collector', 'precision', 'limited-edition', 'swiss-made', 'automatic']
  },
  Digital: {
    brands: ['Casio', 'Timex', 'Nixon', 'G-Shock'],
    models: ['Vintage Retro', 'Ironman Classic', 'Regulus Digital', 'G-Shock Classic', 'Classic F91W', 'T80 Retro', 'Dork Too', 'G-Shock Tough Solar', 'Calculator Watch', 'Grid Shock'],
    tags: ['digital', 'retro', 'alarm', 'backlight', 'quartz', 'vintage']
  },
  Women: {
    brands: ['Cartier', 'Omega', 'Rolex', 'Fossil', 'Michael Kors', 'Casio'],
    models: ['Panthere de Cartier', 'Constellation Lady', 'Lady-Datejust', 'Carlie Mini', 'Runway Gold', 'Vintage Rose Gold', 'Ballon Bleu', 'Seamaster Aqua Terra', 'Stella', 'Sheen Chrono'],
    tags: ['women', 'elegant', 'slim', 'rose-gold', 'jewelry', 'petite']
  },
  Men: {
    brands: ['Rolex', 'Omega', 'TAG Heuer', 'Seiko', 'Tissot', 'Casio'],
    models: ['Oyster Perpetual', 'Seamaster 300', 'Monaco Chrono', 'Alpinist Automatic', 'Gentleman Powermatic', 'Edifice Chrono', 'Submariner Date', 'Speedmaster Dark Moon', 'Autavia', 'Prospex Land'],
    tags: ['men', 'masculine', 'rugged', 'automatic', 'bold', 'executive']
  }
};

const generateProducts = () => {
  const products = [];
  
  categories.forEach((category) => {
    const data = brandData[category];
    const images = watchImages[category];
    
    for (let i = 0; i < 10; i++) {
      const brand = data.brands[i % data.brands.length];
      const model = data.models[i % data.models.length];
      const image = images[i % images.length];
      
      const name = `${brand} ${model}`;
      
      // Determine realistic price ranges based on brand/category
      let price = 150;
      if (category === 'Luxury' || category === 'Premium') {
        price = Math.floor(Math.random() * 450000) + 12000;
      } else if (category === 'Classic' || brand === 'Rolex' || brand === 'Cartier') {
        price = Math.floor(Math.random() * 15000) + 3000;
      } else if (category === 'Smart' || category === 'Sport') {
        price = Math.floor(Math.random() * 800) + 250;
      } else {
        price = Math.floor(Math.random() * 300) + 80;
      }
      
      // Select appropriate fallback description
      const descTemplates = [
        `Exquisite design meets technical supremacy in the ${name}. Engineered for those who demand ultimate precision and elegance.`,
        `The ${name} is a testament to timeless watchmaking heritage, featuring premium materials and iconic aesthetics.`,
        `Equipped for modern challenges, the ${name} balances flawless performance with a striking profile that commands attention.`,
        `Crafted with unparalleled attention to detail, the ${name} offers rich functionality wrapped in an elegant signature look.`
      ];
      const description = descTemplates[i % descTemplates.length];
      
      const stock = Math.floor(Math.random() * 25) + 3;
      
      // Merge base tags with generic category tags
      const tags = [...new Set([...data.tags, brand.toLowerCase(), category.toLowerCase()])];
      
      products.push({
        name,
        description,
        price,
        image,
        category,
        brand,
        tags,
        stock
      });
    }
  });

  return products;
};

module.exports = { generateProducts };
