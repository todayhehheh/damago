import { loadUser, saveUser, user } from "./state.js";
import { handleAction } from "./pet.js";
import { initQuests, handleFile, submitQuest, claimReward } from "./quest.js";
import { initFeed, toggleLike } from "./feed.js";
import { switchTab, showToast } from "./utils.js";

// HTML에서 onclick으로 함수를 쓰려면 window에 붙여야 함
window.app = {
    act: handleAction,
    tab: switchTab,
    file: handleFile,
    submit: submitQuest,
    claim: claimReward,
    like: toggleLike,
    editName: async () => {
        const newName = prompt("새 닉네임 입력:", user.nickname);
        if (newName && newName.trim()) {
            user.nickname = newName.trim();
            await saveUser();
            showToast("닉네임 변경 완료!");
        }
    }
};

// 앱 시작
async function start() {
    await loadUser(); // 1. 사용자 정보 로드
    initQuests();     // 2. 퀘스트 로드
    initFeed();       // 3. 피드 로드
}

start();