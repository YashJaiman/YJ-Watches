const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Reusable cleanCart helper to scan, log, and purge any invalid, 
 * null, or orphaned product references directly from MongoDB.
 */
async function cleanCart(cart) {
  if (!cart || !cart.items) return cart;

  let isDirty = false;
  const initialCount = cart.items.length;
  const cleanItems = [];

  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    
    // Defensive check to verify item and product references exist
    if (item && item.product) {
      // Check if product is populated (which means it's an object with an _id field)
      if (item.product !== null && typeof item.product === 'object' && item.product._id) {
        cleanItems.push(item);
      } else if (item.product !== null && typeof item.product !== 'object' && mongoose.Types.ObjectId.isValid(item.product)) {
        // If it is not populated, it's just a valid ObjectId reference - keep it
        cleanItems.push(item);
      } else {
        // Corrupted populated object (missing _id field or null populated product)
        isDirty = true;
        const orphanedId = (item.product && item.product._id) ? item.product._id : item.product;
        console.warn(`[CART CLEANUP] Purging corrupted/orphaned product reference: [ID: ${orphanedId}] from Cart: [${cart._id}]`);
      }
    } else {
      isDirty = true;
      console.warn(`[CART CLEANUP] Purging null or missing product reference from Cart: [${cart._id}]`);
    }
  }

  if (isDirty) {
    cart.items = cleanItems;
    try {
      await cart.save();
      console.log(`[CART CLEANUP] Cart [${cart._id}] successfully self-healed and saved. Items reduced from ${initialCount} to ${cleanItems.length}.`);
    } catch (saveError) {
      console.error(`[CART CLEANUP ERROR] Failed to save self-healed cart [${cart._id}]:`, saveError);
    }
  }

  return cart;
}

/**
 * Robust formatter to extract cart items and map them cleanly, 
 * ensuring no null or malformed data ever reaches the frontend.
 */
function formatCartItems(cart) {
  if (!cart || !cart.items) return [];

  return cart.items.reduce((result, item) => {
    if (item && item.product && typeof item.product === 'object' && item.product._id) {
      result.push({
        id: item.product._id.toString(),
        name: item.product.name || 'Exclusive Timepiece',
        price: Number(item.product.price) || 0,
        image: item.product.image || '',
        category: item.product.category || 'Luxury',
        description: item.product.description || '',
        quantity: Number(item.quantity) || 1,
      });
    } else {
      console.warn(`[CART FORMATTER] Skipping invalid or unpopulated item in formatting step:`, item);
    }
    return result;
  }, []);
}

/**
 * GET Cart controller
 */
async function getCart(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401);
      return next(new Error('Unauthorized access.'));
    }

    let cart;
    try {
      cart = await Cart.findOne({ user: userId }).populate('items.product');
    } catch (populateError) {
      console.error('[CART CONTROLLER] getCart: Populate failed, falling back to unpopulated:', populateError);
      cart = await Cart.findOne({ user: userId });
    }

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Sanitize before formatting
    await cleanCart(cart);

    res.json(formatCartItems(cart));
  } catch (err) {
    console.error('[CART CONTROLLER] Error in getCart:', err);
    next(err);
  }
}

/**
 * ADD Cart Item controller
 */
