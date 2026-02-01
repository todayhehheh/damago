import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, userId } from "./config.js";
import { updatePetUI } from "./pet.js"; 

export let user = null;

export async function loadUser() {
    try {
        const userRef = doc(db, "users", userId);
        const snap = await getDoc(userRef);
        const today = new Date().toDateString();

        if (snap.exists()) {
            user = snap.data();
            // 데이터 보정
            if (!user.nickname && user.nick) user.nickname = user.nick;
            if (!user.log) user.log = {};
            if (!user.inventory) user.inventory = [];
            if (!user.pet.goal) user.pet.goal = "";
            if (!user.tutorial) user.tutorial = { done: false, nameSet: false, goalSet: false };

            if (user.lastLogin !== today) {
                user.log['d_pic'] = { done: false, claimed: false };
                user.log['d_like'] = { count: 0, done: false, claimed: false };
                user.lastLogin = today;
                await saveUser();
            }
        } else {
            // 신규 유저
            user = {
                nickname: "모험가",
                coins: 0, 
                pet: { 
                    id: 'egg_01', name: '알', type: 'normal', goal: '', 
                    hunger: 50, cleanliness: 50, fun: 50, lv: 1, exp: 0, stage: 0 
                },
                inventory: [],
                tutorial: { done: false, nameSet: false, goalSet: false },
                log: {},
                lastLogin: today
            };
            await setDoc(userRef, user);
        }
        
        // ★ 화면 전환 로직 (로딩 끝!)
        document.getElementById('loading-screen').style.display = 'none'; // 로딩창 끄기
        
        if (!user.tutorial.done) {
            document.getElementById('tutorial-screen').style.display = 'flex'; // 튜토리얼 켜기
            document.getElementById('app-container').style.display = 'none';
        } else {
            document.getElementById('tutorial-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex'; // 앱 켜기
            try { updatePetUI(); } catch(e) { console.error(e); }
        }

    } catch (error) {
        console.error("Load Error:", error);
        alert("데이터 로딩 실패: " + error.message);
        document.getElementById('loading-screen').style.display = 'none'; // 에러나도 로딩창은 끈다
    }
}

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
