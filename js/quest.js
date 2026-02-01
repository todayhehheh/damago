import { collection, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, userId } from "./config.js";
import { user, saveUser } from "./state.js";
import { showToast } from "./utils.js";

// 속성별 메인 미션 정보 (3단계 진화 조건)
const MAIN_MISSIONS = {
    'fire': { title: '🔥 불의 시련', desc: '운동장 3바퀴 뛰고 인증하기', reward: 300 },
    'water': { title: '💧 물의 지혜', desc: '도서관 책 1권 읽고 인증하기', reward: 300 },
    'grass': { title: '🌿 숲의 마음', desc: '친구 칭찬하고 내용 적기', reward: 300 }
};

let globalDbQuests = []; // 관리자가 만든 퀘스트 목록
let currentQuestId = null;
let uploadImage = null;

// 1. 퀘스트 목록 리스너 (초기화)
export function initQuests() {
    onSnapshot(collection(db, "quests"), (snap) => {
        globalDbQuests = [];
        const todayDate = new Date().toDateString();
        
        snap.forEach(d => {
            const q = d.data();
            // 지난 날짜의 일일 퀘스트는 제외
            if (q.type === '일일' && q.dateString !== todayDate) return;
            globalDbQuests.push({ id: d.id, ...q });
        });
        renderQuests(); // 데이터 바뀌면 다시 그리기
    });
}

// 2. 퀘스트 화면 그리기 (가장 중요!)
export function renderQuests() {
    if (!user) return;
    const list = document.getElementById('quest-list');
    list.innerHTML = "";
    
    // --- [A] 일일 미션: 나만의 목표 (1순위) ---
    const dailyPicLog = user.log['d_pic'] || { done: false, claimed: false };
    if (!dailyPicLog.claimed) {
        const div = document.createElement('div');
        div.className = 'quest-card';
        
        // 유저가 알 뽑을 때 정한 목표 가져오기
        const userGoal = user.pet.goal || "오늘의 목표를 설정하세요";
        const title = `📷 인증: ${userGoal}`;
        
        if (dailyPicLog.done) {
            div.innerHTML = `<div><span class="quest-tag tag-done">성공</span> <b>${title}</b></div><button class="claim-btn-small" onclick="window.app.claim('d_pic', 50)">보상 받기</button>`;
        } else {
            div.innerHTML = `<div><span class="quest-tag tag-daily">일일</span> <b>${title}</b></div><b>💰50</b>`;
            // 클릭 시 모달 열기
            div.onclick = () => openModal('d_pic', title, '목표를 달성하고 인증샷을 찍어주세요!');
        }
        list.appendChild(div);
    }

    // --- [B] 일일 미션: 좋아요 3회 (2순위) ---
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

    // --- [C] 메인 미션: 3단계 진화 조건 (Stage 2일 때만 등장) ---
    if (user.pet.stage === 2) {
        const type = user.pet.type; // fire, water, grass
        const mInfo = MAIN_MISSIONS[type];
        
        if (mInfo) {
            const qId = `main_${type}`;
            const log = user.log[qId] || { done: false, claimed: false };

            if (!log.claimed) {
                const div = document.createElement('div');
                div.className = 'quest-card';
                div.style.border = "2px solid #FF9F1C"; // 중요하니까 테두리 강조!

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

    // --- [D] 선생님이 만든 DB 퀘스트들 ---
    globalDbQuests.forEach(q => {
        const log = user.log[q.id] || { done: false, claimed: false };
        if (log.claimed) return; // 이미 받은건 안 보여줌

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

// 3. 내부 함수: 모달 열기
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

// 4. 외부 노출 함수: 파일 처리
export function handleFile(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image(); img.src = e.target.result;
            img.onload = () => {
                // 이미지 리사이징 (500px)
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

// 5. 외부 노출 함수: 제출하기
export async function submitQuest() {
    user.log[currentQuestId] = { done: true, claimed: false };
    
    // 피드에 업로드
    if (uploadImage) {
        await addDoc(collection(db, "posts"), {
            uid: userId,
            nickname: user.nickname,
            title: document.getElementById('m-title').innerText, // 퀘스트 제목
            image: uploadImage,
            likes: [],
            date: Date.now()
        });
    }
    
    document.getElementById('modal-overlay').style.display = 'none';
    showToast("제출 완료! [보상 받기] 버튼을 눌러주세요.");
    renderQuests(); // 화면 갱신 (버튼 생김)
    await saveUser();
}

// 6. 외부 노출 함수: 보상 받기
export async function claimReward(id, reward) {
    user.coins += reward;
    user.log[id].claimed = true;
    
    // 경험치 보너스 (기본 20)
    import("./pet.js").then(module => module.addExp(20));

    showToast(`🎉 ${reward}코인 획득!`);
    renderQuests(); // 목록에서 사라짐
    await saveUser();
}
