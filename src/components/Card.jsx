import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Card({ data, isAdmin, onDelete }) {
  const navigate = useNavigate();

  const urgencyColors = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };

  const isFulfilled = data.fulfilled;

  const statusStyles = isFulfilled
    ? {
        cardClass: "opacity-70 border-green-500",
        statusColor: "bg-green-600",
        donationDisabled: true,
        statusText: data.committedBy ? `FULFILLED by ${data.committedBy.split(' ')[0]}` : "FULFILLED",
      }
    : {
        cardClass: "border-gray-700",
        statusColor: "bg-teal-600",
        donationDisabled: false,
        statusText: data.status ? data.status.toUpperCase() : "PENDING",
      };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -3, boxShadow: "0px 15px 25px rgba(0,0,0,0.5)" }}
      className={`w-72 bg-gray-900 border ${statusStyles.cardClass} rounded-2xl shadow-lg 
                  flex flex-col justify-between p-5 relative transition-transform duration-300`}
    >
      {/* STATUS BADGE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.1 }}
        className={`absolute top-0 right-0 m-3 px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wider 
                    ${statusStyles.statusColor} shadow-lg`}
      >
        {statusStyles.statusText}
      </motion.div>

      {/* CONTENT */}
      <div className="pt-6">
        <h2 className="text-xl font-bold text-white mb-2">{data.item}</h2>
        <p className="text-gray-300">Quantity: <span className="font-medium">{data.quantity}</span></p>
        <p
          className={`text-white text-sm px-3 py-1 mt-2 rounded-full inline-block font-medium 
                      ${urgencyColors[data.urgency]}`}
        >
          Urgency: {data.urgency.toUpperCase()}
        </p>
        <p className="text-gray-400 text-sm mt-2 italic">{data.orphanage}</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between items-center mt-5 gap-3">
        <motion.button
          whileHover={{ scale: !statusStyles.donationDisabled ? 1.05 : 1 }}
          whileTap={{ scale: !statusStyles.donationDisabled ? 0.95 : 1 }}
          onClick={() => navigate("/DonationForm", { state: { itemData: data } })}
          disabled={statusStyles.donationDisabled}
          className={`flex-1 px-4 py-2 rounded-xl text-white font-medium shadow-md transition-all 
                      ${statusStyles.donationDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-500'}`}
        >
          {statusStyles.donationDisabled ? 'Fulfilled' : 'Donate'}
        </motion.button>

        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(data._id)}
            className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-xl text-white font-medium flex items-center gap-2 shadow-md transition-all"
          >
            🗑️ Delete
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default Card;
