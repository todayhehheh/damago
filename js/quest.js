import { collection, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, userId } from "./config.js";
import { user, saveUser } from "./state.js";
import { showToast, showRewardPopup } from "./utils.js";
import { addExp } from "./pet.js";

// 속성별 메인 미션 (3단계 진화 조건)
const MAIN_MISSIONS = {
    'fire': { title: '🔥 불의 시련', desc: '운동장 3바퀴 뛰고 인증하기', reward: 300 },
    'water': { title: '💧 물의 지혜', desc: '도서관 책 1권 읽고 인증하기', reward: 300 },
    'grass': { title: '🌿 숲의 마음', desc: '친구 칭찬하고 내용 적기', reward: 300 }
};

let globalDbQuests = [];
let currentQuestId = null;
let uploadImage = null;

// 1. DB 퀘스트 리스너
export function initQuests() {
    onSnapshot(collection(db, "quests"), (snap) => {
        globalDbQuests = [];
        const todayDate = new Date().toDateString();
        snap.forEach(d => {
            const q = d.data();
            if (q.type === '일일' && q.dateString !== todayDate) return;
            globalDbQuests.push({ id: d.id, ...q });
        });
        renderQuests();
    });
}

// 2. 퀘스트 그리기
export function renderQuests() {
    if (!user) return;
    const list = document.getElementById('quest-list');
    list.innerHTML = "";
    
    // [A] 일일 미션: 나만의 목표
    const dailyPicLog = user.log['d_pic'] || { done: false, claimed: false };
    if (!dailyPicLog.claimed) {
        const div = document.createElement('div');
        div.className = 'quest-card';
        // ★ 유저가 설정한 목표 표시
        const userGoal = user.pet.goal || "오늘의 목표";
        const title = `📷 인증: ${userGoal}`;
        
        if (dailyPicLog.done) {
            div.innerHTML = `<div><span class="quest-tag tag-done">성공</span> <b>${title}</b></div><button class="claim-btn-small" onclick="window.app.claim('d_pic', 50)">보상 받기</button>`;
        } else {
            div.innerHTML = `<div><span class="quest-tag tag-daily">일일</span> <b>${title}</b></div><b>💰50</b>`;
            div.onclick = () => openModal('d_pic', title, '목표를 달성하고 사진을 찍어주세요!');
        }
        list.appendChild(div);
    }

    // [B] 일일 미션: 좋아요 3회
    const dailyLikeLog = user.log['d_like'] || { done: false, claimed: false, count: 0 };
    if (!dailyLikeLog.claimed) {
        const div = document.createElement('div');
        div.className = 'quest-card';
        const progress = `<span style="font-size:0.8rem; color:#FF9F1C;">(${dailyLikeLog.count}/3)</span>`;
        
        if (dailyLikeLog.done) {
            div.innerHTML = `<div><span class="quest-tag tag-done">성공</span> <b>❤️ 친구 칭찬하기</b></div><button class="claim-btn-small" onclick="window.app.claim('d_like', 30)">보상 받기</button>`;
        } else {
            div.innerHTML = `<div><span class="quest-tag tag-daily">일일</span> <b>❤️ 친구 칭찬하기</b> ${progress}</div><b>💰30</b>`;
            div.onclick = () => showToast("피드 탭에서 친구들 사진에 좋아요를 눌러주세요!");
        }
        list.appendChild(div);
    }

    // [C] 메인 미션 (2단계일 때만)
    if (user.pet.stage === 2) {
        const type = user.pet.type;
        const mInfo = MAIN_MISSIONS[type];
        if (mInfo) {
            const qId = `main_${type}`;
            const log = user.log[qId] || { done: false, claimed: false };
            if (!log.claimed) {
                const div = document.createElement('div');
                div.className = 'quest-card';
                div.style.border = "2px solid #FF9F1C"; // 강조

                if (log.done) {
                    div.innerHTML = `<div><span class="quest-tag tag-special">진화조건</span> <b>${mInfo.title}</b></div><button class="claim-btn-small" onclick="window.app.claim('${qId}', ${mInfo.reward})">완료</button>`;
                } else {
                    div.innerHTML = `<div><span class="quest-tag tag-special">진화조건</span> <b>${mInfo.title}</b></div><b>💰${mInfo.reward}</b>`;
                    div.onclick = () => openModal(qId, mInfo.title, mInfo.desc);
                }
                list.appendChild(div);
            }
        }
    }

    // [D] DB 퀘스트들
    globalDbQuests.forEach(q => {
        const log = user.log[q.id] || { done: false, claimed: false };
        if (log.claimed) return;

        const div = document.createElement('div');
        div.className = 'quest-card';
        const tagClass = q.type === '일일' ? 'tag-daily' : 'tag-special';

        if (log.done) {
            div.innerHTML = `<div><span class="quest-tag tag-done">성공</span> <b>${q.title}</b></div><button class="claim-btn-small" onclick="window.app.claim('${q.id}', ${q.reward})">보상 받기</button>`;
        } else {
            div.innerHTML = `<div><span class="quest-tag ${tagClass}">${q.type}</span> <b>${q.title}</b></div><b>💰${q.reward}</b>`;
            div.onclick = () => openModal(q.id, q.title, q.desc);
        }
        list.appendChild(div);
    });
}

// 모달 열기
function openModal(id, title, desc) {
    currentQuestId = id;
    uploadImage = null;
    document.getElementById('m-title').innerText = title;
    document.getElementById('m-desc').innerText = desc;
    document.getElementById('preview-img').style.display = 'none';
    document.getElementById('file-input').value = '';
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('modal-overlay').style.display = 'flex';
}

// 3. 파일 처리
export function handleFile(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image(); img.src = e.target.result;
            img.onload = () => {
                const cvs = document.createElement('canvas');
                const scale = 500 / img.width;
                cvs.width = 500; cvs.height = img.height * scale;
                cvs.getContext('2d').drawImage(img, 0, 0, cvs.width, cvs.height);
                uploadImage = cvs.toDataURL('image/jpeg', 0.7);
                document.getElementById('preview-img').src = uploadImage;
                document.getElementById('preview-img').style.display = 'block';
                document.getElementById('submit-btn').disabled = false;
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 4. 제출하기
export async function submitQuest() {
    user.log[currentQuestId] = { done: true, claimed: false };
    if (uploadImage) {
        await addDoc(collection(db, "posts"), {
            uid: userId,
            nickname: user.nickname,
            title: document.getElementById('m-title').innerText,
            image: uploadImage,
            likes: [],
            date: Date.now()
        });
    }
    document.getElementById('modal-overlay').style.display = 'none';
    showToast("제출 완료! 보상을 받으세요.");
    renderQuests();
    await saveUser();
}

// 5. 보상 받기 (화려한 팝업)
export async function claimReward(id, reward) {
    user.coins += reward;
    user.log[id].claimed = true;
    addExp(20);

    // ★ 팝업 띄우기
    showRewardPopup(reward, "퀘스트 완료!");
    
    renderQuests();
    await saveUser();
}
