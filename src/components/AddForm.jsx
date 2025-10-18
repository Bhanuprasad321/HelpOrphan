import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

function AddForm({ fetchItems }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [newItem, setNewItem] = useState({
    item: "",
    quantity: 1,
    urgency: "low",
    orphanage: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setMessage("Error: Please fill all the fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (!currentUser) {
        setMessage("Error: You must be logged in as admin to add items.");
        setIsSubmitting(false);
        return;
      }

      const token = await currentUser.getIdToken();
      const res = await fetch("https://helporphanapi.onrender.com/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        await fetchItems();
        setMessage("Success: Item added successfully!");
        setNewItem({ item: "", quantity: 1, urgency: "low", orphanage: newItem.orphanage });
        setTimeout(() => navigate("/"), 1500);
      } else {
        const errorData = await res.json();
        setMessage(`Error: Failed to add item: ${errorData.error || "Please try again."}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error: An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-xl w-full bg-gray-800 p-8 rounded-3xl shadow-2xl border border-teal-700"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl font-extrabold text-teal-400 mb-6 border-b border-teal-700 pb-2 text-center"
        >
          Add New Wishlist Item (Admin)
        </motion.h2>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`p-3 mb-4 rounded-lg text-sm font-medium text-center 
              ${message.startsWith('Error') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}
          >
            {message.replace('Error: ', '').replace('Success: ', '')}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {["item", "quantity", "urgency", "orphanage"].map((field, idx) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
            >
              <label className="block mb-2 text-sm text-gray-300 capitalize" htmlFor={field}>
                {field === "item" ? "Item Name" : field}
              </label>
              {field === "urgency" ? (
                <select
                  id={field}
                  name={field}
                  value={newItem.urgency}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg text-white bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <input
                  type={field === "quantity" ? "number" : "text"}
                  id={field}
                  name={field}
                  min={field === "quantity" ? 1 : undefined}
                  value={newItem[field]}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg text-white bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                />
              )}
            </motion.div>
          ))}

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0px 0px 25px rgba(56,189,248,0.6)" }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 mt-4 font-semibold rounded-lg shadow-md transition ${
              isSubmitting 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white'
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default AddForm;
