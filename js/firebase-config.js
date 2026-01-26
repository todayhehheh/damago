// [수정됨] 브라우저에서 바로 돌아가는 CDN 방식입니다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    // ⚠️ 주의: GitHub 경고 메일을 받으셨다면 이 키는 이미 정지되었을 확률이 99%입니다.
    // 새 프로젝트를 만들어서 받은 '새 키'를 여기에 넣어야 확실하게 작동합니다.
    apiKey: "AIzaSyDi5sKSc7I5gOari3jeK0gfoKCmRxTYSfY", 
    authDomain: "damago-f95d8.firebaseapp.com",
    projectId: "damago-f95d8",
    storageBucket: "damago-f95d8.firebasestorage.app",
    messagingSenderId: "281460158600",
    appId: "1:281460158600:web:127fafefd9a62ffb282f3d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export
export { db, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs, addDoc, deleteDoc };
