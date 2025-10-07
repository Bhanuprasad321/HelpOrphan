import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth to get user info

/**
 * Component for administrators to add new items to the wishlist.
 *
 * @param {object} props - Component props.
 * @param {function} props.fetchItems - Function from App.jsx to re-fetch all wishlist items.
 */
function AddForm({ fetchItems }) { // 👈 FIX 1: Accepting the fetchItems prop
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get current user from context

  // State for the new item form (consolidated for cleaner handling)
  const [newItem, setNewItem] = useState({
    item: "",
    quantity: 1,
    urgency: "low",
    orphanage: "",
  });
  
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    if (!newItem.item || newItem.quantity <= 0 || !newItem.orphanage) {
      setMessage("Error: Please fill all the fields."); // 👈 FIX 2: Replace alert() with setMessage
      setIsSubmitting(false);
      return;
    }

    try {
      if (!currentUser) {
        setMessage("Error: You must be logged in as admin to add items."); // 👈 FIX 2: Replace alert() with setMessage
        setIsSubmitting(false);
        return;
      }

      const token = await currentUser.getIdToken();

      const res = await fetch("http://localhost:5000/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send Firebase auth token
        },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        // ✅ CORE FIX: Call fetchItems to update the central state and re-render the Home page
        await fetchItems(); 
        
        setMessage("Success: Item added successfully to the wishlist! The home page is now updated.");
        
        // Clear form
        setNewItem({ item: "", quantity: 1, urgency: "low", orphanage: newItem.orphanage });
        
        // Navigate after a short delay to allow success message display
        setTimeout(() => navigate("/"), 1500);

      } else {
        const errorData = await res.json();
        setMessage(`Error: Failed to add item: ${errorData.error || "Please try again."}`); // 👈 FIX 2: Replace alert() with setMessage
      }
    } catch (err) {
      console.error(err);
      setMessage("Error: An unexpected network error occurred. Please check the console."); // 👈 FIX 2: Replace alert() with setMessage
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-900 p-6">
      <div className="max-w-xl w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-teal-700">
        <h2 className="text-3xl font-extrabold text-teal-400 mb-6 border-b border-teal-700 pb-2">
          Add New Wishlist Item (Admin)
        </h2>
        {/* 👈 FIX 2: Custom Message Box */}
        {message && (
          <div 
            className={`p-3 mb-4 rounded-lg text-sm font-medium ${message.startsWith('Error') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}
          >
            {message.replace('Error: ', '').replace('Success: ', '')}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm text-gray-300" htmlFor="item">
              Item Name
            </label>
            <input
              className="w-full p-2 rounded-lg text-white bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              type="text"
              id="item"
              name="item"
              value={newItem.item}
              onChange={handleChange}
            />
          </div>
          <div>
            <label
              className="block mb-2 text-sm text-gray-300"
              htmlFor="quantity"
            >
              Quantity
            </label>
            <input
              className="w-full p-2 rounded-lg text-white bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={newItem.quantity}
              onChange={handleChange}
            />
          </div>
          <div>
            <label
              className="block mb-2 text-sm text-gray-300"
              htmlFor="urgency"
            >
              Urgency
            </label>
            <select
              id="urgency"
              name="urgency"
              value={newItem.urgency}
              onChange={handleChange}
              className="w-full p-2 rounded-lg text-white bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label
              className="block mb-2 text-sm text-gray-300"
              htmlFor="orphanage"
            >
              Orphanage Name
            </label>
            <input
              className="w-full p-2 text-white rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              type="text"
              id="orphanage"
              name="orphanage"
              value={newItem.orphanage}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 mt-4 font-semibold rounded-lg shadow-md transition ${
              isSubmitting 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white'
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
export default AddForm;
