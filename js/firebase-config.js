// [중요] 사용자의 Firebase 키값을 여기에 붙여넣으세요.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, getDocs, query, orderBy, limit, onSnapshot, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, getDocs, query, orderBy, limit, onSnapshot, arrayUnion, arrayRemove };
