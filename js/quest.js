import { db, collection, getDocs, addDoc, updateDoc, doc } from './firebase-config.js';
import { currentUser, updateUserLocal } from './auth.js';

let quests = [
    { id: 'q1', title: '이불 정리하기', type: 'daily', reward: 50, desc: '아침에 일어나서 이불을 개면 기분이 상쾌해져요!', status: 'available' },
    { id: 'q2', title: '물 한 컵 마시기', type: 'daily', reward: 30, desc: '건강을 위해 물을 마셔봐요.', status: 'available' },
    { id: 'q3', title: '동네 산책하기', type: 'sub', reward: 100, desc: '가볍게 동네를 한 바퀴 돌아볼까요?', status: 'available' }
];

export async function initQuest() {
    console.log("Quest System Initialized");
    // In real app, fetch from DB
    // await fetchQuests(); 
    renderQuestList();
}

function renderQuestList() {
    const listEl = document.getElementById('quest-list');
    listEl.innerHTML = '';

    quests.forEach(quest => {
        const card = document.createElement('div');
        card.className = 'quest-card';
        card.innerHTML = `
            <div class="quest-info">
                <h3>[${getTypeName(quest.type)}] ${quest.title}</h3>
                <span class="quest-reward"><i class="fas fa-coins"></i> ${quest.reward}</span>
            </div>
            <div class="quest-status ${quest.status === 'completed' ? 'completed' : ''}">
                ${getStatusIcon(quest.status)}
            </div>
        `;
        card.addEventListener('click', () => openQuestModal(quest));
        listEl.appendChild(card);
    });
}

function getTypeName(type) {
    if (type === 'main') return '메인';
    if (type === 'daily') return '일일';
    return '서브';
}

function getStatusIcon(status) {
    if (status === 'completed') return '<i class="fas fa-check-circle"></i>';
    if (status === 'pending') return '<i class="fas fa-clock"></i>';
    return '<i class="fas fa-chevron-right"></i>';
}

function openQuestModal(quest) {
    const modalBody = document.getElementById('modal-body');
    const isCompleted = quest.status === 'completed';

    modalBody.innerHTML = `
        <h2>${quest.title}</h2>
        <p style="color:#666; margin-top:10px;">${quest.desc}</p>
        <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 10px;">
            <h4><i class="fas fa-coins"></i> 보상: ${quest.reward} 코인</h4>
        </div>

        ${!isCompleted ? `
            <div class="upload-area">
                <input type="file" id="proof-img" accept="image/*" style="display:none">
                <button id="upload-btn" class="btn-primary" style="background:#3498db;">
                    <i class="fas fa-camera"></i> 인증 사진 업로드
                </button>
                <div id="preview-area" style="margin-top:10px; text-align:center;"></div>
            </div>
            <button id="claim-btn" class="btn-primary btn-claim" disabled>보상 받기</button>
        ` : `
            <div style="text-align:center; padding:20px; color:var(--secondary-color);">
                <h3><i class="fas fa-check-circle"></i> 완료됨</h3>
            </div>
        `}
    `;

    document.getElementById('modal-overlay').classList.remove('hidden');

    if (!isCompleted) {
        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('proof-img');
        const claimBtn = document.getElementById('claim-btn');
        const previewArea = document.getElementById('preview-area');

        uploadBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewArea.innerHTML = `<img src="${e.target.result}" style="max-width:100%; border-radius:10px;">`;
                    // Enable claim button
                    claimBtn.disabled = false;
                    claimBtn.innerText = "보상 받기 (터치!)";
                    uploadBtn.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        claimBtn.addEventListener('click', () => {
            claimReward(quest);
        });
    }
}

async function claimReward(quest) {
    if (quest.status === 'completed') return;

    // 1. Update Local UI State
    quest.status = 'completed';

    // 2. Add Coins
    currentUser.data.coins += quest.reward;

    // 3. Update DB
    await updateDoc(doc(db, "users", currentUser.id), {
        coins: currentUser.data.coins
    });

    // 4. Close Modal & Refresh
    document.getElementById('modal-overlay').classList.add('hidden');
    renderQuestList();

    // Update Header Coins
    document.getElementById('user-coins').innerText = currentUser.data.coins;

    // Show Alert
    alert(`${quest.reward} 코인을 획득했습니다! 🎉`);
}
