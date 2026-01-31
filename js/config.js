import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ★ 본인의 Firebase 키를 여기에 넣으세요 ★
const firebaseConfig = {
  apiKey: "AIzaSyDvT-74P4tT1q50HSrQaND_4U6wd8k1D-E",
  authDomain: "dama-ec569.firebaseapp.com",
  projectId: "dama-ec569",
  storageBucket: "dama-ec569.firebasestorage.app",
  messagingSenderId: "328651666527",
  appId: "1:328651666527:web:4cccf725a6ef061e2b97ea",
  measurementId: "G-XMVX5EZ1SL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const userId = new URLSearchParams(window.location.search).get('id') || "test_user";