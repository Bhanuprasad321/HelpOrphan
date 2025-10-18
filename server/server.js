require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const verifyToken = require("./authMiddleware"); 
const Wishlist = require('./models/Wishlist');
const Donation = require('./models/Donation'); 
const { sendThankYouEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================================
// 1️⃣ CORS CONFIGURATION FOR MOBILE DATA
// ==========================================================
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));

app.use(express.json()); // Parse JSON request bodies

// ==========================================================
// 2️⃣ MONGODB CONNECTION
// ==========================================================
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ==========================================================
// 3️⃣ WISHLIST ROUTES
// ==========================================================

// Get all wishlist items
app.get('/wishlist', async (req, res) => {
    try {
        const items = await Wishlist.find();
        res.status(200).json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch items" });
    }
});

// Add new wishlist item (admin only)
app.post('/wishlist', verifyToken, async (req, res) => {
    try {
        if (req.user.email !== "admin@wishlist.com") {
            return res.status(403).json({ success: false, error: "Forbidden: Not an admin" });
        }

        const newItem = new Wishlist(req.body);
        await newItem.save();
        res.status(201).json({ success: true, item: newItem });

    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to add item" });
    }
});

// Update wishlist item (admin only)
app.put('/wishlist/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.email !== "admin@wishlist.com") {
            return res.status(403).json({ success: false, error: "Forbidden: Not an admin" });
        }

        const updatedItem = await Wishlist.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!updatedItem) return res.status(404).json({ success: false, error: "Item not found" });

        res.status(200).json({ success: true, item: updatedItem });

    } catch (err) {
        console.error("Wishlist PUT error:", err);
        res.status(500).json({ success: false, error: "Failed to update item" });
    }
});

// Delete wishlist item (admin only)
app.delete('/wishlist/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.email !== "admin@wishlist.com") {
            return res.status(403).json({ success: false, error: "Forbidden: Not an admin" });
        }

        const deleted = await Wishlist.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, error: "Item not found" });

        res.status(200).json({ success: true, message: "Item deleted" });

    } catch (err) {
        res.status(500).json({ success: false, error: "Deletion failed" });
    }
});

// Patch wishlist item (donation fulfillment)
app.patch('/wishlist/:id', async (req, res) => {
    try {
        const { fulfilled, committedBy } = req.body;

        if (typeof fulfilled !== "boolean" || !committedBy) {
            return res.status(400).json({
                success: false,
                error: "Missing or invalid fields: fulfilled (boolean), committedBy (string)"
            });
        }

        const updatedItem = await Wishlist.findByIdAndUpdate(
            req.params.id,
            { fulfilled, committedBy },
            { new: true }
        );

        if (!updatedItem) return res.status(404).json({ success: false, error: "Wishlist item not found" });

        res.status(200).json({ success: true, message: "Wishlist item updated", item: updatedItem });

    } catch (err) {
        console.error("Wishlist PATCH error:", err);
        res.status(500).json({ success: false, error: "Failed to update item" });
    }
});

// ==========================================================
// 4️⃣ DONATION ROUTES
// ==========================================================

// Get donor wall (latest donors first)
app.get('/donors', async (req, res) => {
    try {
        const donors = await Donation.find().sort({ commitmentTimestamp: -1 });
        res.status(200).json({ success: true, donors });
    } catch (err) {
        console.error("DonorWall GET error:", err);
        res.status(500).json({ success: false, error: "Failed to fetch donor data" });
    }
});

// Log a donation
app.post('/donations', async (req, res) => {
    try {
        const { donorName, contactEmail, itemCommitted } = req.body;

        if (!donorName || !contactEmail || !itemCommitted) {
            return res.status(400).json({ 
                success: false, 
                error: "Missing required fields: donorName, contactEmail, itemCommitted" 
            });
        }

        const newDonation = new Donation({ donorName, contactEmail, itemCommitted });
        await newDonation.save();
        console.log("✅ Donation saved:", newDonation);

        // Send email asynchronously
        sendThankYouEmail(newDonation)
            .then(() => console.log("✅ Email sent successfully"))
            .catch(err => console.error("❌ Email sending error:", err));

        res.status(201).json({ success: true, message: "Donation logged successfully", donation: newDonation });

    } catch (err) {
        console.error("Donation POST error:", err);
        res.status(500).json({ success: false, error: "Failed to log donation" });
    }
});

// ==========================================================
// 5️⃣ START SERVER
// ==========================================================
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port: ${PORT}`);
});
