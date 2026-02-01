import { user, saveUser } from "./state.js";
import { showToast, setPetSpeech } from "./utils.js";

// 펫 이미지 데이터 (반드시 images 폴더에 해당 파일들이 있어야 합니다)
const PET_DATA = {
    'fire': { 1: 'pet_fire_1.png', 2: 'pet_fire_2.png', 3: 'pet_fire_3.png', mission: '운동장 3바퀴 뛰기' },
    'water': { 1: 'pet_water_1.png', 2: 'pet_water_2.png', 3: 'pet_water_3.png', mission: '물 1L 마시기' },
    'grass': { 1: 'pet_grass_1.png', 2: 'pet_grass_2.png', 3: 'pet_grass_3.png', mission: '채소 반찬 먹기' }
};

// 1. 알 뽑기 (목표 입력)
export async function buyEgg() {
    if (user.pet.stage > 0) return showToast("이미 펫을 키우고 있습니다!");
    if (user.coins < 100) return showToast("코인이 부족해요 (100G)");

    // ★ 목표 입력 받기
    const goal = prompt("이 알을 키우면서 지킬 [나만의 목표]를 적어주세요!\n(예: 매일 수학문제 5개 풀기)");
    if (!goal || goal.trim() === "") return;

    user.coins -= 100;
    
    // 랜덤 속성 부여 (불, 물, 풀)
    const types = ['fire', 'water', 'grass'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    user.pet = {
        ...user.pet,
        id: `pet_${randomType}`,
        type: randomType,
        goal: goal, // 목표 저장
        stage: 0, // 0: 알 상태
        lv: 1, exp: 0,
        hunger: 50, cleanliness: 50, fun: 50
    };

    setPetSpeech("알이 꼼지락거려요!");
    showToast(`알 획득! 속성: ${randomType.toUpperCase()}`);
    await saveUser();
}

// 2. 진화의 돌 구매 (상점 기능)
export async function buyStone() {
    if (user.inventory.includes('evo_stone')) return showToast("이미 진화의 돌을 가지고 있습니다.");
    if (user.coins < 200) return showToast("코인이 부족해요 (200G)");
    
    if(confirm("200코인으로 [진화의 돌]을 구매하시겠습니까?")) {
        user.coins -= 200;
        user.inventory.push('evo_stone');
        showToast("✨ 진화의 돌을 구매했습니다!");
        await saveUser();
        tryEvolve(); // 구매 즉시 진화 가능한지 체크
    }
}

// 3. 펫 행동 (경험치 획득 시 진화 체크)
export async function handleAction(type) {
    if (!user) return;
    if (user.pet.stage === 0) return showToast("알은 아직 아무것도 할 수 없어요! (레벨 5에 부화)");

    if (type === 'feed' && user.pet.hunger >= 100) return setPetSpeech("배불러요!");
    if (user.coins < 10) return showToast("코인이 부족해요!");

    user.coins -= 10;
    
    // 경험치 증가
    user.pet.exp += 10; // 테스트를 위해 조금 빨리 오르게 설정 (10)
    if (user.pet.exp >= 100) {
        user.pet.exp = 0;
        user.pet.lv++;
        showToast(`🎉 레벨 ${user.pet.lv} 달성!`);
        tryEvolve(); // ★ 레벨업 할 때마다 진화 시도
    }

    if (type === 'feed') user.pet.hunger = Math.min(100, user.pet.hunger + 20);
    if (type === 'clean') user.pet.cleanliness = Math.min(100, user.pet.cleanliness + 20);
    if (type === 'play') user.pet.fun = Math.min(100, user.pet.fun + 20);

    updatePetUI();
    await saveUser();
}

// 4. 진화 로직 (핵심!)
async function tryEvolve() {
    const stage = user.pet.stage;
    const lv = user.pet.lv;
    const type = user.pet.type;

    // [0 -> 1] 부화 (레벨 5)
    if (stage === 0 && lv >= 5) {
        user.pet.stage = 1;
        alert(`🐣 알이 부화했습니다! 귀여운 ${type} 펫이 태어났어요!`);
    }
    // [1 -> 2] 성장 (레벨 10 + 돌 필요)
    else if (stage === 1 && lv >= 10) {
        if (user.inventory.includes('evo_stone')) {
            user.pet.stage = 2;
            // 돌 사용 (삭제)
            const idx = user.inventory.indexOf('evo_stone');
            user.inventory.splice(idx, 1);
            alert(`✨ 진화의 돌이 빛납니다! 2단계로 진화했습니다!`);
        } else {
            setPetSpeech("진화하고 싶어... (진화의 돌 필요)");
            showToast("Tip: 상점에서 '진화의 돌'을 사오세요!");
        }
    }
    // [2 -> 3] 최종 진화 (레벨 20 + 메인 미션)
    else if (stage === 2 && lv >= 20) {
        const missionId = `main_${type}`;
        // 미션 완료 여부 체크
        if (user.log[missionId] && user.log[missionId].done) {
            user.pet.stage = 3;
            alert(`👑 전설의 펫으로 성장했습니다! 축하합니다!`);
        } else {
            const mName = PET_DATA[type].mission;
            setPetSpeech(`"${mName}" 미션을 깨야 해!`);
            showToast(`조건 부족: 퀘스트 탭에서 메인 미션을 완료하세요.`);
        }
    }
    await saveUser();
}

// 5. UI 업데이트
export function updatePetUI() {
    if (!user) return;
    document.getElementById('user-nickname').innerText = user.nickname;
    document.getElementById('user-coins').innerText = user.coins;
    
    // 게이지 등 업데이트...
    document.getElementById('bar-hunger').style.width = user.pet.hunger + "%";
    document.getElementById('bar-clean').style.width = user.pet.cleanliness + "%";
    document.getElementById('bar-fun').style.width = user.pet.fun + "%";
    document.getElementById('level-badge').innerText = `Lv.${user.pet.lv}`;
    document.getElementById('exp-bar').style.width = user.pet.exp + "%";

    // 이미지 결정
    const img = document.getElementById('pet-img');
    const stage = user.pet.stage;
    const type = user.pet.type;

    // 이미지가 없을 때를 대비한 기본값 처리
    if (stage === 0) img.src = "images/pet_egg.png";
    else if (PET_DATA[type] && PET_DATA[type][stage]) {
        img.src = PET_DATA[type][stage];
    } else {
        img.src = "images/pet_lv1.png"; // 에러 시 기본
    }
}
