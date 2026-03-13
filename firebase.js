// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBMdaglKn1QSbS4boIz2DLZwhr0_ApYqEk",
  authDomain: "multirising-exports.firebaseapp.com",
  projectId: "multirising-exports",
   storageBucket: "multirising-exports.appspot.com",
  messagingSenderId: "914118764504",
  appId: "1:914118764504:web:41a9f2b53e5957cf0f34ad",
  measurementId: "G-7XBMFYP3G9"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); 