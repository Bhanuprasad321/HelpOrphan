import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuth, signOut } from "firebase/auth";

// Helper component to render the main navigation links
const NavLinks = ({ isAdmin, onLinkClick }) => (
  <>
    <Link
      to="/"
      className="block py-2 px-3 hover:text-teal-400 transition-colors"
      onClick={onLinkClick}
    >
      Home
    </Link>
    <Link
      to="/about"
      className="block py-2 px-3 hover:text-teal-400 transition-colors"
      onClick={onLinkClick}
    >
      About
    </Link>
    <Link
      to="/contact"
      className="block py-2 px-3 hover:text-teal-400 transition-colors"
      onClick={onLinkClick}
    >
      Contact
    </Link>

    {/* Admin Links are handled separately for buttons/styling */}
  </>
);

function Navbar() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu toggle
  const isAdmin = currentUser?.email === "admin@wishlist.com";

  const handleLinkClick = () => {
    setIsOpen(false); // Close menu when a link is clicked
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      alert("Logged out successfully");
      handleLinkClick(); // Close menu on logout
    } catch (error) {
      console.error("Logout error", error);
      alert("Logout failed");
    }
  };

  return (
    <nav className="bg-gray-900 sticky top-0 z-50 shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto  px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 1. Logo / Title */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-extrabold text-white">
              Help<span className="text-teal-400">Orphan</span>
            </Link>
          </div>

          {/* 2. Desktop Links and Buttons (Visible on md and larger) */}
          <div className="hidden md:flex items-center gap-6 text-gray-300 font-medium">
            <NavLinks isAdmin={isAdmin} onLinkClick={handleLinkClick} />
            <Link to="/donors" className="hover:text-teal-400 transition">
              Donor Wall
            </Link>

            {/* Desktop Auth/Admin Buttons */}
            {isAdmin && (
              <>
                <Link to="/add">
                  <button className="bg-teal-500 px-4 py-2 rounded-full text-white shadow hover:bg-teal-600 transition-colors">
                    Add Item
                  </button>
                </Link>
                <Link to="/AdminDashboard">
                  <button className="bg-teal-500 px-4 py-2 rounded-full text-white shadow hover:bg-teal-600 transition-colors">
                    Admin Dashboard
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-4 py-2 rounded-full text-white shadow hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            )}

            {!isAdmin && (
              <Link
                to="/login"
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 px-5 rounded-full font-semibold shadow-md hover:shadow-xl transition-all"
              >
                Admin Login
              </Link>
            )}
          </div>

          {/* 3. Mobile Hamburger Button (Hidden on md and larger) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                // X Icon
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger Icon
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Menu Panel (Hidden by default, shown when isOpen is true) */}
      <div
        className={`md:hidden ${
          isOpen ? "block" : "hidden"
        } bg-gray-800 border-t border-gray-700`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 text-gray-300 font-medium">
          <NavLinks isAdmin={isAdmin} onLinkClick={handleLinkClick} />

          {/* Mobile Auth/Admin Buttons */}
          <div className="pt-2 border-t border-gray-700 space-y-2">
            {isAdmin ? (
              <>
                <Link to="/add" onClick={handleLinkClick}>
                  <button className="w-full bg-teal-500 px-4 py-2 rounded-md text-white shadow hover:bg-teal-600 transition-colors">
                    Add Item
                  </button>
                </Link>
                <Link to="/AdminDashboard" onClick={handleLinkClick}>
                  <button className="w-full bg-teal-500 px-4 py-2 rounded-md text-white shadow hover:bg-teal-600 transition-colors">
                    Admin Dashboard
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 px-4 py-2 rounded-md text-white shadow hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={handleLinkClick}
                className="block text-center bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 px-5 rounded-md font-semibold shadow-md hover:shadow-xl transition-all"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
