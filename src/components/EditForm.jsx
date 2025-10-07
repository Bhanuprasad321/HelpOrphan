import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";

/**
 * Component for administrators to edit an existing item in the wishlist.
 * It pre-fills the form using item data passed via React Router state.
 *
 * @param {object} props - Component props.
 * @param {function} props.fetchItems - Function from App.jsx to re-fetch all wishlist items.
 */
function EditForm({ fetchItems }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams(); // Get the item ID from the URL parameter

    // Use the item passed in the navigation state for initial load
    const itemToEdit = location.state?.itemToEdit;

    // State for the item details
    const [itemDetails, setItemDetails] = useState({
        item: "",
        quantity: 1,
        urgency: "low",
        orphanage: "",
        _id: id, // Store the ID for the API call
    });

    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 👈 CRITICAL: Load previous details when the component mounts
    useEffect(() => {
        if (itemToEdit) {
            // If data was passed via state, use it immediately
            setItemDetails({
                item: itemToEdit.item,
                quantity: itemToEdit.quantity,
                urgency: itemToEdit.urgency,
                orphanage: itemToEdit.orphanage,
                _id: itemToEdit._id,
            });
            setIsLoading(false);
        } else {
            // Fallback: If no state was passed (e.g., direct link access), fetch by ID
            // NOTE: In a real app, you would fetch this from your backend using the 'id'
            // For this example, we assume we rely on the passed state for simplicity.
            // If you implement a dedicated fetch, setItemDetails here.
            setMessage("Note: Item details were not passed directly. Ensure item exists.");
            setIsLoading(false);
        }
    }, [itemToEdit, id]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setItemDetails((prev) => ({
            ...prev,
            [name]: name === "quantity" ? parseInt(value) || 1 : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        if (!itemDetails.item || itemDetails.quantity <= 0 || !itemDetails.orphanage) {
            setMessage("Error: Please fill all required fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                setMessage("Error: You must be logged in as admin to edit items.");
                setIsSubmitting(false);
                return;
            }

            const token = await user.getIdToken();

            // 👈 CRITICAL: Use PUT method to update the existing resource
            const res = await fetch(`http://localhost:5000/wishlist/${itemDetails._id}`, {
                method: "PUT", // Use PUT for update
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(itemDetails),
            });

            if (res.ok) {
                // Refresh the main list and navigate back to the home view
                await fetchItems(); 
                
                setMessage("Success: Item updated successfully! Redirecting...");
                
                setTimeout(() => navigate("/AdminWishListView"), 1500); // Redirect to admin view after edit

            } else {
                const errorData = await res.json();
                setMessage(`Error: Failed to update item: ${errorData.error || "Please try again."}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("Error: An unexpected network error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-center mt-8 text-xl text-teal-400">Loading item for edit...</p>;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-900 p-6">
            <div className="max-w-xl w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-blue-700">
                <h2 className="text-3xl font-extrabold text-blue-400 mb-6 border-b border-blue-700 pb-2">
                    Edit Wishlist Item
                </h2>
                
                {/* Custom Message Box */}
                {message && (
                    <div 
                        className={`p-3 mb-4 rounded-lg text-sm font-medium ${message.startsWith('Error') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}
                    >
                        {message.replace('Error: ', '').replace('Success: ', '')}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Item Name */}
                    <div>
                        <label className="block mb-2 text-sm text-gray-300" htmlFor="item">
                            Item Name
                        </label>
                        <input
                            // 💡 Change: Added text-white to change the text color
                            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white" 
                            type="text"
                            id="item"
                            name="item"
                            value={itemDetails.item}
                            onChange={handleChange}
                        />
                    </div>
                    
                    {/* Quantity */}
                    <div>
                        <label className="block mb-2 text-sm text-gray-300" htmlFor="quantity">
                            Quantity
                        </label>
                        <input
                            // 💡 Change: Added text-white to change the text color
                            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white" 
                            type="number"
                            id="quantity"
                            name="quantity"
                            min="1"
                            value={itemDetails.quantity}
                            onChange={handleChange}
                        />
                    </div>
                    
                    {/* Urgency */}
                    <div>
                        <label className="block mb-2 text-sm text-gray-300" htmlFor="urgency">
                            Urgency
                        </label>
                        <select
                            id="urgency"
                            name="urgency"
                            value={itemDetails.urgency}
                            onChange={handleChange}
                            // 💡 Change: Added text-white to change the text color
                            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    
                    {/* Orphanage Name */}
                    <div>
                        <label className="block mb-2 text-sm text-gray-300" htmlFor="orphanage">
                            Orphanage Name
                        </label>
                        <input
                            // 💡 Change: Added text-white to change the text color
                            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                            type="text"
                            id="orphanage"
                            name="orphanage"
                            value={itemDetails.orphanage}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-2 mt-4 font-semibold rounded-lg shadow-md transition ${
                            isSubmitting 
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white'
                        }`}
                    >
                        {isSubmitting ? "Updating..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}
export default EditForm;