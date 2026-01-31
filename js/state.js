import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, userId } from "./config.js";
import { updatePetUI } from "./pet.js";

export let user = null;

// 사용자 정보 불러오기
export async function loadUser() {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const today = new Date().toDateString();

    if (snap.exists()) {
        user = snap.data();
        // 닉네임 통일 (nick -> nickname)
        if (!user.nickname && user.nick) user.nickname = user.nick;
        if (!user.log) user.log = {};

        // 날짜 바뀌면 일일 미션 초기화
        if (user.lastLogin !== today) {
            user.log['d_pic'] = { done: false, claimed: false };
            user.log['d_like'] = { count: 0, done: false, claimed: false };
            user.lastLogin = today;
            await saveUser();
        }
    } else {
        // 신규 유저 생성
        user = {
            nickname: "모험가_" + userId.substring(0, 4),
            coins: 100,
            pet: { hunger: 50, cleanliness: 50, fun: 50, lv: 1, exp: 0 },
            log: {},
            lastLogin: today
        };
        await setDoc(userRef, user);
    }
    updatePetUI(); // 화면 갱신
}

// 사용자 정보 저장하기
export async function saveUser() {
    if (!user) return;
    await updateDoc(doc(db, "users", userId), {
        coins: user.coins,
        pet: user.pet,
        log: user.log,
        nickname: user.nickname
    });
    updatePetUI(); // 저장 후 화면 갱신
}