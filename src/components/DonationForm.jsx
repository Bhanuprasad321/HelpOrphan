import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Component for committing to a donation. It sends a log of the commitment 
 * and updates the item status on the server.
 * @param {object} props - Component props.
 * @param {function} props.fetchItems - Function to re-fetch the wishlist data from the parent component.
 */
function DonationForm({ fetchItems }) {
  const location = useLocation();
  const navigate = useNavigate();

  const itemData = location.state?.itemData;
  const [donorName, setDonorName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [message, setMessage] = useState("");
  const [item, setItem] = useState(itemData?.item || itemData?.name || ""); 

  useEffect(() => {
    if (itemData) {
      setItem(itemData.item || itemData.name || "");
    }
  }, [itemData]);

  const itemToFulfill = itemData ? itemData.item || itemData.name : item;
  // Use itemData._id which is the MongoDB ObjectId
  const itemId = itemData ? itemData._id : null; 
  
  // Display error if critical data (item ID) is missing
  if (!itemToFulfill || !itemId) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="max-w-lg w-full bg-gray-900 p-6 rounded-lg shadow text-red-400">
          <h2 className="text-xl font-semibold mb-4 text-red-500">Error</h2>   
          <p>Cannot process donation: Item details or ID are missing.</p>       
          <p className="text-sm text-gray-400 mt-2">
            Please ensure the item's full data is passed to the DonationForm component.                  
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NOTE: For security and best practice, use a custom modal instead of alert().
    if (!donorName || !contactEmail) {
      alert("Please fill in your Name and Contact Email.");
      return;
    }

    const commitmentData = {
      itemId: itemId,
      donorName,
      contactEmail,
      status: "Fulfilled", // This is only for the donation log document
      commitmentTimestamp: new Date().toISOString(),
      itemCommitted: itemToFulfill,
    };

    try {
      // 1. Send Commitment Data (Log the donation)
      const donationLogRes = await fetch("http://localhost:5000/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commitmentData),
      }); 
      
      // 2. Update Item Status in the Wishlist (sets fulfilled: true and committedBy)
      const statusUpdateRes = await fetch(
        `http://localhost:5000/wishlist/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fulfilled: true, committedBy: donorName }),
        }
      ); 
      
      // Check both responses
      if (donationLogRes.ok && statusUpdateRes.ok) {
        setMessage(
          `Success! You have committed to donate "${itemToFulfill}". The item status is now updated. We will contact you at ${contactEmail}.`
        ); 
        setDonorName("");
        setContactEmail("");

        // IMPORTANT: Re-fetch the data to update the central state in App.jsx
        if (fetchItems) {
          await fetchItems();
        }

        // ✅ FINAL FIX: Navigate back immediately (0ms delay) after refetching data
        setTimeout(() => {
          navigate("/");
        }, 0); 
      
      } else {
        const logErr = donationLogRes.ok
          ? "Log Success"
          : await donationLogRes.json();
        const statusErr = statusUpdateRes.ok
          ? "Status Success"
          : await statusUpdateRes.json();
        console.error("Log Error:", logErr, "Status Error:", statusErr);
        alert(
          "Commitment submission failed: Status update may have failed. Check server logs."
        );
      }
    } catch (error) {
      alert("A network error occurred.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900">
      <div className="max-w-lg w-full bg-gray-900 p-6 rounded-lg shadow-2xl border border-teal-800 text-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-teal-400 border-b border-teal-700 pb-2">
          Commitment Form for:          
          <span className="block mt-1 text-white text-3xl">
            {itemToFulfill}
          </span>
        </h2>
        {message && (
          <p className="mb-4 text-green-400 font-semibold">{message}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-teal-300">
              Item You Are Committing To
            </label>
            <input
              type="text"
              value={itemToFulfill}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 cursor-not-allowed"
              readOnly 
            />
          </div>
          <div>
            <label className="block mb-1">Your Name *</label>       
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Contact Email *</label>   
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-teal-400 py-3 rounded text-white text-lg font-bold hover:from-teal-600 hover:to-teal-500 transition shadow-lg"
          >
            Commit to Donate This Item          
          </button>
        </form>
      </div>
    </div>
  );
}

export default DonationForm;
