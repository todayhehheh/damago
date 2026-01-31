// 토스트 메시지 (검은 알림바)
export function showToast(msg) {
    const container = document.getElementById('toast-container');
    const div = document.createElement('div');
    div.className = 'toast-msg';
    div.innerText = msg;
    container.appendChild(div);
    setTimeout(() => {
        div.style.animation = 'fadeOut 0.5s forwards'; // CSS에 없으면 그냥 사라짐
        setTimeout(() => div.remove(), 500);
    }, 2000);
}

// 펫 말풍선
export function setPetSpeech(text) {
    const bubble = document.getElementById('pet-speech');
    if (bubble) bubble.innerText = text;
}

// 탭 전환
export function switchTab(id, btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('section').forEach(s => {
        s.classList.remove('active-section');
        if (s.id === id) s.classList.add('active-section');
    });
}