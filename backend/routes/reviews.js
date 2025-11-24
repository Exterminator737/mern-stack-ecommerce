const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/Auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product with pagination, sort, filter
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, rating } = req.query;
    const productId = req.params.productId;
    
    const query = { 
      product: productId,
      status: 'approved'
    };

    // Filter by rating (supports comma separated string "5,4")
    if (rating) {
      const ratings = rating.split(',').map(Number);
      query.rating = { $in: ratings };
    }

    // Sorting
    let sortOptions = {};
    if (sort === 'helpful') {
      sortOptions = { helpfulCount: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else { // Default: newest
      sortOptions = { createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Review.countDocuments(query);

    // Get aggregation for rating distribution (based on ALL approved reviews, not just filtered)
    const distribution = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    const ratingMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distribution.forEach(d => {
      ratingMap[d._id] = d.count;
    });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalReviews: total,
      distribution: ratingMap
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/product/:productId
// @desc    Create a review
// @access  Private
router.post('/product/:productId', [auth,
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').notEmpty(),
  body('title').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.productId;
    const { rating, comment, title } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, user: req.user.id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      product: productId,
      user: req.user.id,
      name: req.user.name,
      rating,
      title,
      comment
    });

    await review.save();

    // Update Product stats
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      product.rating = stats[0].avgRating;
      product.numReviews = stats[0].numReviews;
    } else {
      product.rating = rating;
      product.numReviews = 1;
    }
    await product.save();

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.put('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already marked helpful
    if (review.helpfulUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You already marked this as helpful' });
    }

    review.helpfulUsers.push(req.user.id);
    review.helpfulCount = review.helpfulUsers.length;
    await review.save();

    res.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const mongoose = require('mongoose');
module.exports = router;
