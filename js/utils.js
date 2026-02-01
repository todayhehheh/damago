// 1. 토스트 메시지 (검은 알림바)
export function showToast(msg) {
    const container = document.getElementById('toast-container');
    const div = document.createElement('div');
    div.className = 'toast-msg';
    div.innerText = msg;
    container.appendChild(div);
    setTimeout(() => {
        div.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => div.remove(), 500);
    }, 2000);
}

// 2. ★ [NEW] 화려한 보상 팝업
export function showRewardPopup(amount, message) {
    const popup = document.getElementById('reward-popup');
    const title = document.getElementById('popup-title');
    const desc = document.getElementById('popup-desc');
    
    title.innerText = message || "보상 획득!";
    // 코인이 0보다 클 때만 코인 메시지 표시
    if (amount > 0) {
        desc.innerText = `${amount} 코인을 받았습니다!`;
    } else {
        desc.innerText = "축하합니다!";
    }
    
    popup.style.display = 'flex';
}

// 3. 펫 말풍선 변경
export function setPetSpeech(text) {
    const bubble = document.getElementById('pet-speech');
    if(bubble) bubble.innerText = text;
}

// 4. 탭 전환 기능
export function switchTab(id, btn) {
    // 모든 버튼 비활성화
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    // 선택된 버튼 활성화
    if(btn) btn.classList.add('active');
    
    // 모든 섹션 숨기기
    document.querySelectorAll('section').forEach(s => {
        s.classList.remove('active-section');
        // 선택된 섹션만 보이기
        if (s.id === id) s.classList.add('active-section');
    });
}
