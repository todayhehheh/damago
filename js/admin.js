<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 페이지</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        /* 관리자 전용 스타일 오버라이드 */
        body { background: #333; color: white; }
        .app-container { max-width: 600px; background: #444; color: white; min-height: 100vh; }
        input, select, textarea { width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: none; }
        .section-box { background: #555; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        h2 { border-bottom: 1px solid #777; padding-bottom: 10px; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="app-container" style="padding:20px;">
        <h1 style="text-align:center; margin-bottom:20px;">🛠️ 관리자 패널</h1>

        <div class="section-box">
            <h2>퀘스트 추가</h2>
            <input type="text" id="q-title" placeholder="퀘스트 제목 (예: 물 마시기)">
            <select id="q-type">
                <option value="일일">일일 미션</option>
                <option value="메인">메인 미션</option>
                <option value="서브">서브 미션</option>
            </select>
            <input type="number" id="q-reward" placeholder="보상 코인 (예: 50)">
            <textarea id="q-desc" placeholder="상세 설명"></textarea>
            <button id="add-quest-btn" class="btn-primary">등록하기</button>
        </div>

        <div class="section-box">
            <h2>최근 게시물 관리</h2>
            <div id="admin-post-list">
                </div>
        </div>
        
        <button onclick="location.href='index.html'" style="background:#777; width:100%; padding:15px; color:white; border:none; border-radius:10px;">앱으로 돌아가기</button>
    </div>

    <script type="module" src="js/admin.js"></script>
</body>
</html>
