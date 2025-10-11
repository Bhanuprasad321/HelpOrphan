import React from "react";
import Card from "./Card";
import { useAuth } from "../context/AuthContext";
import { getAuth } from "firebase/auth";

// 🎯 MODIFIED: Accept items, loading, and fetchItems as props from App.jsx
function Wishlist({ items, loading, fetchItems }) {
  
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.email === "admin@wishlist.com";

  // ❌ REMOVED: Local state management (useState for wishlistItems)
  // ❌ REMOVED: Local data fetching (useEffect)

  // Keep the delete logic but update it to use the centralized fetch function
  const handleDelete = async (id) => {
    try {
      if (!currentUser) {
        alert("You must be logged in as admin to delete items");
        return;
      }

      // 🔑 Get Firebase ID token
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`https://helporphanapi.onrender.com/wishlist/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      if (res.ok) {
        // 🎯 CRITICAL CHANGE: Instead of updating local state, call the
        // parent's (App.jsx) fetch function to re-synchronize the central list.
        await fetchItems(); 
      } else {
        console.error("Error while deleting item");
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  // Display loading state using the prop received from App.jsx
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-teal-400 text-xl">
        Loading Wishlist Items...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 py-8">
      {Array.isArray(items) && items.map((listItem) => (
          <Card
            key={listItem._id}
            data={listItem}
            isAdmin={isAdmin}
            onDelete={handleDelete}
          />
        ))}
    </div>
  );
}

export default Wishlist;