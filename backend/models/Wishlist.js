const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure a user can't have multiple default wishlists (handled in logic, but index helps)
WishlistSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
