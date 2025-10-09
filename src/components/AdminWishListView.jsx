import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { getAuth } from "firebase/auth";
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from "react-router-dom";

// --- START: MOCK AUTH CONTEXT (REQUIRED FOR STANDALONE EXECUTION) ---
// ⚠️ IMPORTANT: Mocking a regular, NON-ADMIN user (no admin@wishlist.com email and no userOrphanageName)
// The preview will show no Edit/Delete buttons because the mock user is not an admin.
// --- END: MOCK AUTH CONTEXT ---

function AdminWishlistView() {
  const { currentUser, userOrphanageName } = useAuth();
  const navigate = useNavigate();

  // --- ADMIN ROLE DEFINITION ---
  const isAdmin = currentUser?.email === "admin@wishlist.com";

  // Admin is either the Global Admin OR an Orphanage Admin.
  // -----------------------------

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // --- Core Logic for Fulfillment Check ---
  const isItemFulfilled = (item) => {
    return (
      item.fulfilled === true || item.status?.toLowerCase() === "fulfilled"
    );
  };

  // Fetch wishlist items from backend
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      // Replace with your actual backend URL/logic
      const res = await fetch("http://localhost:5000/wishlist", {
        cache: "no-cache",
      });
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();

      // FILTERING: Global Admin sees ALL items. Orphanage Admins only see their own.
      let itemsToDisplay = data;
      setWishlistItems(itemsToDisplay);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      console.error("Error fetching wishlist");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Delete item (admin only)
  const handleDelete = async (id, itemName) => {
    // Access Guard: Only admins can attempt to delete.
    if (!isAdmin) {
      console.log("Access Denied: Not an admin. Cannot delete.");
      return;
    }

    // 🛑 CRITICAL NOTE: window.confirm() is prohibited.
    // In a real application, you MUST replace this with a custom modal UI component for confirmation.
    console.log(
      `Custom Modal Confirmation: User wants to delete item ${id}. Proceeding...`
    );

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.log("Authentication error: User not logged in.");
        return;
      }
      const token = await user.getIdToken();

      const res = await fetch(`http://localhost:5000/wishlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Optimistically update UI
        setWishlistItems((prev) => prev.filter((i) => i._id !== id));
        console.log(`Item "${itemName}" deleted successfully.`);
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Server error" }));
        console.error(
          `Failed to delete item: ${errorData.error || "Please try again."}`
        );
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      console.log("Error deleting item");
    }
  };

  const handleDonate = (item) => {
    if (isItemFulfilled(item)) {
      console.log(`Item ${item.item} is already fulfilled.`);
      return;
    }
    else navigate("/DonationForm", { state: { itemData: item }} );
  };

  const handleEdit = (item) => {
    // Access Guard: Ensure only admins can initiate an edit
    if (!isAdmin) {
      console.log("Access Denied: Not an admin. Cannot edit.");
      return;
    }
    navigate(`/edit/${item._id}`, { state: { itemToEdit: item } });
  };

  // Filter wishlist by urgency (Unchanged)
  const filteredItems = wishlistItems.filter((item) => {
    if (urgencyFilter === "all") return true;
    return item.urgency?.toLowerCase() === urgencyFilter.toLowerCase();
  });

  if (loading)
    return (
      <p className="text-center mt-8 text-gray-400">Loading wishlist...</p>
    );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h2 className="text-3xl font-semibold mb-6 text-teal-400 text-center">
        Wishlist Management
      </h2>

      {/* Manual Refresh Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={fetchWishlist}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-lg"
        >
          🔄 Refresh Wishlist Data
        </button>
      </div>

      <div className="max-w-sm mx-auto mb-6">
        <label
          className="block mb-2 text-gray-300 font-semibold"
          htmlFor="urgencyFilter"
        >
          Filter by Urgency
        </label>
        <select
          id="urgencyFilter"
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-gray-400 text-center">
          No items match the selected filter.
        </p>
      ) : (
        <ul className="max-w-4xl mx-auto space-y-4">
          {filteredItems.map((item) => {
            const fulfilled = isItemFulfilled(item);

            return (
              <li
                key={item._id}
                className={`rounded-lg shadow p-4 flex flex-col md:flex-row justify-between items-start md:items-center transition duration-300 ${
                  fulfilled
                    ? "bg-gray-700 opacity-80 border-l-4 border-green-500"
                    : "bg-gray-800 border-l-4 border-transparent"
                }`}
              >
                <div>
                  <h3
                    className={`text-lg font-bold ${
                      fulfilled ? "text-gray-400 line-through" : "text-white"
                    }`}
                  >
                    {item.item}
                    {fulfilled && (
                      <span className="ml-3 text-sm font-semibold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">
                        ✅ FULFILLED
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-400">
                    Quantity: {item.quantity} | Urgency: {item.urgency} |
                    Orphanage: {item.orphanage}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                  {/* Edit and Delete are only rendered if the user is an admin */}
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-blue-600 px-4 py-2 rounded-full text-white shadow hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.item)}
                        className="bg-red-600 px-4 py-2 rounded-full text-white shadow hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleDonate(item)}
                        disabled={fulfilled}
                        className={`px-4 py-2 rounded-full text-white shadow transition ${
                          fulfilled
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {fulfilled ? "Fulfilled" : "Donate"}
                      </button>
                    </>
                  ) : (
                    <button
                        disabled={fulfilled}
                      onClick={() => handleDonate(item)}
                      
                      className={`px-4 py-2 rounded-full text-white shadow transition ${
                        fulfilled
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {fulfilled ? "Fulfilled" : "Donate"}
                    </button>
                  )}
                  {/* END ADMIN BUTTONS */}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AdminWishlistView;
