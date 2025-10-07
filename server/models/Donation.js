// ./models/Donation.js

const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    // Item ID from the wishlist that the user committed to fulfilling
    itemId: {
        type: String,
        required: true,
    },
    // Item name, sent for logging purposes
    itemCommitted: {
        type: String,
        required: true,
    },
    // Donor's contact information
    donorName: {
        type: String,
        required: true,
    },
    contactEmail: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Committed', // Can be updated later to 'Delivered' by admin
    },
    commitmentTimestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Donation', DonationSchema);