import { collection, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, userId } from "./config.js";
import { user, saveUser } from "./state.js";
import { showToast } from "./utils.js";

const DAILY = [
    { id: 'd_pic', title: '📷 오늘의 인증샷', desc: '오늘 활동 사진 올리기', reward: 50, type: '일일' },
    { id: 'd_like', title: '❤️ 친구 칭찬하기', desc: '좋아요 3회 누르기', reward: 30, type: '일일' }
];

let globalQuests = [];
let currentQuestId = null;
let uploadImage = null;

// 퀘스트 목록 로딩
export function initQuests() {
    onSnapshot(collection(db, "quests"), (snap) => {
        globalQuests = [];
        const todayDate = new Date().toDateString();
        snap.forEach(d => {
            const q = d.data();
            if (q.type === '일일' && q.dateString !== todayDate) return;
            globalQuests.push({ id: d.id, ...q });
        });
        renderQuests();
    });
}

// 퀘스트 렌더링
export function renderQuests() {
    if (!user) return;
    const list = document.getElementById('quest-list');
    list.innerHTML = "";

    [...DAILY, ...globalQuests].forEach(q => {
        const log = user.log[q.id] || { done: false, claimed: false };
        const div = document.createElement('div');
        div.className = 'quest-card';

        // 1. 보상 받음 (완료)
        if (log.claimed) {
            div.innerHTML = `
                <div class="quest-info">
                    <span class="quest-tag tag-done">완료됨</span> 
                    <span class="quest-title" style="color:#999; text-decoration:line-through">${q.title}</span>
                </div>
                <i class="fas fa-check-circle" style="color:#4cd137;"></i>`;
        }
        // 2. 미션 성공 (보상 대기)
        else if (log.done) {
            div.innerHTML = `
                <div class="quest-info">
                    <span class="quest-tag tag-done">성공!</span> 
                    <span class="quest-title">${q.title}</span>
                </div>
                <button class="claim-btn-small" onclick="window.app.claim('${q.id}', ${q.reward})">보상 받기</button>`;
        }
        // 3. 진행 중
        else {
            const tagClass = q.type === '일일' ? 'tag-daily' : 'tag-special';
            let progress = "";
            if (q.id === 'd_like') progress = `<span style="color:#FF9F1C; font-size:0.8rem;">(${log.count || 0}/3)</span>`;

            div.innerHTML = `
                <div class="quest-info">
                    <span class="quest-tag ${tagClass}">${q.type}</span>
                    <span class="quest-title">${q.title} ${progress}</span>
                </div>
                <span class="quest-reward">💰 ${q.reward}</span>`;

            if (q.id === 'd_like') div.onclick = () => showToast("피드에서 좋아요를 눌러보세요!");
            else div.onclick = () => openModal(q.id, q.title, q.desc);
        }
        list.appendChild(div);
    });
}

// 모달 열기 & 제출 관련
function openModal(id, title, desc) {
    currentQuestId = id;
    uploadImage = null;
    document.getElementById('m-title').innerText = title;
    document.getElementById('m-desc').innerText = desc;
    document.getElementById('preview-img').style.display = 'none';
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('modal-overlay').style.display = 'flex';
}

// 파일 선택 핸들러
export function handleFile(input) {
    if (input.files[0]) {
        const r = new FileReader();
        r.onload = (e) => {
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
        }
        r.readAsDataURL(input.files[0]);
    }
}

// 제출하기
export async function submitQuest() {
    user.log[currentQuestId] = { done: true, claimed: false };
    if (uploadImage) {
        await addDoc(collection(db, "posts"), {
            uid: userId,
            nickname: user.nickname,
            title: "퀘스트 인증",
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

// 보상 받기
export async function claimReward(id, reward) {
    user.coins += reward;
    user.log[id].claimed = true;
    user.pet.exp += 20; // 경험치 보너스
    showToast(`🎉 ${reward}코인 획득!`);
    renderQuests();
    await saveUser();
}