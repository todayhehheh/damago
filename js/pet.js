import { currentUser, updateUserLocal } from './auth.js';
import { db, doc, updateDoc } from './firebase-config.js';

// [설정] 진화 트리 (확률형)
const EVOLUTION_TREE = {
    // 1단계: 알 (기본)
    'egg': { next: ['chick_a', 'chick_b', 'slime_a'], emoji: '🥚', name: '알' },
    
    // 2단계 (랜덤 분기)
    'chick_a': { next: ['chicken_fire', 'chicken_muscle'], emoji: '🐣', name: '삐약이' },
    'chick_b': { next: ['chicken_flower', 'chicken_water'], emoji: '🐧', name: '펭귄병아리' },
    'slime_a': { next: ['slime_king', 'slime_ghost'], emoji: '💧', name: '물방울' },

    // 3단계 (최종)
    'chicken_fire': { next: [], emoji: '🔥', name: '불닭' },
    'chicken_muscle': { next: [], emoji: '💪', name: '헬창닭' },
    'chicken_flower': { next: [], emoji: '🌸', name: '꽃계' },
    'chicken_water': { next: [], emoji: '🌊', name: '바다닭' },
    'slime_king': { next: [], emoji: '👑', name: '킹슬라임' },
    'slime_ghost': { next: [], emoji: '👻', name: '유령슬라임' }
};

const MAX_EXP = 100; // 레벨업 기준 경험치

export function initPet() {
    console.log("Pet System Initialized");
    updatePetUI();

    // 버튼 이벤트 연결
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => handleInteraction(btn.dataset.action));
    });
}

async function handleInteraction(action) {
    if (!currentUser.data) return;

    // 코인 확인
    if (currentUser.data.coins < 10) {
        alert("코인이 부족해요! (10코인 필요)");
        return;
    }

    // 경험치 및 스탯 증가 로직
    currentUser.data.coins -= 10;
    currentUser.data.pet.exp += 20; // 클릭당 경험치 20
    
    // 단순 스탯 증가 (시각용)
    if(action === 'feed') currentUser.data.pet.hunger = Math.min(100, currentUser.data.pet.hunger + 20);
    if(action === 'clean') currentUser.data.pet.cleanliness = Math.min(100, currentUser.data.pet.cleanliness + 20);
    if(action === 'play') currentUser.data.pet.fun = Math.min(100, currentUser.data.pet.fun + 20);

    // ★ [핵심] 레벨업 및 진화 체크
    checkEvolution();

    // UI 및 DB 저장
    updatePetUI();
    await savePetState();
}

function checkEvolution() {
    const pet = currentUser.data.pet;
    
    // 현재 캐릭터 정보가 없으면 알로 초기화
    if (!pet.characterId) pet.characterId = 'egg';

    // 경험치가 꽉 찼는지 확인
    if (pet.exp >= MAX_EXP) {
        const currentInfo = EVOLUTION_TREE[pet.characterId];
        
        // 다음 단계가 존재하는지 확인 (최종 단계가 아니면)
        if (currentInfo && currentInfo.next.length > 0) {
            // ★ 랜덤 진화 로직 ★
            const randomIndex = Math.floor(Math.random() * currentInfo.next.length);
            const nextCharId = currentInfo.next[randomIndex];
            
            pet.characterId = nextCharId; // 캐릭터 ID 변경
            pet.level += 1;
            pet.exp = 0; // 경험치 초기화

            alert(`✨ 진화했습니다! 새로운 모습: ${EVOLUTION_TREE[nextCharId].emoji}`);
        } else {
            // 최종 단계에서는 경험치만 초기화하거나 만렙 처리
            pet.exp = MAX_EXP; 
        }
    }
}

async function savePetState() {
    if (!currentUser.id) return;
    const userRef = doc(db, "users", currentUser.id);
    await updateDoc(userRef, {
        coins: currentUser.data.coins,
        pet: currentUser.data.pet
    });
    // 헤더 정보 갱신
    document.getElementById('user-coins').innerText = currentUser.data.coins;
}

export function updatePetUI() {
    if (!currentUser.data) return;
    const pet = currentUser.data.pet;
    
    // 방어 코드: 캐릭터 ID가 없으면 'egg'로 설정
    const charId = pet.characterId || 'egg';
    const charInfo = EVOLUTION_TREE[charId] || EVOLUTION_TREE['egg'];

    // UI 업데이트
    document.getElementById('pet-character').innerText = charInfo.emoji;
    document.getElementById('pet-speech').innerText = `Lv.${pet.level} ${charInfo.name}`;
    
    // 게이지바 업데이트
    document.getElementById('bar-hunger').style.width = `${pet.hunger}%`;
    document.getElementById('bar-clean').style.width = `${pet.cleanliness}%`;
    document.getElementById('bar-fun').style.width = `${pet.fun}%`;
}
