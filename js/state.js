import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, userId } from "./config.js";
import { updatePetUI } from "./pet.js"; // 순환 참조 주의 (동작은 함)

export let user = null;

// 사용자 정보 불러오기
export async function loadUser() {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const today = new Date().toDateString();

    if (snap.exists()) {
        user = snap.data();
        
        // 데이터 누락 방지 (구버전 호환성)
        if (!user.nickname && user.nick) user.nickname = user.nick;
        if (!user.log) user.log = {};
        if (!user.inventory) user.inventory = [];
        if (!user.tutorial) user.tutorial = { nameSet: false, goalSet: false };
        if (!user.pet.goal) user.pet.goal = "";

        // 날짜가 바뀌었으면 일일 미션 초기화
        if (user.lastLogin !== today) {
            user.log['d_pic'] = { done: false, claimed: false }; // 사진 미션
            user.log['d_like'] = { count: 0, done: false, claimed: false }; // 좋아요 미션
            user.lastLogin = today;
            await saveUser();
        }
    } else {
        // ★ 신규 유저 생성 (코인 0원 시작) ★
        user = {
            nickname: "모험가_" + userId.substring(0, 4),
            coins: 0, 
            pet: { 
                id: 'egg_01', 
                name: '알', 
                type: 'normal', 
                goal: '', 
                hunger: 50, cleanliness: 50, fun: 50, 
                lv: 1, exp: 0, stage: 0 // 0:알, 1:유년, 2:성장, 3:성체
            },
            inventory: [], // 아이템 보관함
            tutorial: { nameSet: false, goalSet: false }, // 튜토리얼 진행상황
            log: {},
            lastLogin: today
        };
        await setDoc(userRef, user);
    }
    // 데이터 로드 후 화면 갱신
    // (pet.js가 아직 로드 안 됐을 수도 있어서 try-catch)
    try { updatePetUI(); } catch(e) {}
}

// 사용자 정보 저장하기
export async function saveUser() {
    if (!user) return;
    await updateDoc(doc(db, "users", userId), {
        coins: user.coins,
        pet: user.pet,
        log: user.log,
        nickname: user.nickname,
        inventory: user.inventory,
        tutorial: user.tutorial
    });
    try { updatePetUI(); } catch(e) {}
}