async function addCartItem(req, res, next) {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!userId) {
      res.status(401);
      return next(new Error('Unauthorized access.'));
    }

    if (!productId) {
      res.status(400);
      return next(new Error('Product ID is required.'));
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.warn(`[CART CONTROLLER] Add operation failed. Product not found: [ID: ${productId}]`);
      res.status(404);
      return next(new Error('Product not found.'));
    }

    let cart;
    try {
      cart = await Cart.findOne({ user: userId }).populate('items.product');
    } catch (populateError) {
      console.error('[CART CONTROLLER] addCartItem: Populate failed, falling back to unpopulated:', populateError);
      cart = await Cart.findOne({ user: userId });
    }

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Sanitize existing cart items before modifying
    await cleanCart(cart);

    // Find if the item already exists in the cart using safe string comparisons
    const existingItem = cart.items.find((entry) => {
      if (!entry || !entry.product) return false;
      const entryProdId = (entry.product._id) ? entry.product._id.toString() : entry.product.toString();
      return entryProdId === product._id.toString();
    });

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ product: product._id, quantity: 1 });
    }

    await cart.save();

    // Reload populated cart and perform final cleanup verification
    let updatedCart;
    try {
      updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    } catch (populateError) {
      console.error('[CART CONTROLLER] addCartItem reload: Populate failed, falling back to unpopulated:', populateError);
      updatedCart = await Cart.findOne({ user: userId });
    }

    await cleanCart(updatedCart);

    res.json(formatCartItems(updatedCart));
  } catch (err) {
    console.error('[CART CONTROLLER] Error in addCartItem:', err);
    next(err);
  }
}

/**
 * UPDATE Cart Item controller
 */
async function updateCartItem(req, res, next) {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      res.status(401);
      return next(new Error('Unauthorized access.'));
    }

    if (quantity == null || Number(quantity) < 0) {
      res.status(400);
      return next(new Error('Quantity must be zero or greater.'));
    }

    let cart;
    try {
      cart = await Cart.findOne({ user: userId }).populate('items.product');
    } catch (populateError) {
      console.error('[CART CONTROLLER] updateCartItem: Populate failed, falling back to unpopulated:', populateError);
      cart = await Cart.findOne({ user: userId });
    }

    if (!cart) {
      res.status(404);
      return next(new Error('Cart not found.'));
    }

    // Sanitize before search
    await cleanCart(cart);

    const item = cart.items.find((entry) => {
      if (!entry || !entry.product) return false;
      const entryProdId = (entry.product._id) ? entry.product._id.toString() : entry.product.toString();
      return entryProdId === productId.toString();
    });

    if (!item) {
      res.status(404);
      return next(new Error('Cart item not found.'));
    }

    if (Number(quantity) === 0) {
      cart.items = cart.items.filter((entry) => {
        if (!entry || !entry.product) return false;
        const entryProdId = (entry.product._id) ? entry.product._id.toString() : entry.product.toString();
        return entryProdId !== productId.toString();
      });
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();

    let updatedCart;
    try {
      updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    } catch (populateError) {
      console.error('[CART CONTROLLER] updateCartItem reload: Populate failed, falling back to unpopulated:', populateError);
      updatedCart = await Cart.findOne({ user: userId });
    }

    await cleanCart(updatedCart);

    res.json(formatCartItems(updatedCart));
  } catch (err) {
    console.error('[CART CONTROLLER] Error in updateCartItem:', err);
    next(err);
  }
}

/**
 * REMOVE Cart Item controller
 */
async function removeCartItem(req, res, next) {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      res.status(401);
      return next(new Error('Unauthorized access.'));
    }

    let cart;
    try {
      cart = await Cart.findOne({ user: userId }).populate('items.product');
    } catch (populateError) {
      console.error('[CART CONTROLLER] removeCartItem: Populate failed, falling back to unpopulated:', populateError);
      cart = await Cart.findOne({ user: userId });
    }

    if (!cart) {
      res.status(404);
      return next(new Error('Cart not found.'));
    }

    // Sanitize before removing
    await cleanCart(cart);

    cart.items = cart.items.filter((entry) => {
      if (!entry || !entry.product) return false;
      const entryProdId = (entry.product._id) ? entry.product._id.toString() : entry.product.toString();
      return entryProdId !== productId.toString();
    });

    await cart.save();

    let updatedCart;
    try {
      updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    } catch (populateError) {
      console.error('[CART CONTROLLER] removeCartItem reload: Populate failed, falling back to unpopulated:', populateError);
      updatedCart = await Cart.findOne({ user: userId });
    }

    await cleanCart(updatedCart);

    res.json(formatCartItems(updatedCart));
  } catch (err) {
    console.error('[CART CONTROLLER] Error in removeCartItem:', err);
    next(err);
  }
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
};
