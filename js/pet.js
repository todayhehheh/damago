import { user, saveUser } from "./state.js";
import { showToast, setPetSpeech } from "./utils.js";

// 펫 행동 처리
export async function handleAction(type) {
    if (!user) return;

    // 거절 멘트 (100 이상일 때)
    if (type === 'feed' && user.pet.hunger >= 100) return setPetSpeech("배불러요! 그만 먹을래!");
    if (type === 'clean' && user.pet.cleanliness >= 100) return setPetSpeech("이미 반짝반짝해요!");
    if (type === 'play' && user.pet.fun >= 100) return setPetSpeech("지쳤어요! 쉴래요.");

    if (user.coins < 10) return showToast("코인이 부족해요! (10원 필요)");

    // 실행
    user.coins -= 10;
    addExp(5);

    if (type === 'feed') { user.pet.hunger = Math.min(100, user.pet.hunger + 20); setPetSpeech("냠냠! 맛있어요!"); }
    if (type === 'clean') { user.pet.cleanliness = Math.min(100, user.pet.cleanliness + 20); setPetSpeech("개운해요!"); }
    if (type === 'play') { user.pet.fun = Math.min(100, user.pet.fun + 20); setPetSpeech("신난다!"); }

    updatePetImage(type); // 임시 이미지 변경
    await saveUser();
}

// 경험치 증가
function addExp(n) {
    user.pet.exp += n;
    if (user.pet.exp >= 100) {
        user.pet.exp = 0;
        user.pet.lv++;
        showToast(`🎉 축하합니다! 레벨 ${user.pet.lv} 달성!`);
    }
}

// 펫 UI 업데이트 (이미지, 게이지 등)
export function updatePetUI() {
    if (!user) return;
    document.getElementById('user-nickname').innerText = user.nickname;
    document.getElementById('user-coins').innerText = user.coins;
    document.getElementById('bar-hunger').style.width = user.pet.hunger + "%";
    document.getElementById('bar-clean').style.width = user.pet.cleanliness + "%";
    document.getElementById('bar-fun').style.width = user.pet.fun + "%";
    document.getElementById('level-badge').innerText = `Lv.${user.pet.lv}`;
    document.getElementById('exp-bar').style.width = user.pet.exp + "%";

    // 기본 이미지 복구
    const img = document.getElementById('pet-img');
    const lv = user.pet.lv;
    // 경로 주의: html 파일 기준 images 폴더
    if (!img.src.includes('eat') && !img.src.includes('bath') && !img.src.includes('play')) {
        img.src = lv === 1 ? "images/pet_lv1.png" : (lv === 2 ? "images/pet_lv2.png" : "images/pet_lv3.png");
    }
}

// 행동 시 일시적 이미지 변경
function updatePetImage(type) {
    const img = document.getElementById('pet-img');
    if (type === 'feed') img.src = "images/pet_eat.png";
    if (type === 'clean') img.src = "images/pet_bath.png";
    if (type === 'play') img.src = "images/pet_play.png";

    // 2초 뒤 원상복구
    setTimeout(() => {
        const lv = user.pet.lv;
        img.src = lv === 1 ? "images/pet_lv1.png" : (lv === 2 ? "images/pet_lv2.png" : "images/pet_lv3.png");
        setPetSpeech("심심해~ 놀아줘!");
    }, 2000);
}