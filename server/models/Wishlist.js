const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  urgency: {
    type: String,
    required: true
  },
  orphanage: {
    type: String,
    required: true
  },
  // ✅ This is the critical fix.
  fulfilled: {
    type: Boolean,
    default: false // Ensures Mongoose saves and retrieves the status
  },
  committedBy: {
    type: String,
    default: null // Stores the name of the donor
  }
});

module.exports = mongoose.model('Wishlist', WishlistSchema);