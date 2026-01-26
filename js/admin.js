import { db, collection, addDoc, getDocs, deleteDoc, doc } from './firebase-config.js';

const urlParams = new URLSearchParams(window.location.search);
const adminKey = urlParams.get('admin');

export function initAdmin() {
    if (adminKey) {
        console.log("Admin Mode Active");
        const adminBtn = document.getElementById('admin-btn');
        adminBtn.classList.remove('hidden');

        adminBtn.addEventListener('click', openAdminPanel);
    }
}

function openAdminPanel() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>관리자 패널</h2>
        <div class="admin-menu">
            <button class="btn-primary" id="add-quest-btn">새 퀘스트 추가</button>
            <button class="btn-primary" id="manage-posts-btn" style="background:#e74c3c">게시물 관리</button>
        </div>
        <div id="admin-content" style="margin-top:20px;"></div>
    `;

    document.getElementById('modal-overlay').classList.remove('hidden');

    document.getElementById('add-quest-btn').addEventListener('click', showAddQuestForm);
    document.getElementById('manage-posts-btn').addEventListener('click', showManagePosts);
}

function showAddQuestForm() {
    const container = document.getElementById('admin-content');
    container.innerHTML = `
        <h3>퀘스트 추가</h3>
        <input type="text" id="q-title" placeholder="퀘스트 제목" style="width:100%; padding:10px; margin:5px 0;">
        <select id="q-type" style="width:100%; padding:10px; margin:5px 0;">
            <option value="daily">일일 퀘스트</option>
            <option value="sub">서브 퀘스트</option>
        </select>
        <input type="number" id="q-reward" placeholder="보상 코인" style="width:100%; padding:10px; margin:5px 0;">
        <textarea id="q-desc" placeholder="설명" style="width:100%; padding:10px; margin:5px 0;"></textarea>
        <button id="save-quest-btn" class="btn-primary">저장</button>
    `;

    document.getElementById('save-quest-btn').addEventListener('click', async () => {
        const title = document.getElementById('q-title').value;
        const type = document.getElementById('q-type').value;
        const reward = Number(document.getElementById('q-reward').value);
        const desc = document.getElementById('q-desc').value;

        if (!title || !reward) {
            alert("제목과 보상은 필수입니다.");
            return;
        }

        // Add to DB (Mock logic or real DB call)
        // await addDoc(collection(db, "quests"), { title, type, reward, desc });

        alert(`[저장됨]\n제목: ${title}\n보상: ${reward}`);
        // Reset
        showAddQuestForm();
    });
}

function showManagePosts() {
    const container = document.getElementById('admin-content');
    container.innerHTML = `<h3>게시물 관리 (최신순)</h3>`;

    // Mock List
    const mockPosts = [
        { id: 1, user: '모험가_1234', content: '오늘 퀘스트 완료!', img: '...' },
        { id: 2, user: '모험가_5678', content: '다마고치 귀여워', img: '...' }
    ];

    mockPosts.forEach(post => {
        const item = document.createElement('div');
        item.style.borderBottom = "1px solid #eee";
        item.style.padding = "10px";
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.innerHTML = `
            <span>${post.user}: ${post.content}</span>
            <button class="btn-del" style="background:red; color:white; border:none; padding:5px;">삭제</button>
        `;
        item.querySelector('.btn-del').addEventListener('click', () => {
            if (confirm("정말 삭제하시겠습니까?")) {
                item.remove();
            }
        });
        container.appendChild(item);
    });
}
