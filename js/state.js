import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, userId } from "./config.js";
import { updatePetUI } from "./pet.js";
import { showToast } from "./utils.js"; // 토스트 메시지 사용 위해 추가

export let user = null;

export async function loadUser() {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const now = Date.now(); // 현재 시간 (밀리초)
    const todayDate = new Date().toDateString(); // 날짜 문자열 (일일 미션용)

    if (snap.exists()) {
        user = snap.data();
        
        // --- [NEW] 시간 경과에 따른 상태 감소 로직 시작 ---
        if (user.lastLoginTime) { // 마지막 접속 기록이 있다면
            const diff = now - user.lastLoginTime; // 흐른 시간 (밀리초)
            const minutes = Math.floor(diff / (1000 * 60)); // 분 단위로 변환

            // 10분마다 5씩 감소 (원하는 대로 조절하세요)
            const decreaseAmount = Math.floor(minutes / 10) * 5;

            if (decreaseAmount > 0) {
                // 감소 적용 (0보다 작아지지는 않게 Math.max 사용)
                user.pet.hunger = Math.max(0, user.pet.hunger - decreaseAmount);
                user.pet.cleanliness = Math.max(0, user.pet.cleanliness - decreaseAmount);
                user.pet.fun = Math.max(0, user.pet.fun - decreaseAmount);

                // 알림 띄우기
                setTimeout(() => {
                    showToast(`시간이 흘러 펫 상태가 ${decreaseAmount}만큼 감소했습니다.`);
                }, 1000); // 화면 로딩 후 1초 뒤에 뜸
            }
        }
        // --- [NEW] 로직 끝 ---

        // 닉네임, 로그 데이터 보정
        if (!user.nickname && user.nick) user.nickname = user.nick;
        if (!user.log) user.log = {};

        // 일일 미션 초기화 (날짜가 바뀌었으면)
        if (user.lastLoginDate !== todayDate) {
            user.log['d_pic'] = { done: false, claimed: false };
            user.log['d_like'] = { count: 0, done: false, claimed: false };
        }
    } else {
        // 신규 유저
        user = {
            nickname: "모험가_" + userId.substring(0, 4),
            coins: 100,
            pet: { hunger: 50, cleanliness: 50, fun: 50, lv: 1, exp: 0 },
            log: {},
            // lastLoginDate: 일일 퀘스트용 (날짜), lastLoginTime: 상태 감소용 (밀리초)
            lastLoginDate: todayDate 
        };
        await setDoc(userRef, user);
    }

    // 접속 시간 갱신 (현재 시간으로 저장)
    user.lastLoginDate = todayDate;
    user.lastLoginTime = now; 
    
    await saveUser(); // 변경된 수치 저장
    updatePetUI(); 
}

export async function saveUser() {
    if (!user) return;
    // 저장할 때 현재 시간도 같이 저장
    user.lastLoginTime = Date.now(); 
    
    await updateDoc(doc(db, "users", userId), {
        coins: user.coins,
        pet: user.pet,
        log: user.log,
        nickname: user.nickname,
        lastLoginDate: user.lastLoginDate,
        lastLoginTime: user.lastLoginTime
    });
    updatePetUI();
}
