const Product = require('../models/Product');

async function getProducts(req, res, next) {
  try {
    const { search, category, brand, priceMin, priceMax, sort, page = 1, limit = 12 } = req.query;
    const filter = {};

    // Smart Search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Faceted Filtering
    if (category) {
      filter.category = category.trim();
    }

    if (brand) {
      // Support comma-separated brands: ?brand=Rolex,Omega
      const brandsList = brand.split(',').map(b => b.trim()).filter(Boolean);
      if (brandsList.length > 0) {
        filter.brand = { $in: brandsList };
      }
    }

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    // Sorting Engine
    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOptions.price = 1;
          break;
        case 'price_desc':
          sortOptions.price = -1;
          break;
        case 'name_asc':
          sortOptions.name = 1;
          break;
        case 'name_desc':
          sortOptions.name = -1;
          break;
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }
    } else {
      sortOptions.createdAt = -1; // Default: newest first
    }

    // Pagination Pipeline
    const currentPage = Math.max(1, parseInt(page));
    const itemsLimit = Math.max(1, parseInt(limit));
    const skip = (currentPage - 1) * itemsLimit;

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(itemsLimit);

    res.json({
      products,
      page: currentPage,
      pages: Math.ceil(totalProducts / itemsLimit),
      total: totalProducts,
      limit: itemsLimit
    });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    return next(new Error('Product not found'));
  }

  res.json(product);
}

module.exports = { getProducts, getProductById };
