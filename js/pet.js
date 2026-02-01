import { user, saveUser } from "./state.js";
import { showToast, setPetSpeech, showRewardPopup, showInputModal } from "./utils.js";

const PET_DATA = {
    'fire': { 1: 'images/pet_fire_1.png', 2: 'images/pet_fire_2.png', 3: 'images/pet_fire_3.png', mission: '운동장 3바퀴 뛰기' },
    'water': { 1: 'images/pet_water_1.png', 2: 'images/pet_water_2.png', 3: 'images/pet_water_3.png', mission: '물 1L 마시기' },
    'grass': { 1: 'images/pet_grass_1.png', 2: 'images/pet_grass_2.png', 3: 'images/pet_grass_3.png', mission: '채소 반찬 먹기' }
};

// 1. 알 뽑기
export async function buyEgg() {
    // 펫이 이미 있으면 안 됨
    if (user.pet.stage > 0) return showToast("이미 펫을 키우고 있습니다!");
    if (user.coins < 30) return showToast("코인이 부족해요 (30G)");

    // ★ 목표 입력 (커스텀 모달)
    const goal = await showInputModal("목표 정하기", "이번 펫과 함께 지킬 목표는 무엇인가요?");
    if (!goal) return;

    user.coins -= 30;
    
    const types = ['fire', 'water', 'grass'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    user.pet = {
        ...user.pet,
        id: `pet_${randomType}`,
        type: randomType,
        goal: goal,
        stage: 0, lv: 1, exp: 0,
        hunger: 50, cleanliness: 50, fun: 50
    };

    setPetSpeech("알이 생겼어요!");
    showRewardPopup(0, `알 획득! (${randomType.toUpperCase()} 속성)`);
    await saveUser();
}

// 2. 진화의 돌 구매
export async function buyStone() {
    if (user.inventory.includes('evo_stone')) return showToast("이미 가지고 있습니다.");
    if (user.coins < 200) return showToast("코인이 부족해요 (200G)");
    
    if(confirm("200코인으로 [진화의 돌]을 구매하시겠습니까?")) {
        user.coins -= 200;
        user.inventory.push('evo_stone');
        showRewardPopup(0, "✨ 진화의 돌 획득!");
        await saveUser();
        tryEvolve();
    }
}

// 3. 행동
export async function handleAction(type) {
    if (!user) return;
    if (user.pet.stage === 0) return showToast("알은 아직 아무것도 할 수 없어요! (레벨 5에 부화)");
    if (type === 'feed' && user.pet.hunger >= 100) return setPetSpeech("배불러요!");
    if (user.coins < 10) return showToast("코인이 부족해요! (10G)");

    user.coins -= 10;
    user.pet.exp += 10; 
    if (user.pet.exp >= 100) {
        user.pet.exp = 0; user.pet.lv++;
        showToast(`🎉 레벨 ${user.pet.lv} 달성!`);
        tryEvolve();
    }

    if (type === 'feed') user.pet.hunger = Math.min(100, user.pet.hunger + 20);
    if (type === 'clean') user.pet.cleanliness = Math.min(100, user.pet.cleanliness + 20);
    if (type === 'play') user.pet.fun = Math.min(100, user.pet.fun + 20);

    updatePetUI();
    await saveUser();
}

// 4. 진화
async function tryEvolve() {
    const stage = user.pet.stage;
    const lv = user.pet.lv;
    const type = user.pet.type;

    if (stage === 0 && lv >= 5) {
        user.pet.stage = 1;
        showRewardPopup(0, `🐣 알이 부화했습니다!`);
    } else if (stage === 1 && lv >= 10) {
        if (user.inventory.includes('evo_stone')) {
            user.pet.stage = 2;
            const idx = user.inventory.indexOf('evo_stone');
            user.inventory.splice(idx, 1);
            showRewardPopup(0, `✨ 2단계로 진화했습니다!`);
        } else {
            setPetSpeech("진화하고 싶어...");
        }
    } else if (stage === 2 && lv >= 20) {
        const missionId = `main_${type}`;
        if (user.log[missionId] && user.log[missionId].done) {
            user.pet.stage = 3;
            showRewardPopup(0, `👑 전설의 펫으로 성장했습니다!`);
        } else {
            setPetSpeech("메인 미션을 깨야 해!");
        }
    }
    await saveUser();
}

// 5. UI 업데이트 (상점 버튼 제어 포함)
export function updatePetUI() {
    if (!user) return;
    document.getElementById('user-nickname').innerText = user.nickname;
    document.getElementById('user-coins').innerText = user.coins;
    
    document.getElementById('bar-hunger').style.width = user.pet.hunger + "%";
    document.getElementById('bar-clean').style.width = user.pet.cleanliness + "%";
    document.getElementById('bar-fun').style.width = user.pet.fun + "%";
    document.getElementById('level-badge').innerText = `Lv.${user.pet.lv}`;
    document.getElementById('exp-bar').style.width = user.pet.exp + "%";

    const img = document.getElementById('pet-img');
    const stage = user.pet.stage;
    const type = user.pet.type;
    
    if (stage === 0) img.src = "images/pet_egg.png";
    else if (PET_DATA[type] && PET_DATA[type][stage]) img.src = PET_DATA[type][stage];
    else img.src = "images/pet_lv1.png";

    // ★ [NEW] 상점 버튼 표시 조건
    const btnEgg = document.getElementById('btn-buy-egg');
    const btnStone = document.getElementById('btn-buy-stone');

    // 1. 알 구매 버튼: 펫이 없거나(stage0) 알 상태일 때만
    if (stage === 0 && user.pet.id === 'egg_01') { 
        // 초기 알(egg_01) 상태라면 구매 버튼 표시 (알을 아직 안 뽑은 상태)
         btnEgg.style.display = 'block';
    } else if (stage === 0 && user.pet.id.startsWith('pet_')) {
        // 이미 알을 뽑았으면 숨김
        btnEgg.style.display = 'none';
    } else {
        btnEgg.style.display = 'none';
    }

    // 2. 진화석 버튼: 1단계이고 레벨 10 이상일 때
    if (stage === 1 && user.pet.lv >= 10) {
        btnStone.style.display = 'block';
    } else {
        btnStone.style.display = 'none';
    }
}
