import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./config.js";
import { user } from "./state.js";
import { showToast } from "./utils.js"; // 기타 필요한 import

// 퀘스트 렌더링
export function renderQuests() {
    if (!user) return;
    const list = document.getElementById('quest-list');
    list.innerHTML = "";
    
    // 1. [일일] 유저가 정한 목표 퀘스트
    const dailyPicLog = user.log['d_pic'] || { done: false, claimed: false };
    if (!dailyPicLog.claimed) {
        const div = document.createElement('div');
        div.className = 'quest-card';
        // ★ 제목에 유저 목표(user.pet.goal)를 넣음
        const title = `📷 인증: ${user.pet.goal || '오늘의 목표'}`;
        
        if (dailyPicLog.done) {
            div.innerHTML = `<div><span class="quest-tag tag-done">성공</span> <b>${title}</b></div><button class="claim-btn-small" onclick="window.app.claim('d_pic', 50)">보상 받기</button>`;
        } else {
            div.innerHTML = `<div><span class="quest-tag tag-daily">일일</span> <b>${title}</b></div><b>💰50</b>`;
            div.onclick = () => window.app.modal('d_pic', title, '목표를 달성하고 사진을 찍어주세요!');
        }
        list.appendChild(div);
    }

    // 2. [메인] 속성별 진화 미션 (2단계일 때만 등장)
    if (user.pet.stage === 2) {
        const type = user.pet.type; // fire, water, grass
        const qId = `main_${type}`;
        // 속성별 미션 내용 (pet.js의 PET_DATA와 일치시켜야 함)
        const missions = {
            'fire': '운동장 3바퀴 뛰기',
            'water': '도서관 책 1권 읽기',
            'grass': '친구 칭찬하기'
        };
        const mTitle = missions[type];
        const log = user.log[qId] || { done: false, claimed: false };

        if (!log.claimed) {
            const div = document.createElement('div');
            div.className = 'quest-card';
            div.style.border = "2px solid #FF9F1C"; // 메인 미션 강조

            if (log.done) {
                div.innerHTML = `<div><span class="quest-tag tag-special">메인</span> <b>${mTitle}</b></div><button class="claim-btn-small" onclick="window.app.claim('${qId}', 300)">완료</button>`;
            } else {
                div.innerHTML = `<div><span class="quest-tag tag-special">진화 조건</span> <b>${mTitle}</b></div><b>💰300</b>`;
                div.onclick = () => window.app.modal(qId, mTitle, '3단계 진화를 위한 필수 미션입니다!');
            }
            list.appendChild(div);
        }
    }

    // 3. 좋아요 미션 등 나머지 로직 유지...
}
