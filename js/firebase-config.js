import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, getDocs, query, orderBy, limit, onSnapshot, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 방금 주신 설정값으로 적용했습니다.
const firebaseConfig = {
  apiKey: "AIzaSyDi5sKSc7I5gOari3jeK0gfoKCmRxTYSfY",
  authDomain: "damago-f95d8.firebaseapp.com",
  projectId: "damago-f95d8",
  storageBucket: "damago-f95d8.firebasestorage.app",
  messagingSenderId: "281460158600",
  appId: "1:281460158600:web:127fafefd9a62ffb282f3d"
};

// Firebase 실행
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 다른 파일에서 쓸 수 있도록 내보내기
export { db, collection, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, getDocs, query, orderBy, limit, onSnapshot, arrayUnion, arrayRemove };
