require('dotenv').config();

const verifyToken = require("./authMiddleware"); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the CORS middleware

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================================
// 1. 🟢 CRITICAL FIX: UPDATED CORS CONFIGURATION FOR MOBILE DATA
//
// We are using origin: '*' to ensure maximum compatibility 
// with strict mobile carrier network filters/proxies.
// ==========================================================

app.use(cors({
    origin: '*', // Allows access from any domain (crucial for mobile carrier compatibility)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true,
    optionsSuccessStatus: 204
}));

app.use(express.json()); // Middleware to parse JSON request bodies


const Wishlist = require('./models/Wishlist');
// ⚠️ REQUIRED: Create this model file for logging donations
const Donation = require('./models/Donation'); 

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));


// ===============================================
//           2. WISHLIST ROUTES
// ===============================================

// Get all wishlist items
app.get('/wishlist', async (req, res) => {
    try {
        const items = await Wishlist.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch items" });
    }
});
// ===============================================
//           4. DONOR WALL ROUTE
// ===============================================
app.get('/donors', async (req, res) => {
    try {
        const donors = await Donation.find().sort({ commitmentTimestamp: -1 }); // latest first
        res.status(200).json(donors);
    } catch (err) {
        console.error("DonorWall GET error:", err);
        res.status(500).json({ error: "Failed to fetch donor data" });
    }
});

// Add new wishlist item (requires admin token)
app.post('/wishlist', verifyToken, async (req, res) => {
    try {
        if (req.user.email !== "admin@wishlist.com") {
            return res.status(403).json({ error: "Forbidden: Not an admin" });
        }

        const newItem = new Wishlist(req.body);
        await newItem.save();
        res.json(newItem);
    } catch (err) {
        res.status(500).json({ error: "Failed to add item" });
    }
});
const { sendThankYouEmail } = require('./emailService');


// Update wishlist item (requires admin token)
app.put('/wishlist/:id', verifyToken, async (req, res) => {
    try {
        // Ensure only admin can modify
        if (req.user.email !== "admin@wishlist.com") {
            return res.status(403).json({ error: "Forbidden: Not an admin" });
        }

        const updatedItem = await Wishlist.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.status(200).json(updatedItem);
    } catch (err) {
        console.error("Wishlist PUT error:", err);
        res.status(500).json({ error: "Failed to update item" });
    }
});


// Delete wishlist item (requires admin token)
app.delete('/wishlist/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.email !== "admin@wishlist.com") {
            return res.status(403).json({ error: "Forbidden: Not an admin" });
        }

        const deleted = await Wishlist.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.status(200).json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: "Deletion failed" });
    }
});

// ===============================================
//           3. DONATION ROUTES
// ===============================================

// Route used by DonationForm (PATCH /wishlist/:id) to fulfill the item status
app.patch('/wishlist/:id', async (req, res) => {
    try {
        const { fulfilled, committedBy } = req.body;
        
        // Find the item and update the status
        const updatedItem = await Wishlist.findByIdAndUpdate(
            req.params.id,
            { fulfilled: fulfilled, committedBy: committedBy }, // Set fulfilled to true and log donor
            { new: true } // Return the updated document
        );

        if (!updatedItem) {
            return res.status(404).json({ error: "Wishlist item not found for update" });
        }
        
        res.status(200).json(updatedItem);
    } catch (err) {
        console.error("Wishlist PATCH error:", err);
        res.status(500).json({ error: "Failed to update item status" });
    }
});


// Route used by DonationForm (POST /donations) to log the donor's commitment
const { sendThankYouEmail } = require('./emailService');

app.post('/donations', async (req, res) => {
  try {
    console.log("📩 New donation request received:", req.body); // <--- ADD THIS

    const newDonation = new Donation(req.body);
    await newDonation.save();

    console.log("✅ Donation saved, now sending email..."); // <--- ADD THIS

    // Send thank-you email asynchronously
    sendThankYouEmail(newDonation)
      .then(() => console.log("✅ Email sent successfully"))
      .catch(err => console.error("❌ Email Error:", err));

    res.status(201).json({ message: "Donation logged and email sent" });
  } catch (err) {
    console.error("Donation POST error:", err);
    res.status(500).json({ error: "Failed to log donation" });
  }
});




app.listen(PORT, () => {
    console.log(` Listening on port: ${PORT}`);
});
