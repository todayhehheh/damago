import { db, collection, getDocs, addDoc, updateDoc, doc } from './firebase-config.js';
import { currentUser } from './auth.js';

export async function initQuest() {
    const listEl = document.getElementById('quest-list');
    
    // DB에서 퀘스트 목록 가져오기
    try {
        const snap = await getDocs(collection(db, "quests"));
        listEl.innerHTML = '';
        if (snap.empty) {
            listEl.innerHTML = '<p style="text-align:center; padding:20px;">등록된 퀘스트가 없습니다.</p>';
            return;
        }

        snap.forEach(docSnap => {
            const q = docSnap.data();
            const card = document.createElement('div');
            card.className = 'quest-card';
            card.innerHTML = `
                <div class="quest-info">
                    <span class="quest-tag tag-${q.type}">${q.type}</span>
                    <h3>${q.title}</h3>
                </div>
                <div style="font-weight:bold; color:#ff9800;">💰 ${q.reward}</div>
            `;
            card.addEventListener('click', () => openModal(q));
            listEl.appendChild(card);
        });
    } catch (e) {
        console.error(e);
        listEl.innerHTML = '<p style="text-align:center;">불러오기 실패</p>';
    }
}

function openModal(quest) {
    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <h2>${quest.title}</h2>
        <p style="color:#666; margin:10px 0;">${quest.desc || '설명이 없습니다.'}</p>
        <p><strong>보상: ${quest.reward} 코인</strong></p>
        
        <div id="upload-section" style="margin-top:20px;">
            <input type="file" id="file-input" accept="image/*" hidden>
            <button class="btn-primary" onclick="document.getElementById('file-input').click()">
                <i class="fas fa-camera"></i> 사진 인증하기
            </button>
        </div>
        <button id="claim-btn" class="btn-primary btn-claim" style="display:none;">🎁 보상 받기</button>
    `;

    document.getElementById('modal-overlay').classList.remove('hidden');

    // 파일 업로드 및 압축 로직
    document.getElementById('file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(evt) {
            const img = new Image();
            img.src = evt.target.result;
            img.onload = function() {
                // 캔버스 압축 (DB 용량 절약)
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 500;
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const dataUrl = canvas.toDataURL("image/jpeg", 0.6);

                // 업로드 처리 (여기서는 바로 보상 버튼 활성화)
                // 실제로는 DB posts에 먼저 저장해야 함
                savePostToDB(quest, dataUrl);
            }
        }
    });

    document.getElementById('claim-btn').addEventListener('click', async () => {
        // 코인 지급
        currentUser.data.coins += Number(quest.reward);
        document.getElementById('user-coins').innerText = currentUser.data.coins;
        
        await updateDoc(doc(db, "users", currentUser.id), {
            coins: currentUser.data.coins
        });

        alert(`🎉 ${quest.reward} 코인을 받았습니다!`);
        document.getElementById('modal-overlay').classList.add('hidden');
    });
}

async function savePostToDB(quest, imgUrl) {
    const btn = document.getElementById('upload-section').querySelector('button');
    btn.innerText = "업로드 중...";
    
    await addDoc(collection(db, "posts"), {
        userId: currentUser.id,
        userNick: currentUser.data.nickname,
        missionTitle: quest.title,
        imageUrl: imgUrl,
        timestamp: new Date(),
        likes: 0,
        likesBy: []
    });

    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('claim-btn').style.display = 'block';
}
