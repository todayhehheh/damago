import { db, doc, getDoc, setDoc } from './firebase-config.js';

// Get ID from URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

export const currentUser = {
    id: userId,
    data: null
};

// Function to initialize authentication
export async function initAuth() {
    if (!userId) {
        alert("태그를 통해 접속해주세요! (?id=태그번호)");
        document.body.innerHTML = "<div style='display:flex;justify-content:center;align-items:center;height:100vh;'><h1>NFC 태그로 접속해주세요!</h1></div>";
        return false;
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        console.log("Existing user found:", userSnap.data());
        currentUser.data = userSnap.data();
    } else {
        console.log("New user! Creating profile...");
        const newUserData = {
            id: userId,
            nickname: `모험가_${userId.substring(0, 4)}`,
            coins: 100,
            pet: {
                hunger: 100, // 0~100
                cleanliness: 100,
                fun: 100,
                exp: 0,
                level: 1,
                lastLogin: new Date().toISOString()
            },
            joinDate: new Date().toISOString()
        };
        await setDoc(userRef, newUserData);
        currentUser.data = newUserData;
    }

    return true;
}

export function updateUserLocal(newData) {
    currentUser.data = { ...currentUser.data, ...newData };
}
