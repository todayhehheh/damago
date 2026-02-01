import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, userId } from "./config.js";
import { updatePetUI } from "./pet.js";

export let user = null;

export async function loadUser() {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const today = new Date().toDateString();

    if (snap.exists()) {
        user = snap.data();
        if (!user.nickname && user.nick) user.nickname = user.nick;
        if (!user.log) user.log = {};
        
        // ★ [NEW] 인벤토리 & 목표 초기화
        if (!user.inventory) user.inventory = []; 
        if (!user.pet.goal) user.pet.goal = "오늘의 목표를 설정해주세요!";
        if (user.pet.stage === undefined) user.pet.stage = 0; // 0:알

        // 날짜 바뀌면 일일 미션 초기화
        if (user.lastLogin !== today) {
            user.log['d_pic'] = { done: false, claimed: false };
            user.log['d_like'] = { count: 0, done: false, claimed: false };
            user.lastLogin = today;
            await saveUser();
        }
    } else {
        // 신규 유저
        user = {
            nickname: "모험가_" + userId.substring(0, 4),
            coins: 100,
            pet: { 
                id: 'egg_01', 
                name: '알', 
                type: 'normal', 
                goal: '', // 유저 목표
                hunger: 50, cleanliness: 50, fun: 50, lv: 1, exp: 0, stage: 0 
            },
            inventory: [], // 아이템(진화의 돌 등)
            log: {},
            lastLogin: today
        };
        await setDoc(userRef, user);
    }
    updatePetUI();
}

export async function saveUser() {
    if (!user) return;
    await updateDoc(doc(db, "users", userId), {
        coins: user.coins,
        pet: user.pet,
        log: user.log,
        nickname: user.nickname,
        inventory: user.inventory
    });
    updatePetUI();
}
