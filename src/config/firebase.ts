import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBkxRFG8qLm3QrbUgPb_QLEC3pJYW3nfx0",
    authDomain: "arkan-8bd63.firebaseapp.com",
    projectId: "arkan-8bd63",
    storageBucket: "arkan-8bd63.firebasestorage.app",
    messagingSenderId: "1097406159096",
    appId: "1:1097406159096:web:3f6ab094d52e73942ac30d",
    measurementId: "G-VH77WMGF6Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Auth and Firestore instances for use in the app
export const auth = getAuth(app);
export const db = getFirestore(app);