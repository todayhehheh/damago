import { loadUser, saveUser, user } from "./state.js";
import { handleAction, buyEgg, buyStone, updatePetUI } from "./pet.js";
import { initQuests, handleFile, submitQuest, claimReward } from "./quest.js";
import { initFeed, toggleLike } from "./feed.js";
import { switchTab, showToast, showRewardPopup, showInputModal } from "./utils.js";

window.app = {
    tab: switchTab,
    act: handleAction,
    gacha: buyEgg,
    buyStone: buyStone,
    
    // ★ 튜토리얼 진행 (순서대로 팝업 뜸)
    startTutorial: async () => {
        // 1. 닉네임 입력
        const name = await showInputModal("닉네임 설정", "사용할 닉네임을 알려주세요!");
        if(!name) return;
        user.nickname = name;
        
        // 2. 환영 메시지
        showRewardPopup(0, `반가워요, ${name}님!`);
        
        // 팝업 닫히는 시간 벌기 (약간의 딜레이)
        await new Promise(r => setTimeout(r, 1500));

        // 3. 정착금 지급
        user.coins = 30;
        user.tutorial.done = true;
        await saveUser();

        // 4. 화면 전환
        showRewardPopup(30, "초기 지원금 도착!");
        document.getElementById('tutorial-screen').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        updatePetUI();
    },

    // 닉네임 수정 (헤더 클릭 시)
    editName: async () => {
        const name = await showInputModal("닉네임 변경", "새로운 닉네임을 입력하세요.");
        if(name) {
            user.nickname = name;
            await saveUser();
            showToast("닉네임이 변경되었습니다.");
        }
    },

    modal: (id, t, d) => {
        document.getElementById('m-title').innerText = t;
        document.getElementById('m-desc').innerText = d;
        document.getElementById('preview-img').style.display = 'none';
        document.getElementById('file-input').value = '';
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('photo-modal').style.display = 'flex';
    },
    
    file: handleFile,
    submit: submitQuest,
    claim: claimReward,
    like: toggleLike
};

async function start() {
    await loadUser(); 
    initQuests();     
    initFeed();       
}

start();
