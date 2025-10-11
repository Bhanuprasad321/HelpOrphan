import React, {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- START: Mock Auth Logic for Standalone File (Required for compilation) ---
// In your actual project, this should be removed, and you should use: import { useAuth } from "../context/AuthContext";
const AuthContext = createContext();
const useAuth = () => {
  // Mock State: Assume admin is logged in by default for demonstration
  const [currentUser] = useState({
    email: "admin@wishlist.com",
  });
  return { currentUser };
};
// --- END: Mock Auth Logic ---

// --- Custom Modal Component (Replaces alert() and window.confirm()) ---
const ConfirmationModal = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const isConfirm = type === "confirm";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isConfirm ? onClose : undefined} // Close alert on backdrop click, but require confirmation for confirm type
      >
        <motion.div
          className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3
            className={`text-xl font-bold mb-4 ${
              isConfirm ? "text-red-400" : "text-yellow-400"
            }`}
          >
            {title}
          </h3>
          <p className="text-gray-300 mb-6">{message}</p>

          <div className="flex justify-end space-x-3">
            {isConfirm && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-150"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onConfirm || onClose} // Use onConfirm for confirm, onClose for alert
              className={`px-4 py-2 rounded-lg text-white font-semibold transition duration-150 shadow-md ${
                isConfirm
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {isConfirm ? "Confirm" : "OK"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
// --- END: Custom Modal Component ---

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: () => setModal({ ...modal, isOpen: false }),
    onClose: () => setModal({ ...modal, isOpen: false }),
  });

  const { currentUser } = useAuth();

  const ADMIN_EMAIL = "admin@wishlist.com";
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const BASE_URL = "https://helporphanapi.onrender.com/wishlist";

  // --- Data Fetching from REST API ---
  const fetchItems = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setIsRefreshing(!showLoading); // Show refresh indicator if not full load
      setError(null);

      const res = await fetch(BASE_URL);

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      // Sort to put Pending items first
      data.sort((a, b) => {
        const statusA = a.status === "Fulfilled" || a.fulfilled;
        const statusB = b.status === "Fulfilled" || b.fulfilled;
        return statusA === statusB ? 0 : statusA ? 1 : -1;
      });
      setWishlistItems(data);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setError(
        "Failed to load data from API. Ensure your backend server is running and the endpoint is correct."
      );
    } finally {
      if (showLoading) setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // --- Admin Action Handlers ---

  const handleEdit = (item) => {
    navigate(`/edit/${item._id || item.id}`, { state: { itemToEdit: item } });
  };

  // Refactored to use Custom Modal instead of window.confirm/alert
  const handleDelete = (itemId, itemName) => {
    if (!isAdmin) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Access Denied",
        message: "Only admins can delete items.",
        onClose: () => setModal({ ...modal, isOpen: false }),
      });
      return;
    }

    setModal({
      isOpen: true,
      type: "confirm",
      title: `Confirm Deletion`,
      message: `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`,
      onConfirm: () => executeDelete(itemId, itemName),
      onClose: () => setModal({ ...modal, isOpen: false }),
    });
  };

  // Core delete logic executed after confirmation
  const executeDelete = async (itemId, itemName) => {
    setModal({ ...modal, isOpen: false }); // Close the modal immediately

    try {
      // NOTE: getAuth() and getIdToken() require the full Firebase setup
      const authInstance = getAuth();
      const user = authInstance.currentUser;

      if (!user) {
        setModal({
          isOpen: true,
          type: "alert",
          title: "Authentication Error",
          message: "Authentication error. Please log in again.",
          onClose: () => setModal({ ...modal, isOpen: false }),
        });
        return;
      }

      const token = await user.getIdToken();

      const res = await fetch(`${BASE_URL}/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Optimistically update UI
        setWishlistItems((prev) =>
          prev.filter((item) => (item._id || item.id) !== itemId)
        );
        setModal({
          isOpen: true,
          type: "alert",
          title: "Success",
          message: `"${itemName}" deleted successfully.`,
          onClose: () => setModal({ ...modal, isOpen: false }),
        });
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Failed to delete item." }));
        throw new Error(
          errorData.message ||
            `Failed to delete item. Server status: ${res.status}`
        );
      }
    } catch (err) {
      console.error("Deletion error:", err);
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: `Deletion failed: ${err.message}. Refreshing data...`,
        onConfirm: fetchItems,
      });
    }
  };

  // --- New: Fulfillment Toggle Handler ---
  const handleToggleFulfillment = async (item) => {
    if (!isAdmin) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Access Denied",
        message: "Only admins can change fulfillment status.",
        onClose: () => setModal({ ...modal, isOpen: false }),
      });
      return;
    }

    const isCurrentlyFulfilled = item.status === "Fulfilled" || item.fulfilled;
    const newStatus = isCurrentlyFulfilled ? "Pending" : "Fulfilled";
    const itemId = item._id || item.id;

    // Optimistic UI update
    const originalStatus = item.status;
    setWishlistItems((prev) =>
      prev.map((i) =>
        (i._id || i.id) === itemId
          ? { ...i, status: newStatus, fulfilled: newStatus === "Fulfilled" }
          : i
      )
    );

    try {
      const authInstance = getAuth();
      const user = authInstance.currentUser;

      if (!user) throw new Error("Authentication failed.");
      const token = await user.getIdToken();

      // NOTE: Assuming the API supports a PUT or PATCH request to update status
      const res = await fetch(`${BASE_URL}/${itemId}/status`, {
        method: "PUT", // or PATCH, depending on your API
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Failed to update status." }));
        throw new Error(
          errorData.message ||
            `Failed to update status. Server status: ${res.status}`
        );
      }

      // Re-fetch to ensure data integrity and correct sorting/UI update
      fetchItems(false);
    } catch (err) {
      console.error("Fulfillment toggle error:", err);
      // Revert optimistic update on failure
      setWishlistItems((prev) =>
        prev.map((i) =>
          (i._id || i.id) === itemId
            ? {
                ...i,
                status: originalStatus,
                fulfilled: originalStatus === "Fulfilled",
              }
            : i
        )
      );

      setModal({
        isOpen: true,
        type: "alert",
        title: "Update Failed",
        message: `Failed to update status: ${err.message}`,
        onClose: () => setModal({ ...modal, isOpen: false }),
      });
    }
  };

  // --- Fulfillment & Data Analysis Logic ---
  const isFulfilled = (item) => item.status === "Fulfilled" || item.fulfilled;

  // Sort logic is now handled in fetchItems to ensure Pending items are always at the top
  const pendingItems = wishlistItems.filter((item) => !isFulfilled(item));
  const fulfilledItems = wishlistItems.filter((item) => isFulfilled(item));
  const totalItems = wishlistItems.length;

  // Calculate percentages for the pie chart
  const fulfilledPercentage =
    totalItems > 0
      ? ((fulfilledItems.length / totalItems) * 100).toFixed(1)
      : 0;
  const pendingPercentage =
    totalItems > 0 ? ((pendingItems.length / totalItems) * 100).toFixed(1) : 0;

  // Helper for urgency styling
  const getUrgencyClass = (urgency) => {
    switch (urgency ? urgency.toLowerCase() : "") {
      case "high":
        return "bg-red-600"; // Darker theme color
      case "medium":
        return "bg-yellow-600"; // Darker theme color
      case "low":
        return "bg-green-600"; // Darker theme color
      default:
        return "bg-gray-600";
    }
  };

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-4 border-teal-400 border-t-transparent mx-auto mb-3"></div>
          <p className="text-xl text-gray-400">Loading data from REST API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400 border border-red-500 bg-gray-800 rounded-lg max-w-6xl mx-auto m-4">
        <h2 className="text-2xl font-bold mb-2">API Connection Error</h2>
        <p>{error}</p>
        <button
          onClick={() => fetchItems()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition duration-150 shadow-md"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-8 w-full mx-auto bg-gray-900 shadow-xl min-h-screen text-gray-200 font-sans"
    >
      <ConfirmationModal {...modal} />

      <h1 className="text-3xl mb-6 font-extrabold text-teal-400 border-b border-gray-700 pb-2">
        Admin Dashboard - Wishlist Overview
      </h1>

      <button
        onClick={() => fetchItems()}
        disabled={isRefreshing}
        className={`mb-6 flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg transition duration-150 shadow-md ${
          isRefreshing
            ? "bg-indigo-700 cursor-not-allowed"
            : "hover:bg-indigo-500"
        }`}
      >
        {isRefreshing ? (
          <span className="flex items-center">
            <span className="animate-spin mr-2">🔄</span> Refreshing...
          </span>
        ) : (
          <>🔄 Refresh Data</>
        )}
      </button>

      <p className="mb-4 text-sm text-gray-400">
        Logged in as:{" "}
        <span className="font-semibold text-white">
          {currentUser?.email || "Guest"}
        </span>
      </p>

      {!isAdmin && (
        <p className="mb-4 text-orange-400 font-semibold border-l-4 border-orange-400 pl-3 py-1 bg-gray-800 rounded-md">
          ⚠️ Access: You are not recognized as the administrator. Edit and
          Delete actions are disabled.
        </p>
      )}

      {/* --- Data Analysis & Pie Chart Section --- */}
      <div className="bg-gray-800 p-6 mb-10 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-teal-300">
          Donation Progress Analysis
        </h2>
        {totalItems === 0 ? (
          <p className="text-gray-400 italic">
            No items have been added to the wishlist yet.
          </p>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            {/* Pie Chart Visualization */}
            <div className="relative w-40 h-40">
              <div
                className="w-full h-full rounded-full ring-4 ring-gray-700"
                style={{
                  background: `conic-gradient(
    #059669 0% ${fulfilledPercentage}%, /* Emerald 600 for Fulfilled */
    #facc15 ${fulfilledPercentage}% 100% /* Amber 400 for Pending */
)`,
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-lg font-bold text-white bg-gray-900 bg-opacity-50 rounded-full">
                  <span className="text-3xl">{totalItems}</span>
                  <span>Items</span>
                </div>
              </div>
            </div>

            {/* Legend and Percentages */}
            <div className="space-y-3">
              <p className="text-lg">
                <span className="inline-block w-4 h-4 bg-emerald-600 rounded-full mr-2"></span>
                Fulfilled:{" "}
                <strong className="text-emerald-400">
                  {fulfilledItems.length}
                </strong>{" "}
                ({fulfilledPercentage}%)
              </p>
              <p className="text-lg">
                <span className="inline-block w-4 h-4 bg-amber-400 rounded-full mr-2"></span>
                Pending:{" "}
                <strong className="text-amber-400">
                  {pendingItems.length}
                </strong>{" "}
                ({pendingPercentage}%)
              </p>
            </div>
          </div>
        )}
      </div>
      {/* ------------------------------------------- */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Items Column */}
        <div>
          <h2 className="text-2xl font-bold mb-5 text-yellow-400 border-b-2 border-yellow-700 pb-1">
            🟡 Pending Items ({pendingItems.length})
          </h2>
          <ul className="space-y-4">
            {pendingItems.length === 0 ? (
              <p className="text-gray-500 italic p-4 bg-gray-800 rounded-lg">
                All items are currently marked as fulfilled!
              </p>
            ) : (
              pendingItems.map((item) => (
                <motion.li
                  key={item._id || item.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-3 p-4 rounded-xl border border-yellow-700 bg-gray-800 shadow-xl"
                >
                  {/* Item Details */}
                  <div className="flex flex-wrap items-baseline gap-x-4">
                    <span className="text-xl font-medium text-white">
                      {item.name || item.item || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400">
                      Qty: {item.quantity || 0}
                    </span>
                    <span
                      className={`text-xs text-white px-2 py-0.5 rounded-full font-semibold mt-1 ${getUrgencyClass(
                        item.urgency
                      )}`}
                    >
                      {item.urgency ? item.urgency.toUpperCase() : "NO URGENCY"}
                    </span>
                  </div>

                  {/* Admin Controls */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
                    <button
                      onClick={() => handleToggleFulfillment(item)}
                      disabled={!isAdmin}
                      className={`text-sm text-white px-3 py-1 rounded-md transition ${
                        isAdmin
                          ? "bg-green-600 hover:bg-green-500"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      ✅ Mark Fulfilled
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      disabled={!isAdmin}
                      className={`text-sm text-white px-3 py-1 rounded-md transition ${
                        isAdmin
                          ? "bg-blue-600 hover:bg-blue-500"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(
                          item._id || item.id,
                          item.name || item.item
                        )
                      }
                      disabled={!isAdmin}
                      className={`text-sm text-white px-3 py-1 rounded-md transition ${
                        isAdmin
                          ? "bg-red-600 hover:bg-red-500"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        </div>

        {/* Fulfilled Items Column */}
        <div>
          <h2 className="text-2xl font-bold mb-5 text-green-400 border-b-2 border-green-700 pb-1">
            💚 Fulfilled Items ({fulfilledItems.length})
          </h2>
          <ul className="space-y-4">
            {fulfilledItems.length === 0 ? (
              <p className="text-gray-500 italic p-4 bg-gray-800 rounded-lg">
                No items have been fulfilled yet.
              </p>
            ) : (
              fulfilledItems.map((item) => (
                <motion.li
                  key={item._id || item.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-3 p-4 rounded-xl border border-green-700 bg-gray-800 shadow-xl opacity-75"
                >
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                      <span className="font-medium text-gray-500 line-through text-lg">
                        {item.name || item.item || "N/A"}
                      </span>
                      <span className="text-sm text-gray-500">
                        Qty: {item.quantity || 0}
                      </span>
                    </div>
                    <span className="text-sm text-green-500 font-bold">
                      ✅ FULFILLED
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-700">
                    <button
                      onClick={() => handleToggleFulfillment(item)}
                      disabled={!isAdmin}
                      className={`text-sm text-white px-3 py-1 rounded-md transition ${
                        isAdmin
                          ? "bg-yellow-600 hover:bg-yellow-500"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      ↩️ Mark Pending
                    </button>
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
