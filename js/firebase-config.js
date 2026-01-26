// 아까 주신 키값을 그대로 넣었습니다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, getDocs, query, orderBy, limit, onSnapshot, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDi5sKSc7I5gOari3jeK0gfoKCmRxTYSfY",
  authDomain: "damago-f95d8.firebaseapp.com",
  projectId: "damago-f95d8",
  storageBucket: "damago-f95d8.firebasestorage.app",
  messagingSenderId: "281460158600",
  appId: "1:281460158600:web:4962162c9f956a05282f3d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, getDocs, query, orderBy, limit, onSnapshot, arrayUnion, arrayRemove };
