import { db, collection, query, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from './firebase-config.js';
import { currentUser } from './auth.js';

export function initFeed() {
    const container = document.getElementById('feed-container');
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(20));

    // 실시간 감지
    onSnapshot(q, (snapshot) => {
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center; padding:20px;">아직 게시물이 없어요.</p>';
            return;
        }

        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            const isLiked = post.likesBy && post.likesBy.includes(currentUser.id);

            const div = document.createElement('div');
            div.className = 'feed-card';
            div.innerHTML = `
                <div class="feed-header">
                    <span>${post.userNick || '알 수 없음'}</span>
                    <span>${post.missionTitle}</span>
                </div>
                <div class="feed-img-wrapper">
                    <img src="${post.imageUrl}" alt="인증샷">
                </div>
                <div class="feed-footer">
                    <span style="font-size:0.8rem; color:#999;">${new Date(post.timestamp.toDate()).toLocaleDateString()}</span>
                    <button class="like-btn ${isLiked ? 'liked' : ''}" id="like-${pid}">
                        <i class="fas fa-heart"></i> ${post.likes || 0}
                    </button>
                </div>
            `;
            
            div.querySelector(`#like-${pid}`).addEventListener('click', () => toggleLike(pid, post));
            container.appendChild(div);
        });
    });
}

async function toggleLike(postId, post) {
    const postRef = doc(db, "posts", postId);
    const myId = currentUser.id;
    const likesBy = post.likesBy || [];

    if (likesBy.includes(myId)) {
        await updateDoc(postRef, {
            likes: (post.likes || 0) - 1,
            likesBy: arrayRemove(myId)
        });
    } else {
        await updateDoc(postRef, {
            likes: (post.likes || 0) + 1,
            likesBy: arrayUnion(myId)
        });
    }
}
