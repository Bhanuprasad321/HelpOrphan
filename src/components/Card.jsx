import React from "react";
import { useNavigate } from "react-router-dom";

function Card({ data, isAdmin, onDelete }) {
  const navigate = useNavigate();

  const urgencyColors = {
    low: "bg-green-600",
    medium: "bg-yellow-600",
    high: "bg-red-600",
  };
  
  // 🎯 CRITICAL FIX: Use the 'fulfilled' boolean property from the updated data
  const isFulfilled = data.fulfilled;

  const statusStyles = isFulfilled 
    ? { 
        cardClass: "opacity-60 border-green-500", 
        statusColor: "bg-green-700", 
        donationDisabled: true,
        // Use committedBy if available for better display
        statusText: data.committedBy ? `FULFILLED by ${data.committedBy.split(' ')[0]}` : "FULFILLED"
      }
    : {
        cardClass: "border-gray-800", 
        statusColor: "bg-teal-700", // Used teal for the default/pending status
        donationDisabled: false,
        // Default to PENDING if status is not explicitly set
        statusText: data.status ? data.status.toUpperCase() : "PENDING"
      };

  return (
    <div
      className={`w-72 bg-gray-900 border ${statusStyles.cardClass} rounded-2xl shadow-lg 
                   hover:shadow-xl ${!statusStyles.donationDisabled && 'hover:scale-105'} transition-transform duration-300 
                   flex flex-col justify-between p-5 relative`}
    >
      
      {/* 1. STATUS BADGE (Positioned top-right) */}
      <div 
        className={`absolute top-0 right-0 m-3 px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wider 
                     ${statusStyles.statusColor} shadow-md`}
      >
        {statusStyles.statusText}
      </div>

      <div className="pt-4"> {/* Added padding to push content down below the badge */}
        {/* Item Title */}
        <h2 className="text-xl font-bold text-white mb-2">{data.item}</h2>

        {/* Item Details */}
        <p className="text-gray-300">Quantity: {data.quantity}</p>
        <p
          className={`text-white text-sm px-2 py-1 mt-2 rounded-full inline-block 
          ${urgencyColors[data.urgency]}`}
        >
          Urgency: {data.urgency}
        </p>
        <p className="text-gray-400 text-sm mt-1">{data.orphanage}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4">
        <button
          className={`px-4 py-2 rounded-xl text-white font-medium shadow-md transition-all 
            ${statusStyles.donationDisabled 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-teal-600 hover:bg-teal-500'}`
          }
          onClick={() => navigate("/DonationForm", { state: { itemData: data } })}
          disabled={statusStyles.donationDisabled}
        >
          {statusStyles.donationDisabled ? 'Fulfilled' : 'Donate'}
        </button>

        {isAdmin && (
          <button
            onClick={() => onDelete(data._id)}
            className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-xl 
                       text-white font-medium flex items-center gap-2 transition-all"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default Card;