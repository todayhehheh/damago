import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, userId } from "./config.js";
import { user, saveUser } from "./state.js";
import { renderQuests } from "./quest.js";
import { showToast } from "./utils.js";

export function initFeed() {
    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    onSnapshot(q, (snap) => {
        const list = document.getElementById('feed-list');
        list.innerHTML = "";
        
        snap.forEach(d => {
            const p = d.data();
            const liked = p.likes && p.likes.includes(userId);
            const nick = p.nickname || p.nick || "이름없음";
            const img = p.image || p.img || "";
            
            list.innerHTML += `
                <div class="feed-card">
                    <div class="feed-header"><b>${nick}</b></div>
                    <img src="${img}" class="feed-img" onerror="this.src='https://via.placeholder.com/300?text=Error'">
                    <div class="feed-footer">
                        <button class="like-btn ${liked ? 'liked' : ''}" onclick="window.app.like('${d.id}', [${(p.likes || []).map(x => `'${x}'`)}])">
                            <i class="fas fa-heart"></i> ${p.likes ? p.likes.length : 0}
                        </button>
                    </div>
                </div>`;
        });
    });
}

export async function toggleLike(pid, likes) {
    const ref = doc(db, "posts", pid);
    if (!likes.includes(userId)) {
        await updateDoc(ref, { likes: arrayUnion(userId) });
        
        // 좋아요 미션 체크
        if (!user.log['d_like']) user.log['d_like'] = { count: 0, done: false, claimed: false };
        user.log['d_like'].count = (user.log['d_like'].count || 0) + 1;
        
        if (user.log['d_like'].count >= 3 && !user.log['d_like'].done) {
            user.log['d_like'].done = true;
            showToast("❤️ 좋아요 미션 달성! 보상을 받으세요.");
        } else {
            showToast("좋아요!");
        }
        renderQuests();
        await saveUser();
    } else {
        await updateDoc(ref, { likes: arrayRemove(userId) });
    }
}
