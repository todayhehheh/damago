// Firebase SDK Configuration
// TODO: 유저분, 여기에 기존 사용하시던 firebaseConfig 내용을 붙여넣어주세요!
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export firestore functions for use in other files
export { db, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs, addDoc, deleteDoc };
