import { db, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit } from './firebase-config.js';

// 퀘스트 추가
document.getElementById('add-quest-btn').addEventListener('click', async () => {
    const title = document.getElementById('q-title').value;
    const type = document.getElementById('q-type').value;
    const reward = document.getElementById('q-reward').value;
    const desc = document.getElementById('q-desc').value;

    if (!title || !reward) return alert("제목과 보상은 필수입니다.");

    try {
        await addDoc(collection(db, "quests"), {
            title, type, reward, desc, createdAt: new Date()
        });
        alert("✅ 퀘스트가 등록되었습니다.");
        location.reload();
    } catch (e) {
        alert("오류 발생: " + e.message);
    }
});

// 게시물 관리 (삭제)
async function loadPosts() {
    const list = document.getElementById('admin-post-list');
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(10));
    const snap = await getDocs(q);
    
    list.innerHTML = '';
    snap.forEach(docSnap => {
        const p = docSnap.data();
        const div = document.createElement('div');
        div.style.cssText = "background:#666; padding:10px; margin-bottom:5px; border-radius:5px; display:flex; justify-content:space-between; align-items:center;";
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${p.imageUrl}" style="width:40px; height:40px; object-fit:cover; border-radius:5px;">
                <span style="font-size:0.8rem;">${p.userNick}<br>${p.missionTitle}</span>
            </div>
            <button class="del-btn" style="background:red; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">삭제</button>
        `;
        div.querySelector('.del-btn').addEventListener('click', async () => {
            if (confirm("정말 삭제합니까?")) {
                await deleteDoc(doc(db, "posts", docSnap.id));
                div.remove();
            }
        });
        list.appendChild(div);
    });
}

loadPosts();
