import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Wishlist from "./Wishlist";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// --- Image URLs for the Rotator ---
const HERO_IMAGES = [
  // The image you chose (kids playing)
  "https://orphanlifefoundation.org/wp-content/uploads/2023/03/A-group-of-young-boys-and-girls-sitting-close-together-outdoors.png",
  // Another relevant icon/illustration (e.g., helping hands)
  "https://images.squarespace-cdn.com/content/v1/5d5bc56405cd1e0001389442/1580274927664-GV1V1T78WBSROMQMWR6T/DSC_0373.jpg",
  "https://files.globalgiving.org/pfil/3419/pict_large.jpg?m=1249025181000",
  "https://th.bing.com/th/id/R.10fd96baa2cc905388ede4d80bfff811?rik=Nmvvd9qfwDokgw&riu=http%3a%2f%2f1.bp.blogspot.com%2f-p2kJbSDQZcI%2fUcLbmEtkHXI%2fAAAAAAAAALw%2fS5obuWRlRLc%2fs1600%2f2410178497_63efe0067c.jpg&ehk=mzvt94Uo9pfHsZSqhxFXHXNQb20O6jk4mlkXDO%2fJfeo%3d&risl=&pid=ImgRaw&r=0",
  // You can add more URLs here if you want more images to rotate
];

function Home({ items, loading, fetchItems }) {
  const navigate = useNavigate();
  // Use the actual useAuth hook (assuming it's imported correctly)
  const { currentUser } = useAuth();
  // Mock for display purposes only (removed the mock assignment)
  // const currentUser = { email: "user@example.com" };
  const isAdmin = currentUser?.email === "admin@wishlist.com";

  // --- NEW: State for Image Rotator ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- NEW: useEffect for Automatic Image Rotation ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) =>
          // Cycle back to 0 when the last image is reached
          (prevIndex + 1) % HERO_IMAGES.length
      );
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures it runs once on mount

  const currentImageUrl = HERO_IMAGES[currentImageIndex];

  return (
    // 🎯 UI FIX: Added min-h-screen to ensure full height on all devices
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      {/* Hero Section */}
      {/* 🎯 UI FIX: py-20 for more space, ensures content sits nicely on mobile */}
      <main className="flex-1 px-6 py-20 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          // 🎯 MOBILE FIX: Ensures text is centered on mobile, left-aligned on desktop
          className="md:w-1/2 text-center md:text-left order-2 md:order-1"
        >
          {/* 🎯 UI FIX: Slightly larger, more impactful text */}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Together We Can{" "}
            <span className="text-teal-400">Support Orphanages</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto md:mx-0">
            Join us in making a difference. View the wishlist and help provide
            essential supplies for orphanages in need.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/AdminWishListView")}
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all font-bold text-lg"
          >
            View Wishlist
          </motion.button>
        </motion.div>

        {/* Right Illustration - Image Rotator Part */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          // 🎯 MOBILE FIX: Ensures image is above text on mobile (order-1)
          className="md:w-1/2 mt-0 md:mt-0 flex justify-center order-1 md:order-2 mb-12 md:mb-0 relative"
        >
          {/* The image is now wrapped in motion.div for fade transitions */}
          <motion.img
            key={currentImageUrl} // Key change forces the image to re-render, triggering the transition
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} // Half-second fade transition
            src={currentImageUrl} // --- UPDATED SRC ---
            alt="Orphanage Kids Illustration"
            className="w-100 md:w-100 lg:w-120 drop-shadow-2xl opacity-90 rounded-4xl"
          />
        </motion.div>
      </main>

      {/* Wishlist Section */}
      <section className="py-12 px-4 bg-gray-950 border-t border-gray-800">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Current Wishlist
        </h2>
        <div className="max-w-6xl mx-auto bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-10">
          {/* Passing all received props to Wishlist */}
          <Wishlist
            items={items}
            loading={loading}
            fetchItems={fetchItems}
            isAdmin={isAdmin}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* 🎯 MOBILE FIX: Added sm:grid-cols-2 for better tablet/small desktop layout */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">HelpOrphan</h3>
            <p className="text-sm max-w-xs mx-auto md:mx-0">
              Built with ❤️ to support orphanages and connect people willing to
              help.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-teal-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="hover:text-teal-400 transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-teal-400 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Follow Us</h4>
            <div className="flex space-x-4 justify-center md:justify-start">
              {/* Assuming you have Font Awesome imported for the icons */}
              <a href="#">
                <i className="fab fa-facebook text-xl hover:text-teal-400 transition-colors"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter text-xl hover:text-teal-400 transition-colors"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram text-xl hover:text-teal-400 transition-colors"></i>
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8 border-t border-gray-800 pt-4">
          © 2025 HelpOrphan | All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;
