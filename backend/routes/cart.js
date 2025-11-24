const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { auth } = require('../middleware/Auth');
const { getCart, setCart, clearCart } = require('../utils/cartStorage');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const cart = getCart(req.user._id.toString());
    
    // Populate product details
    const populatedCart = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          ...item,
          product: product || null
        };
      })
    );

    res.json({
      items: populatedCart,
      total: cart.total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const userId = req.user._id.toString();
    let cart = getCart(userId);

    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price
      });
    }

    // Calculate total
    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    setCart(userId, cart);
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update cart item quantity
// @access  Private
router.put('/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.user._id.toString();
    let cart = getCart(userId);

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === req.params.productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    // Calculate total
    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    setCart(userId, cart);
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/:productId', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    let cart = getCart(userId);

    cart.items = cart.items.filter(
      item => item.productId.toString() !== req.params.productId
    );

    // Calculate total
    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    setCart(userId, cart);
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    clearCart(userId);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

