import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom"; 

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


export default function AdminDashboard() {
    const navigate = useNavigate();
    
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { currentUser } = useAuth(); 

    const ADMIN_EMAIL = "admin@wishlist.com";
    const isAdmin = currentUser?.email === ADMIN_EMAIL; 

    // --- Data Fetching from REST API ---
    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const res = await fetch("https://helporphanapi.onrender.com/wishlist");
            
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            
            const data = await res.json();
            setWishlistItems(data);
            
        } catch (err) {
            console.error("Failed to fetch wishlist:", err);
            setError("Failed to load data from https://helporphanapi.onrender.com/wishlist. Ensure your backend server is running and the endpoint is correct.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);
    
    // --- Admin Action Handlers ---
    
    const handleEdit = (item) => {
        navigate(`/edit/${item._id}`, { state: { itemToEdit: item } });
    };

    const handleDelete = async (itemId, itemName) => {
        if (!isAdmin) {
            alert("Access Denied: Only admins can delete items.");
            return;
        }
        if (!window.confirm(`Are you sure you want to permanently delete ${itemName}?`)) {
            return;
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                alert("Authentication error. Please log in again.");
                return;
            }
            
            const token = await user.getIdToken(); 

            const res = await fetch(`https://helporphanapi.onrender.com/wishlist/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
            });

            if (res.ok) {
                alert(`${itemName} deleted successfully.`);
                setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== itemId));
            } else {
                const errorData = await res.json().catch(() => ({ message: 'Failed to delete item.' }));
                throw new Error(errorData.message || `Failed to delete item. Server status: ${res.status}`);
            }
        } catch (err) {
            console.error("Deletion error:", err);
            alert(`Deletion failed: ${err.message}`);
            fetchItems();
        }
    };

    // --- Fulfillment & Data Analysis Logic ---
    const isFulfilled = (item) => item.status === 'Fulfilled' || item.fulfilled;
    
    const pendingItems = wishlistItems.filter(item => !isFulfilled(item));
    const fulfilledItems = wishlistItems.filter(item => isFulfilled(item));
    const totalItems = wishlistItems.length;

    // Calculate percentages for the pie chart
    const fulfilledPercentage = totalItems > 0 ? ((fulfilledItems.length / totalItems) * 100).toFixed(1) : 0;
    const pendingPercentage = totalItems > 0 ? ((pendingItems.length / totalItems) * 100).toFixed(1) : 0;

    // Helper for urgency styling
    const getUrgencyClass = (urgency) => {
        switch (urgency ? urgency.toLowerCase() : '') {
            case 'high': return 'bg-red-600'; // Darker theme color
            case 'medium': return 'bg-yellow-600'; // Darker theme color
            case 'low': return 'bg-green-600'; // Darker theme color
            default: return 'bg-gray-600';
        }
    };

    // --- Loading and Error States ---
    if (loading) {
        return (
            <div className="p-8 text-center text-xl text-gray-400 bg-gray-900 min-h-screen">
                Loading real-time wishlist data from REST API...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-400 border border-red-500 bg-gray-800 rounded-lg max-w-6xl mx-auto">
                <strong>Error</strong>: {error}
            </div>
        );
    }


    return (
        // Changed to dark theme background and text
        <div className="p-8 w-full mx-auto bg-gray-900 shadow-xl  min-h-screen text-gray-200">
            <h1 className="text-3xl mb-6 font-extrabold text-teal-400 border-b border-gray-700 pb-2">
                Admin Dashboard - Wishlist Overview
            </h1>
            
            <button 
                onClick={fetchItems}
                className="mb-6 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition duration-150 shadow-md"
            >
                🔄 Refresh Data
            </button>
            
            {!isAdmin && (
                <p className="mb-4 text-orange-400 font-semibold border-l-4 border-orange-400 pl-3 py-1 bg-gray-800">
                    ⚠️ Access: Logged in as non-admin user ({currentUser?.email || 'Guest'}). Delete buttons are disabled.
                </p>
            )}

            {/* --- Data Analysis & Pie Chart Section --- */}
            <div className="bg-gray-800 p-6 mb-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-teal-300">Donation Progress Analysis</h2>
                {totalItems === 0 ? (
                    <p className="text-gray-400 italic">No items to analyze.</p>
                ) : (
                    <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                        
                        {/* Pie Chart Visualization */}
                        <div className="relative w-40 h-40">
                            {/* Uses conic-gradient for a simple, dependency-free pie chart */}
                            <div 
                                className="w-full h-full rounded-full" 
                                style={{
                                    background: `conic-gradient(
                                        #10b981 0% ${fulfilledPercentage}%, /* Emerald 500 for Fulfilled */
                                        #fbbf24 ${fulfilledPercentage}% 100% /* Amber 400 for Pending */
                                    )`
                                }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center text-center text-xl font-bold text-white">
                                    {totalItems} <br/> Items
                                </div>
                            </div>
                        </div>

                        {/* Legend and Percentages */}
                        <div className="space-y-3">
                            <p className="text-lg">
                                <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                                Fulfilled: <strong className="text-emerald-400">{fulfilledPercentage}%</strong> ({fulfilledItems.length})
                            </p>
                            <p className="text-lg">
                                <span className="inline-block w-3 h-3 bg-amber-400 rounded-full mr-2"></span>
                                Pending: <strong className="text-amber-400">{pendingPercentage}%</strong> ({pendingItems.length})
                            </p>
                            <p className="text-lg text-gray-400">Total Items: {totalItems}</p>
                        </div>
                    </div>
                )}
            </div>
            {/* ------------------------------------------- */}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Pending Items Column */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-yellow-500 border-b-2 border-yellow-700 pb-1">
                        Pending Items ({pendingItems.length})
                    </h2>
                    <ul className="space-y-3">
                        {pendingItems.length === 0 ? (
                            <p className="text-gray-500 italic">No pending items found in the database.</p>
                        ) : (
                            pendingItems.map(item => (
                                <li key={item._id || item.id} className="flex flex-col gap-2 md:flex-row justify-between items-start md:items-center bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
                                    
                                    {/* Item Details */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                        <span className="font-medium text-white">{item.name || item.item || 'N/A'}</span>
                                        <span className="text-sm text-gray-400">Qty: {item.quantity || 0}</span>
                                        <span className={`text-xs text-white px-2 py-0.5 rounded ${getUrgencyClass(item.urgency)}`}>
                                            {item.urgency ? item.urgency.toUpperCase() : 'N/A'}
                                        </span>
                                    </div>

                                    {/* Admin Controls */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-500 transition"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id || item.id, item.name || item.item)}
                                            className={`text-sm text-white px-3 py-1 rounded-md transition ${
                                                isAdmin ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-600 cursor-not-allowed'
                                            }`}
                                            disabled={!isAdmin}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
                
                {/* Fulfilled Items Column */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-green-500 border-b-2 border-green-700 pb-1">
                        Fulfilled Items ({fulfilledItems.length})
                    </h2>
                    <ul className="space-y-3">
                        {fulfilledItems.length === 0 ? (
                            <p className="text-gray-500 italic">No items have been fulfilled yet.</p>
                        ) : (
                            fulfilledItems.map(item => (
                                <li key={item._id || item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-800 p-3 rounded-lg border border-green-600 shadow-lg opacity-80">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                        <span className="font-medium text-gray-500 line-through">{item.name || item.item || 'N/A'}</span>
                                        <span className="text-sm text-gray-500">Qty: {item.quantity || 0}</span>
                                    </div>
                                    <span className="text-sm text-green-500 font-bold">✅ FULFILLED</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}