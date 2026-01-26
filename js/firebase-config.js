// ✅ 1. 앱 실행(App)과 데이터베이스(Firestore) 기능을 가져옵니다.
// (안정적인 실행을 위해 버전은 10.7.1로 맞췄습니다)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs, addDoc, deleteDoc, orderBy, limit, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ 2. 보내주신 'dama-ec569' 프로젝트의 키값입니다.
const firebaseConfig = {
  apiKey: "AIzaSyDvT-74P4tT1q50HSrQaND_4U6wd8k1D-E",
  authDomain: "dama-ec569.firebaseapp.com",
  projectId: "dama-ec569",
  storageBucket: "dama-ec569.firebasestorage.app",
  messagingSenderId: "328651666527",
  appId: "1:328651666527:web:4cccf725a6ef061e2b97ea",
  measurementId: "G-XMVX5EZ1SL"
};

// ✅ 3. Firebase 실행 및 데이터베이스 연결
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ 4. 다른 파일들(pet.js, auth.js 등)에서 쓸 수 있도록 내보내줍니다.
export { db, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs, addDoc, deleteDoc, orderBy, limit, arrayUnion, arrayRemove };
