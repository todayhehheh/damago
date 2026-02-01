import { user, saveUser } from "./state.js";
import { showToast, setPetSpeech, showRewardPopup } from "./utils.js";

// 펫 이미지 데이터 (속성별 성장 이미지)
const PET_DATA = {
    'fire': { 1: 'images/pet_fire_1.png', 2: 'images/pet_fire_2.png', 3: 'images/pet_fire_3.png', mission: '운동장 3바퀴 뛰기' },
    'water': { 1: 'images/pet_water_1.png', 2: 'images/pet_water_2.png', 3: 'images/pet_water_3.png', mission: '물 1L 마시기' },
    'grass': { 1: 'images/pet_grass_1.png', 2: 'images/pet_grass_2.png', 3: 'images/pet_grass_3.png', mission: '채소 반찬 먹기' }
};

// 1. 알 뽑기 (가격 30G)
export async function buyEgg() {
    if (user.pet.stage > 0) return showToast("이미 펫을 키우고 있습니다!");
    
    // ★ 튜토리얼 체크: 목표 설정을 안 했으면 알 구매 불가
    if (!user.pet.goal) return showToast("먼저 [목표 정하기] 버튼을 눌러주세요!");
    
    // 코인 체크 (30G)
    if (user.coins < 30) return showToast("코인이 부족해요 (30G 필요)\n튜토리얼을 완료해 코인을 모으세요!");

    user.coins -= 30;
    
    // 랜덤 속성 부여
    const types = ['fire', 'water', 'grass'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    user.pet = {
        ...user.pet,
        id: `pet_${randomType}`,
        type: randomType,
        stage: 0, 
        lv: 1, exp: 0,
        hunger: 50, cleanliness: 50, fun: 50
    };

    setPetSpeech("알이 생겼어요!");
    // ★ 알 획득 축하 팝업
    showRewardPopup(0, `알 획득! (${randomType.toUpperCase()} 속성)`);
    await saveUser();
}

// 2. 진화의 돌 구매 (200G)
export async function buyStone() {
    if (user.inventory.includes('evo_stone')) return showToast("이미 가지고 있습니다.");
    if (user.coins < 200) return showToast("코인이 부족해요 (200G)");
    
    if(confirm("200코인으로 [진화의 돌]을 구매하시겠습니까?")) {
        user.coins -= 200;
        user.inventory.push('evo_stone');
        
        showRewardPopup(0, "✨ 진화의 돌 획득!");
        await saveUser();
        tryEvolve(); // 혹시 바로 진화 가능한지 체크
    }
}

// 3. 행동 (밥주기, 씻기기, 놀기)
export async function handleAction(type) {
    if (!user) return;
    if (user.pet.stage === 0) return showToast("알은 아직 아무것도 할 수 없어요! (레벨 5에 부화)");

    if (type === 'feed' && user.pet.hunger >= 100) return setPetSpeech("배불러요!");
    if (user.coins < 10) return showToast("코인이 부족해요! (10G)");

    user.coins -= 10;
    
    // 경험치 증가
    user.pet.exp += 10; 
    if (user.pet.exp >= 100) {
        user.pet.exp = 0; user.pet.lv++;
        showToast(`🎉 레벨 ${user.pet.lv} 달성!`);
        tryEvolve(); // 레벨업 시 진화 시도
    }

    if (type === 'feed') user.pet.hunger = Math.min(100, user.pet.hunger + 20);
    if (type === 'clean') user.pet.cleanliness = Math.min(100, user.pet.cleanliness + 20);
    if (type === 'play') user.pet.fun = Math.min(100, user.pet.fun + 20);

    updatePetUI();
    await saveUser();
}

// 4. 진화 로직 (단계별 조건)
async function tryEvolve() {
    const stage = user.pet.stage;
    const lv = user.pet.lv;
    const type = user.pet.type;

    // [0 -> 1] 부화 (레벨 5)
    if (stage === 0 && lv >= 5) {
        user.pet.stage = 1;
        showRewardPopup(0, `🐣 알이 부화했습니다!`);
    } 
    // [1 -> 2] 성장 (레벨 10 + 돌 필요)
    else if (stage === 1 && lv >= 10) {
        if (user.inventory.includes('evo_stone')) {
            user.pet.stage = 2;
            const idx = user.inventory.indexOf('evo_stone');
            user.inventory.splice(idx, 1); // 돌 소모
            showRewardPopup(0, `✨ 2단계로 진화했습니다!`);
        } else {
            setPetSpeech("진화하고 싶어... (돌 필요)");
        }
    } 
    // [2 -> 3] 최종 진화 (레벨 20 + 메인 미션)
    else if (stage === 2 && lv >= 20) {
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

// 5. 경험치 추가 (외부 호출용)
export function addExp(n) {
    user.pet.exp += n;
    if (user.pet.exp >= 100) {
        user.pet.exp = 0; user.pet.lv++;
        showToast(`🎉 레벨 ${user.pet.lv} 달성!`);
        tryEvolve();
    }
}

// 6. UI 업데이트 (이미지 및 튜토리얼 버튼)
export function updatePetUI() {
    if (!user) return;
    document.getElementById('user-nickname').innerText = user.nickname;
    document.getElementById('user-coins').innerText = user.coins;
    
    // 게이지
    document.getElementById('bar-hunger').style.width = user.pet.hunger + "%";
    document.getElementById('bar-clean').style.width = user.pet.cleanliness + "%";
    document.getElementById('bar-fun').style.width = user.pet.fun + "%";
    document.getElementById('level-badge').innerText = `Lv.${user.pet.lv}`;
    document.getElementById('exp-bar').style.width = user.pet.exp + "%";

    // 이미지
    const img = document.getElementById('pet-img');
    const stage = user.pet.stage;
    const type = user.pet.type;
    
    if (stage === 0) img.src = "images/pet_egg.png";
    else if (PET_DATA[type] && PET_DATA[type][stage]) img.src = PET_DATA[type][stage];
    else img.src = "images/pet_lv1.png"; // 기본값

    // ★ 튜토리얼 버튼 상태 업데이트 (완료되면 회색 처리 + 체크아이콘)
    const btnName = document.getElementById('btn-set-name');
    const btnGoal = document.getElementById('btn-set-goal');
    
    if (user.tutorial.nameSet) {
        btnName.classList.add('done');
        btnName.style.background = "#eee";
        btnName.style.color = "#999";
        btnName.style.border = "1px solid #ccc";
        btnName.onclick = null;
        btnName.innerHTML = `<i class="fas fa-check"></i> 닉네임 설정 완료`;
    }
    
    if (user.tutorial.goalSet) {
        btnGoal.classList.add('done');
        btnGoal.style.background = "#eee";
        btnGoal.style.color = "#999";
        btnGoal.style.border = "1px solid #ccc";
        btnGoal.onclick = null;
        btnGoal.innerHTML = `<i class="fas fa-check"></i> 목표 설정 완료`;
    }
}
