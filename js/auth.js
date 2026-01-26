import { db, doc, getDoc, setDoc } from './firebase-config.js';

// URL에서 id 파라미터 가져오기 (?id=학생1)
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

export const currentUser = {
    id: userId,
    data: null
};

export async function initAuth() {
    // ID가 없으면 임시 게스트 아이디 부여 (테스트용)
    if (!currentUser.id) {
        currentUser.id = "GUEST_" + Math.floor(Math.random() * 1000);
        console.log("임시 ID 부여됨:", currentUser.id);
    }

    const userRef = doc(db, "users", currentUser.id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        currentUser.data = userSnap.data();
    } else {
        // 신규 유저 생성
        const newUser = {
            id: currentUser.id,
            nickname: `모험가_${currentUser.id}`,
            coins: 0,
            pet: {
                level: 1,
                exp: 0,
                characterId: 'egg', // 초기 캐릭터
                hunger: 100,
                cleanliness: 100,
                fun: 100
            }
        };
        await setDoc(userRef, newUser);
        currentUser.data = newUser;
    }

    // UI 업데이트
    document.getElementById('user-nickname').innerText = currentUser.data.nickname;
    document.getElementById('user-coins').innerText = currentUser.data.coins;

    return true;
}
