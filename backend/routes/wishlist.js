const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { auth } = require('../middleware/Auth');

// @route   GET /api/wishlists
// @desc    Get all wishlists for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ user: req.user._id })
      .populate('products')
      .sort({ createdAt: -1 });
    res.json(wishlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/wishlists/:id
// @desc    Get a specific wishlist
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('products');

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlists
// @desc    Create a new wishlist
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if wishlist with same name exists for user
    const existingWishlist = await Wishlist.findOne({
      user: req.user._id,
      name
    });

    if (existingWishlist) {
      return res.status(400).json({ message: 'Wishlist with this name already exists' });
    }

    const wishlist = new Wishlist({
      user: req.user._id,
      name,
      description
    });

    await wishlist.save();
    res.status(201).json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlists/:id/add
// @desc    Add product to wishlist
// @access  Private
router.post('/:id/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const wishlist = await Wishlist.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product already in wishlist
    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    // Return populated wishlist
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.json(updatedWishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wishlists/:id/remove/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:id/remove/:productId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      id => id.toString() !== req.params.productId
    );

    await wishlist.save();
    
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.json(updatedWishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wishlists/:id
// @desc    Delete a wishlist
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.json({ message: 'Wishlist deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
