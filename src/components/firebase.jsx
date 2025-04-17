// firebase.jsx
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // 🔥 Import getFirestore

const VITE_FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

// Firebase config object (replace with your own Firebase config)
const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: "mirrormind-5b9ff.firebaseapp.com",
  projectId: "mirrormind-5b9ff",
  storageBucket: "mirrormind-5b9ff.firebasestorage.app",
  messagingSenderId: "879134637495",
  appId: "1:879134637495:web:dc79304994a12e2e1f7c32",
   measurementId: "G-V5YD529P1C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get the Firebase auth instance
const provider = new GoogleAuthProvider(); // Set up the Google provider

// Export the necessary functions
export { auth, provider, signInWithPopup };

export const db = getFirestore(app);
