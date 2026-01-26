// Firebase SDK Configuration
// TODO: 유저분, 여기에 기존 사용하시던 firebaseConfig 내용을 붙여넣어주세요!
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvT-74P4tT1q50HSrQaND_4U6wd8k1D-E",
  authDomain: "dama-ec569.firebaseapp.com",
  projectId: "dama-ec569",
  storageBucket: "dama-ec569.firebasestorage.app",
  messagingSenderId: "328651666527",
  appId: "1:328651666527:web:4cccf725a6ef061e2b97ea",
  measurementId: "G-XMVX5EZ1SL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export firestore functions for use in other files
export { db, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs, addDoc, deleteDoc };
