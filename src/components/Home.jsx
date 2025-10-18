import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Wishlist from "./Wishlist";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// --- Image URLs for the Rotator ---
const HERO_IMAGES = [
  "https://orphanlifefoundation.org/wp-content/uploads/2023/03/A-group-of-young-boys-and-girls-sitting-close-together-outdoors.png",
  "https://images.squarespace-cdn.com/content/v1/5d5bc56405cd1e0001389442/1580274927664-GV1V1T78WBSROMQMWR6T/DSC_0373.jpg",
  "https://files.globalgiving.org/pfil/3419/pict_large.jpg?m=1249025181000",
  "https://1.bp.blogspot.com/-p2kJbSDQZcI/UcLbmEtkHXI/AAAAAAAAALw/S5obuWRlRLc/s1600/2410178497_63efe0067c.jpg",
];

function Home({ items, loading, fetchItems }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.email === "admin@wishlist.com";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const currentImageUrl = HERO_IMAGES[currentImageIndex];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white">
      {/* --- Hero Section --- */}
      {/* --- Improved Hero Section (Readable + Balanced) --- */}
      <section className="relative w-full h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Background Image Rotator */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageUrl}
            src={currentImageUrl}
            alt="Helping Orphans"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>

        {/* Overlay with Gradient + Subtle Blur for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85 backdrop-blur-[1px]"></div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="relative z-10 text-center px-6 max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-snug">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
              Together We Can Make a Difference
            </span>
          </h1>

          <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed">
            Join hands to support orphanages in need. Every small act of
            kindness brings a smile to someone’s face.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/AdminWishListView")}
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-2xl transition-all"
            >
              View Wishlist
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/contact")}
              className="bg-transparent border-2 border-teal-400 text-teal-400 px-8 py-3 rounded-full font-semibold hover:bg-teal-400 hover:text-white transition-all"
            >
              Donate Now
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* --- Wishlist Section --- */}
      <section className="py-16 px-6 bg-gray-950 border-t border-gray-800">
        <h2 className="text-4xl font-bold text-center text-white mb-8">
          Current Wishlist
        </h2>
        <div className="max-w-6xl mx-auto bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12">
          <Wishlist
            items={items}
            loading={loading}
            fetchItems={fetchItems}
            isAdmin={isAdmin}
          />
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">HelpOrphan</h3>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs mx-auto md:mx-0">
              Built with ❤️ to support orphanages and connect people willing to
              help. Every contribution makes a real difference.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 uppercase tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["Home", "About", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href={`/${link === "Home" ? "" : link.toLowerCase()}`}
                    className="hover:text-teal-400 transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 uppercase tracking-wide">
              Follow Us
            </h4>
            <div className="flex space-x-5 justify-center md:justify-start text-xl">
              {["facebook", "twitter", "instagram"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="hover:text-teal-400 transition-colors duration-200"
                >
                  <i className={`fab fa-${icon}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-10 border-t border-gray-800 pt-4">
          © 2025 HelpOrphan — All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;
