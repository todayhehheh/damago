import { loadUser, saveUser, user } from "./state.js";
import { handleAction, buyEgg, buyStone } from "./pet.js";
import { initQuests, handleFile, submitQuest, claimReward } from "./quest.js";
import { initFeed, toggleLike } from "./feed.js";
import { switchTab, showToast, showRewardPopup } from "./utils.js";

// HTML(index.html)에서 onclick으로 부를 수 있게 함수들을 연결
window.app = {
    // 1. 화면 전환 & 팝업 도구
    tab: switchTab,

    // 2. 튜토리얼: 닉네임 설정 (+10코인)
    editName: async () => {
        // 이미 튜토리얼을 깼으면 수정만 가능 (보상 없음)
        if (user.tutorial.nameSet) {
            const newName = prompt("변경할 닉네임을 입력하세요:", user.nickname);
            if(newName && newName.trim()) {
                user.nickname = newName.trim();
                await saveUser();
                showToast("닉네임이 변경되었습니다.");
            }
            return;
        }

        // 튜토리얼 진행 중
        const newName = prompt("사용할 닉네임을 입력하세요:", user.nickname);
        if(newName && newName.trim()) {
            user.nickname = newName.trim();
            user.coins += 10; // 보상
            user.tutorial.nameSet = true; // 완료 체크
            await saveUser();
            
            // 화려한 보상 팝업
            showRewardPopup(10, "멋진 이름이네요!");
        }
    },

    // 3. 튜토리얼: 목표 설정 (+20코인)
    setGoal: async () => {
        // 이미 깼으면 클릭 안 됨 (UI에서 막지만 혹시 몰라 방어)
        if (user.tutorial.goalSet) return; 

        const goal = prompt("이번 펫을 키우면서 지킬 [나만의 목표]는?\n(예: 매일 물 1L 마시기)");
        if(goal && goal.trim()) {
            user.pet.goal = goal.trim();
            user.coins += 20; // 보상
            user.tutorial.goalSet = true; // 완료 체크
            await saveUser();
            
            // 화려한 보상 팝업
            showRewardPopup(20, "목표 설정 완료!");
        }
    },

    // 4. 펫 행동 & 상점
    act: handleAction,
    gacha: buyEgg,
    buyStone: buyStone,

    // 5. 퀘스트 (모달 열기, 파일 선택, 제출, 보상)
    modal: (id, title, desc) => {
        // quest.js의 openModal 로직을 여기서 실행 (DOM 제어)
        // 전역 변수 설정이 필요하므로 quest.js가 아닌 여기서 UI만 제어하고
        // 실제 ID 설정 등은 렌더링 시점에 onclick에 바인딩된 로직을 따름.
        // *주의: quest.js의 renderQuests에서 직접 onclick 이벤트를 처리하므로
        // 사실 window.app.modal은 호출되지 않을 수 있으나, 안전을 위해 둠*
        document.getElementById('m-title').innerText = title;
        document.getElementById('m-desc').innerText = desc;
        document.getElementById('preview-img').style.display = 'none';
        document.getElementById('file-input').value = '';
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('modal-overlay').style.display = 'flex';
    },
    file: handleFile,
    submit: submitQuest,
    claim: claimReward,

    // 6. 피드
    like: toggleLike
};

// ★ 앱 시작 (초기화)
async function start() {
    await loadUser(); // 사용자 정보 불러오기
    initQuests();     // 퀘스트 목록 불러오기
    initFeed();       // 피드 불러오기
    
    // 로딩 완료 후 화면 갱신 한 번 더 (안전장치)
    setTimeout(() => document.body.style.opacity = 1, 100);
}

start();
