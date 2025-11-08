// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClZ9TtBlwJUEbQ6DX3YIDR1cx3VilgZpk",
  authDomain: "expensetracker-553a0.firebaseapp.com",
  projectId: "expensetracker-553a0",
  storageBucket: "expensetracker-553a0.firebasestorage.app",
  messagingSenderId: "871561534240",
  appId: "1:871561534240:web:773a62037b790e8e749545",
  measurementId: "G-NGVS9J4W06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

export const auth = getAuth(app);
