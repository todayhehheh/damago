<!DOCTYPE html>
<html lang="ko" translate="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="google" content="notranslate">
    
    <title>다마고치 퀘스트</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <style>
        /* 1. 모든 요소에서 텍스트 선택/복사 원천 차단 (하얀 막대 방지) */
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            
            /* 터치 시 회색 박스 생기는 것 방지 */
            -webkit-tap-highlight-color: transparent !important;
            /* 꾹 눌렀을 때 메뉴 뜨는 것 방지 */
            -webkit-touch-callout: none !important;
            
            box-sizing: border-box;
            font-family: 'Noto Sans KR', sans-serif;
        }

        /* 2. 입력창만 예외 (글씨 써야 하니까) */
        input, textarea {
            -webkit-user-select: text !important;
            user-select: text !important;
        }

        body {
            background-color: #ddd;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            height: 100vh;
            overflow: hidden; /* 스크롤 방지 */
        }

        .app-container {
            width: 100%;
            max-width: 420px;
            height: 100%;
            background-color: #F7F9FC;
            position: relative;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }

        /* 헤더 */
        .app-header {
            height: 60px;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            z-index: 10;
        }
        .user-info { font-weight: bold; display: flex; width:100%; justify-content: space-between; align-items: center; }
        .coin-display { background: #fff8e1; color: #f1c40f; padding: 5px 12px; border-radius: 20px; font-weight: bold; }

        /* 메인 콘텐츠 */
        #main-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            padding-bottom: 120px; /* 하단 공간 확보 */
        }

        /* 섹션 */
        .hidden-section { display: none !important; }
        .active-section { display: block !important; animation: fadeIn 0.3s; }

        /* 펫 스타일 */
        .pet-container { text-align: center; margin: 30px 0; }
        .pet-character { font-size: 7rem; margin: 20px 0; transition: transform 0.1s; cursor: pointer; }
        .pet-character:active { transform: scale(0.9); }
        
        .speech-bubble {
            background: #333; color: white; padding: 10px 15px; border-radius: 15px;
            display: inline-block; position: relative; animation: bounce 2s infinite;
        }
        .speech-bubble::after {
            content: ''; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
            border-width: 8px 8px 0; border-style: solid; border-color: #333 transparent transparent transparent;
        }

        /* 버튼들 */
        .status-bars { background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; }
        .status-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .progress-bar-bg { flex: 1; height: 10px; background: #eee; border-radius: 5px; overflow: hidden; }
        .progress-bar { height: 100%; background: #2EC4B6; transition: width 0.5s; }

        .interaction-menu { display: flex; gap: 10px; }
        .action-btn {
            flex: 1; background: white; border: none; padding: 15px 5px; border-radius: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1); cursor: pointer;
            display: flex; flex-direction: column; align-items: center; gap: 5px;
        }
        .action-btn i { font-size: 1.5rem; color: #FF9F1C; }

        /* 하단 네비게이션 (공중부양 & 팝업 회피) */
        .bottom-nav {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 380px;
            height: 70px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 35px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            display: flex;
            justify-content: space-around;
            align-items: center;
            z-index: 900; /* 모달보다는 아래 */
        }
        .nav-btn { background: none; border: none; color: #ccc; cursor: pointer; display: flex; flex-direction: column; align-items: center; }
        .nav-btn.active { color: #2EC4B6; font-weight: bold; }
        .nav-btn i { font-size: 1.4rem; margin-bottom: 3px; }

        /* 모달 (팝업) - 여기가 제일 중요 */
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 9999; /* 무조건 맨 위 */
            display: flex; justify-content: center; align-items: center;
        }
        
        /* 숨김 클래스: 가장 강력하게 적용 */
        .hidden { display: none !important; }

        .modal-content {
            background: white; width: 90%; max-width: 350px;
            border-radius: 20px; padding: 20px; position: relative;
        }
        .close-modal {
            position: absolute; top: 10px; right: 15px;
            font-size: 2rem; border: none; background: none; cursor: pointer;
        }
        .btn-primary { width: 100%; padding: 12px; background: #2EC4B6; color: white; border: none; border-radius: 10px; font-weight: bold; margin-top: 10px; }

        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    </style>
</head>

<body>
    <script>
        // 앱 켜질 때 모든 선택 해제
        window.onload = function() {
            window.getSelection().removeAllRanges();
            if (document.activeElement) document.activeElement.blur();
        };
    </script>

    <div class="app-container">
        <header class="app-header">
            <div class="user-info">
                <span id="user-nickname">로딩중...</span>
                <span class="coin-display">💰 <span id="user-coins">0</span></span>
            </div>
        </header>

        <main id="main-content">
            <section id="pet-section" class="active-section">
                <div class="pet-container">
                    <div class="speech-bubble" id="pet-speech">안녕! 반가워!</div>
                    <div class="pet-character" id="pet-character">🥚</div>
                    <div style="margin-top:10px; color:#666; font-size:0.8rem;" id="pet-level-info">Lv.1 알</div>
                </div>

                <div class="status-bars">
                    <div class="status-item"><i class="fas fa-utensils"></i><div class="progress-bar-bg"><div class="progress-bar" id="bar-hunger" style="width: 50%;"></div></div></div>
                    <div class="status-item"><i class="fas fa-soap"></i><div class="progress-bar-bg"><div class="progress-bar" id="bar-clean" style="width: 50%;"></div></div></div>
                    <div class="status-item"><i class="fas fa-laugh"></i><div class="progress-bar-bg"><div class="progress-bar" id="bar-fun" style="width: 50%;"></div></div></div>
                </div>

                <div class="interaction-menu">
                    <button class="action-btn" data-action="feed"><i class="fas fa-hamburger"></i> <span>밥주기</span></button>
                    <button class="action-btn" data-action="clean"><i class="fas fa-soap"></i> <span>씻기기</span></button>
                    <button class="action-btn" data-action="play"><i class="fas fa-gamepad"></i> <span>놀기</span></button>
                </div>
            </section>

            <section id="quest-section" class="hidden-section">
                <h2 style="margin-bottom:15px;">오늘의 퀘스트</h2>
                <div id="quest-list" style="display:flex; flex-direction:column; gap:10px;"></div>
            </section>

            <section id="feed-section" class="hidden-section">
                <h2 style="margin-bottom:15px;">친구들 사진</h2>
                <div id="feed-container" style="display:flex; flex-direction:column; gap:10px;"></div>
            </section>
        </main>

        <nav class="bottom-nav">
            <button class="nav-btn active" data-target="pet-section"><i class="fas fa-home"></i> 홈</button>
            <button class="nav-btn" data-target="quest-section"><i class="fas fa-list"></i> 퀘스트</button>
            <button class="nav-btn" data-target="feed-section"><i class="fas fa-camera"></i> 피드</button>
        </nav>
    </div>

    <div id="modal-overlay" class="modal-overlay hidden">
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <div id="modal-body"></div>
        </div>
    </div>

    <script type="module">
        import { initAuth } from './js/auth.js';
        import { initPet } from './js/pet.js';
        import { initQuest } from './js/quest.js';
        import { initFeed } from './js/feed.js';
        import { initAdmin } from './js/admin.js';

        async function initApp() {
            // 더블탭 확대 방지
            document.addEventListener('dblclick', function(event) {
                event.preventDefault();
            }, { passive: false });

            const isAuth = await initAuth();
            if (isAuth) {
                initPet();
                initQuest();
                initFeed();
                initAdmin();

                // 탭 전환
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const targetId = btn.getAttribute('data-target');
                        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        document.querySelectorAll('section').forEach(sec => {
                            if(sec.id === targetId) {
                                sec.classList.remove('hidden-section');
                                sec.classList.add('active-section');
                            } else {
                                sec.classList.add('hidden-section');
                                sec.classList.remove('active-section');
                            }
                        });
                    });
                });

                // 모달 닫기
                document.querySelector('.close-modal').addEventListener('click', () => {
                    document.getElementById('modal-overlay').classList.add('hidden');
                });
            }
        }
        initApp();
    </script>
</body>
</html>
