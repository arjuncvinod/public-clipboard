// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyAP27AZB6V5MJcYowDX1ekGE8OogPJIPNk",
  authDomain: "clipboard-b81e3.firebaseapp.com",
  projectId: "clipboard-b81e3",
  storageBucket: "clipboard-b81e3.appspot.com", // Ensure storageBucket is correctly specified
  messagingSenderId: "844745792459",
  appId: "1:844745792459:web:7b693877fe287e1056f44e"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp); // Initialize Firebase Storage

export { db, storage }; // Export storage for file uploads
