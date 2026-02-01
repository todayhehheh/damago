import { loadUser, saveUser, user } from "./state.js";
import { handleAction, buyEgg, buyStone } from "./pet.js"; // buyEgg, buyStone 추가됨
import { initQuests, handleFile, submitQuest, claimReward } from "./quest.js";
import { initFeed, toggleLike } from "./feed.js";
import { switchTab, showToast } from "./utils.js";

// HTML(index.html)에서 onclick으로 부를 수 있게 연결
window.app = {
    // 탭 & 유틸
    tab: switchTab,
    editName: async () => {
        const newName = prompt("변경할 닉네임을 입력하세요:", user.nickname);
        if(newName && newName.trim()) {
            user.nickname = newName.trim();
            await saveUser();
            showToast("닉네임이 변경되었습니다.");
        }
    },

    // 펫 관련
    act: handleAction,
    gacha: buyEgg,      // 알 뽑기 연결
    buyStone: buyStone, // 진화의 돌 구매 연결

    // 퀘스트 관련
    modal: (id, t, d) => { /* quest.js 내부함수를 쓰면 좋지만, 여기서 간단히 호출 */
        // quest.js의 openModal을 export해서 쓰거나, 
        // 여기서 직접 DOM을 제어해도 되지만
        // 편의상 renderQuests에서 onclick에 직접 함수를 바인딩하는게 나음.
        // 하지만 구조상 quest.js가 DOM을 그리므로, 
        // quest.js 내부에서 모달 여는 로직을 처리하는게 맞음.
        // 따라서 여기서는 껍데기만 두거나 quest.js의 export된 함수를 씀.
        // *Quest.js 코드를 보면 div.onclick에서 직접 내부함수를 부르지 않고 window.app.modal을 부르도록 설정했으므로
        // 아래 코드가 필요함.*
        document.getElementById('m-title').innerText = t;
        document.getElementById('m-desc').innerText = d;
        // ... (나머지 초기화 로직은 quest.js 의 handleFile, submitQuest가 처리)
        document.getElementById('preview-img').style.display = 'none';
        document.getElementById('file-input').value = '';
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('modal-overlay').style.display = 'flex';
        // quest.js의 전역변수 currentQuestId를 세팅해야 하는데...
        // *해결책: quest.js에서 window.app.modal을 호출할때 ID도 넘겨주고,
        // quest.js가 setCurrentQuestId 같은 함수를 export해서 여기서 호출해줘야 함.*
        // 하지만 더 쉬운 방법은 quest.js 안에서 직접 DOM onclick을 함수로 지정하는 것.
        // 현재 제 코드(quest.js)는 div.onclick = () => openModal(...) 형태이므로
        // window.app.modal은 사실 필요없음! (quest.js 내부 함수를 쓰니까)
        // 단, d_like(좋아요) 퀘스트는 toast를 띄워야 하니 그건 유지.
    },
    
    file: handleFile,
    submit: submitQuest,
    claim: claimReward,

    // 피드 관련
    like: toggleLike
};

// 앱 시작
async function start() {
    await loadUser(); 
    initQuests();     
    initFeed();       
}

start();
