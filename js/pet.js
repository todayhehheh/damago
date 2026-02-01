import { user, saveUser } from "./state.js";
import { showToast, setPetSpeech } from "./utils.js";

// 펫 데이터 (이미지 매핑)
const PET_DATA = {
    'fire': { 1: 'pet_fire_1.png', 2: 'pet_fire_2.png', 3: 'pet_fire_3.png', mission: '운동장 3바퀴 뛰기' },
    'water': { 1: 'pet_water_1.png', 2: 'pet_water_2.png', 3: 'pet_water_3.png', mission: '도서관 책 1권 읽기' },
    'grass': { 1: 'pet_grass_1.png', 2: 'pet_grass_2.png', 3: 'pet_grass_3.png', mission: '친구 칭찬하기' }
};

// 1. 알 뽑기 (목표 입력 받기)
export async function buyEgg() {
    if (user.pet.stage > 0) return showToast("이미 펫을 키우고 있습니다!");
    if (user.coins < 100) return showToast("코인이 부족해요 (100G)");

    // ★ 목표 입력 받기
    const goal = prompt("이 알을 키우면서 지킬 [나만의 목표]를 적어주세요!\n(예: 매일 물 1L 마시기)");
    if (!goal || goal.trim() === "") return;

    user.coins -= 100;
    
    // 랜덤 속성 부여
    const types = ['fire', 'water', 'grass'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    user.pet = {
        ...user.pet,
        id: `pet_${randomType}`,
        type: randomType,
        goal: goal, // 목표 저장
        stage: 0, // 알
        lv: 1, exp: 0,
        hunger: 50, cleanliness: 50, fun: 50
    };

    setPetSpeech("알이 꼼지락거려요!");
    showToast(`알 획득! 목표: ${goal}`);
    await saveUser();
}

// 2. 레벨업 및 진화 체크
export function checkLevelUp() {
    if (user.pet.exp >= 100) {
        user.pet.exp = 0;
        user.pet.lv++;
        showToast(`🎉 레벨 ${user.pet.lv} 달성!`);
        
        // 단계별 진화 시도
        tryEvolve();
    }
}

// 3. 진화 로직 (조건 체크)
async function tryEvolve() {
    const stage = user.pet.stage;
    const lv = user.pet.lv;
    const type = user.pet.type;

    // [0단계 -> 1단계] 부화 (레벨 5 달성 시 자동)
    if (stage === 0 && lv >= 5) {
        user.pet.stage = 1;
        alert(`🐣 알이 부화했습니다! 귀여운 ${type} 펫이 태어났어요!`);
    }
    // [1단계 -> 2단계] 진화 (레벨 10 + 진화의 돌 필요)
    else if (stage === 1 && lv >= 10) {
        if (user.inventory.includes('evo_stone')) {
            user.pet.stage = 2;
            // 돌 사용 (삭제)
            const idx = user.inventory.indexOf('evo_stone');
            user.inventory.splice(idx, 1);
            alert(`✨ 진화의 돌이 빛납니다! 2단계로 진화했습니다!`);
        } else {
            setPetSpeech("진화하고 싶어... (진화의 돌 필요)");
            showToast("Tip: 진화하려면 '진화의 돌'이 필요합니다!");
        }
    }
    // [2단계 -> 3단계] 최종 진화 (레벨 20 + 메인 미션 완료 필요)
    else if (stage === 2 && lv >= 20) {
        // 메인 미션 완료 여부 체크 (questLog에 기록됨)
        const missionId = `main_${type}`; // 예: main_fire
        if (user.log[missionId] && user.log[missionId].done) {
            user.pet.stage = 3;
            alert(`👑 전설의 펫으로 성장했습니다! 축하합니다!`);
        } else {
            const missionName = PET_DATA[type].mission;
            setPetSpeech(`"${missionName}" 미션을 깨야 해!`);
            showToast(`조건 부족: 메인 미션 [${missionName}] 완료 필요`);
        }
    }
    await saveUser();
}

// 4. UI 업데이트
export function updatePetUI() {
    if (!user) return;
    
    // ... 기존 텍스트/게이지 업데이트 코드 ...
    document.getElementById('user-nickname').innerText = user.nickname;
    document.getElementById('user-coins').innerText = user.coins;
    // ... 생략 ...

    // 이미지 결정
    const img = document.getElementById('pet-img');
    const stage = user.pet.stage;
    const type = user.pet.type;

    if (stage === 0) img.src = "images/pet_egg.png";
    else img.src = PET_DATA[type][stage] || `images/pet_${type}_1.png`;
}

// ... handleAction 등 나머지 코드는 유지 ...
