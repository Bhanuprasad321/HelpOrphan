// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc_LFYrKiEbq0ZI2EEqI700ednsD8iwvE",
  authDomain: "orphanage-wishlist.firebaseapp.com",
  projectId: "orphanage-wishlist",
  storageBucket: "orphanage-wishlist.firebasestorage.app",
  messagingSenderId: "734500608488",
  appId: "1:734500608488:web:dd9a353eccce096327ac5d",
  measurementId: "G-XNN53V7D89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize services
export const auth = getAuth(app);  // <-- export auth
const analytics = getAnalytics(app);
