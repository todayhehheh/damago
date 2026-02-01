// 1. 토스트 메시지
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

// 2. 보상 팝업
export function showRewardPopup(amount, message) {
    const popup = document.getElementById('reward-popup');
    const title = document.getElementById('popup-title');
    const desc = document.getElementById('popup-desc');
    
    title.innerText = message || "보상 획득!";
    if (amount > 0) {
        desc.innerText = `${amount} 코인을 받았습니다!`;
    } else {
        desc.innerText = "축하합니다!";
    }
    popup.style.display = 'flex';
}

// 3. ★ [NEW] 입력 팝업 (Promise 사용 - 답변 기다림)
export function showInputModal(title, desc) {
    return new Promise((resolve) => {
        const modal = document.getElementById('input-modal');
        document.getElementById('input-title').innerText = title;
        document.getElementById('input-desc').innerText = desc;
        const input = document.getElementById('custom-input');
        input.value = "";
        
        modal.style.display = 'flex';
        input.focus();

        const confirmBtn = document.getElementById('input-confirm-btn');
        
        // 기존 이벤트 제거 후 새로 등록 (중복 방지)
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.onclick = () => {
            const val = input.value.trim();
            if (val) {
                modal.style.display = 'none';
                resolve(val); // 입력값 반환
            } else {
                showToast("내용을 입력해주세요!");
            }
        };
    });
}

// 4. 펫 말풍선
export function setPetSpeech(text) {
    const bubble = document.getElementById('pet-speech');
    if(bubble) bubble.innerText = text;
}

// 5. 탭 전환
export function switchTab(id, btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    document.querySelectorAll('section').forEach(s => {
        s.classList.remove('active-section');
        if (s.id === id) s.classList.add('active-section');
    });
}
