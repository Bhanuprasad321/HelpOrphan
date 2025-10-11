import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Navbar from "./components/Navbar";
import AdminWishListView from "./components/AdminWishListView";
import AddForm from "./components/AddForm";
import Wishlist from "./components/Wishlist";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import DonationForm from "./components/DonationForm";
import EditForm from "./components/EditForm";

// Wrapper to protect admin-only routes (no change)
function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.email === "admin@wishlist.com";

  if (!isAdmin) {
    return (
      <div className="text-center mt-10 text-red-500 text-xl">
                🔒 Access Denied: Admins only      {" "}
      </div>
    );
  }
  return children;
}

function App() {
  // 1. 🎯 STATE MANAGEMENT: Centralize the item list and loading status
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2. 🎯 FETCH FUNCTION: Create the function to fetch data from the backend
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("https://helporphanapi.onrender.com/wishlist");
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist items");
      }
      const data = await response.json();
      setItems(data); // Update the central state
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. 🎯 INITIAL LOAD: Fetch data when the app mounts
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <AuthProvider>
           {" "}
      <div>
                <Navbar />   
        <Routes>
          {/* Pass the item list to components that display it */}         {" "}
          <Route
            path="/"
            element={
              <Home items={items} loading={loading} fetchItems={fetchItems} />
            }
          />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
          {/* Pass the item list and the fetch function */}         {" "}
          <Route
            path="/wishlist"
            element={
              <Wishlist
                items={items}
                loading={loading}
                fetchItems={fetchItems}
              />
            }
          />
                    <Route path="/login" element={<Login />} />         {" "}
          
          {/* CRITICAL FIX 1: Pass fetchItems to AdminWishListView */}
          <Route 
            path="/AdminWishListView" 
            element={<AdminWishListView items={items} loading={loading} fetchItems={fetchItems} />} 
          /> {" "}
          
          {/* CRITICAL FIX 2: Change static path "/edit" to dynamic path "/edit/:id" and pass fetchItems */}
          <Route 
            path="/edit/:id" 
            element={
              <AdminRoute>
                <EditForm fetchItems={fetchItems} />
              </AdminRoute>
            } 
          /> 
                  
          {/* 🎯 Pass the real fetchItems function to DonationForm */} 
                 {" "}
          <Route
            path="/DonationForm"
            element={<DonationForm fetchItems={fetchItems} />}
          />
                   {" "}
          <Route path="/AdminDashboard" element={<AdminDashboard />} />         {" "}
          {/* Protected Route for AddForm */}         {" "}
          <Route
            path="/add"
            element={
              <AdminRoute>
                                <AddForm fetchItems={fetchItems} />{" "}
              </AdminRoute>
            }
          />
                 {" "}
        </Routes>
             {" "}
      </div>
         {" "}
    </AuthProvider>
  );
}

export default App;
