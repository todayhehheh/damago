import { db, collection, addDoc, getDocs, updateDoc, doc, onSnapshot, query, orderBy, limit } from './firebase-config.js';
import { currentUser } from './auth.js';

export function initFeed() {
    console.log("Feed System Initialized");
    loadFeed();
}

// 실시간 피드 불러오기
function loadFeed() {
    const feedContainer = document.getElementById('feed-container');
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(20));

    // 실시간 리스너 (누가 글 올리면 바로 뜸)
    onSnapshot(q, (snapshot) => {
        feedContainer.innerHTML = ''; // 초기화
        snapshot.forEach((docSnap) => {
            const post = docSnap.data();
            const postId = docSnap.id;
            
            // 카드 생성
            const card = document.createElement('div');
            card.className = 'feed-card';
            
            // 좋아요 여부 확인
            const isLiked = post.likesBy && post.likesBy.includes(currentUser.id);
            
            card.innerHTML = `
                <div class="feed-header">
                    <span class="feed-user">👤 ${post.userId || '익명'}</span>
                    <span class="feed-date">${new Date(post.timestamp?.toDate()).toLocaleDateString()}</span>
                </div>
                <div class="feed-img-wrapper">
                    <img src="${post.imageUrl}" alt="인증샷" loading="lazy">
                </div>
                <div class="feed-footer">
                    <span class="feed-mission-badge">${post.missionTitle || '자유인증'}</span>
                    <button class="like-btn ${isLiked ? 'active' : ''}" data-id="${postId}">
                        <i class="fas fa-heart"></i> <span class="like-count">${post.likes || 0}</span>
                    </button>
                </div>
            `;

            // 좋아요 버튼 이벤트
            const likeBtn = card.querySelector('.like-btn');
            likeBtn.addEventListener('click', () => toggleLike(postId, post.likes || 0, post.likesBy || []));

            feedContainer.appendChild(card);
        });
    });
}

// 좋아요 토글 기능
async function toggleLike(postId, currentLikes, likesBy) {
    const postRef = doc(db, "posts", postId);
    const myId = currentUser.id;

    if (likesBy.includes(myId)) {
        // 이미 좋아요 -> 취소
        const newLikesBy = likesBy.filter(id => id !== myId);
        await updateDoc(postRef, {
            likes: currentLikes - 1,
            likesBy: newLikesBy
        });
    } else {
        // 좋아요 누름
        likesBy.push(myId);
        await updateDoc(postRef, {
            likes: currentLikes + 1,
            likesBy: likesBy
        });
    }
}
