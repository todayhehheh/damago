import { currentUser } from './auth.js';
import { db, doc, updateDoc } from './firebase-config.js';

// ★ 진화 트리 (확률형 랜덤 진화)
const EVOLUTION_TREE = {
    'egg': { next: ['baby_chick', 'baby_slime'], emoji: '🥚', name: '알' },
    
    // 2단계
    'baby_chick': { next: ['chicken_red', 'chicken_blue'], emoji: '🐣', name: '삐약이' },
    'baby_slime': { next: ['slime_king', 'slime_ghost'], emoji: '💧', name: '슬라임' },

    // 3단계 (최종)
    'chicken_red': { next: [], emoji: '🐓', name: '불꽃닭' },
    'chicken_blue': { next: [], emoji: '🐧', name: '얼음펭귄' },
    'slime_king': { next: [], emoji: '👑', name: '킹슬라임' },
    'slime_ghost': { next: [], emoji: '👻', name: '유령' }
};

export function initPet() {
    updatePetUI();
    
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => handleInteraction(btn.dataset.action));
    });
}

async function handleInteraction(action) {
    if (!currentUser.data) return;
    const pet = currentUser.data.pet;

    if (currentUser.data.coins < 10) {
        alert("코인이 부족해요! (10코인 필요)");
        return;
    }

    // 코인 차감 & 경험치 증가
    currentUser.data.coins -= 10;
    pet.exp += 20;

    // 행동별 스탯 증가
    if (action === 'feed') pet.hunger = Math.min(100, pet.hunger + 20);
    if (action === 'clean') pet.cleanliness = Math.min(100, pet.cleanliness + 20);
    if (action === 'play') pet.fun = Math.min(100, pet.fun + 20);

    // ★ 레벨업 및 진화 체크
    checkEvolution();

    // 저장 및 UI 갱신
    updatePetUI();
    document.getElementById('user-coins').innerText = currentUser.data.coins;
    
    // 시각 효과
    showFloatingText("-10 Coin", "#f1c40f");
    showFloatingText("+20 EXP", "#3498db");

    await updateDoc(doc(db, "users", currentUser.id), {
        coins: currentUser.data.coins,
        pet: pet
    });
}

function checkEvolution() {
    const pet = currentUser.data.pet;
    const currentInfo = EVOLUTION_TREE[pet.characterId] || EVOLUTION_TREE['egg'];

    // 경험치 100 달성 시
    if (pet.exp >= 100) {
        if (currentInfo.next.length > 0) {
            // 랜덤 진화
            const nextId = currentInfo.next[Math.floor(Math.random() * currentInfo.next.length)];
            pet.characterId = nextId;
            pet.level++;
            pet.exp = 0;
            alert(`🎉 축하합니다! ${EVOLUTION_TREE[nextId].name}(으)로 진화했습니다!`);
        } else {
            pet.exp = 100; // 만렙 고정
        }
    }
}

export function updatePetUI() {
    if (!currentUser.data) return;
    const pet = currentUser.data.pet;
    const info = EVOLUTION_TREE[pet.characterId] || EVOLUTION_TREE['egg'];

    document.getElementById('pet-character').innerText = info.emoji;
    document.getElementById('pet-level-info').innerText = `Lv.${pet.level} ${info.name}`;
    document.getElementById('pet-speech').innerText = `경험치: ${pet.exp}%`;

    document.getElementById('bar-hunger').style.width = pet.hunger + "%";
    document.getElementById('bar-clean').style.width = pet.cleanliness + "%";
    document.getElementById('bar-fun').style.width = pet.fun + "%";
}

function showFloatingText(text, color) {
    const el = document.createElement('div');
    el.innerText = text;
    Object.assign(el.style, {
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
        color: color, fontWeight: 'bold', pointerEvents: 'none', animation: 'floatUp 1.5s ease-out forwards'
    });
    document.querySelector('.pet-container').appendChild(el);
    setTimeout(() => el.remove(), 1500);
}
