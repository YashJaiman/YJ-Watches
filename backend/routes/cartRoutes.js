const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getCart, addCartItem, updateCartItem, removeCartItem } = require('../controllers/cartController');

const router = express.Router();

router.use(protect);
router.get('/', getCart);
router.post('/', addCartItem);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeCartItem);

module.exports = router;
