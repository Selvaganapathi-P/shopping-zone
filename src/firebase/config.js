// For Firebase JS SDK v7.20.0 and later, measurementId is optional


import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGUyvjg3C2FDfLWzFd7Rm-mmJBY5m17Jg",
  authDomain: "ecommerce-expense-tracker.firebaseapp.com",
  projectId: "ecommerce-expense-tracker",
  storageBucket: "ecommerce-expense-tracker.firebasestorage.app",
  messagingSenderId: "757178334014",
  appId: "1:757178334014:web:f22c23d8ac6011b2a5ca6f",
  measurementId: "G-3257E7LRE3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);