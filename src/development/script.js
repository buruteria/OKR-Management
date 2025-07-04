// OKR管理ツール JavaScript

// ローカルストレージのキー
const STORAGE_KEYS = {
    objective: 'okr_objective',
    whyObjective: 'okr_why_objective',
    keyResults: 'okr_key_results',
    progress: 'okr_progress',
    reflections: 'okr_reflections',
    weeklyActions: 'okr_weekly_actions'
};

// データストレージ
let okrData = JSON.parse(localStorage.getItem('okrManagerData') || '{}');

// 初期化
if (!okrData.northStar) {
    okrData = {
        northStar: '',
        objectives: [],
        keyResults: [],
        progressHistory: [],
        adjustmentHistory: [],
        weeklyReviews: [],
        todayTasks: [],
        moodHistory: []
    };
}

// 現在選択されている気分
let selectedMood = '';

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadOKRData();
    updateDashboard();
    updateWeeklyReview();
    setInterval(updateDashboard, 60000); // 1分ごとに更新
});

// タブ切り替え
function showTab(tabName) {
    // 全てのタブコンテンツを非表示
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 全てのタブボタンの active クラスを削除
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 選択されたタブコンテンツを表示
    document.getElementById(tabName).classList.add('active');
    
    // 選択されたタブボタンに active クラスを追加
    event.target.classList.add('active');
}

// OKRデータの保存
function saveOKR() {
    const northStar = document.getElementById('northStarInput').value;
    const objective = document.getElementById('objectiveInput').value;
    const kr1 = document.getElementById('kr1Input').value;
    const kr2 = document.getElementById('kr2Input').value;
    const kr3 = document.getElementById('kr3Input').value;
    
    if (!northStar || !objective || !kr1 || !kr2 || !kr3) {
        alert('すべての項目を入力してください');
        return;
    }
    
    // North Star保存
    okrData.northStar = northStar;
    
    // 既存のObjectivesとKRsをクリア（新規設定の場合）
    okrData.objectives = [];
    okrData.keyResults = [];
    
    // Objective保存
    const objId = Date.now();
    okrData.objectives.push({
        id: objId,
        text: objective,
        createdAt: new Date().toISOString()
    });
    
    // KR保存
    [kr1, kr2, kr3].forEach((kr, index) => {
        okrData.keyResults.push({
            id: Date.now() + index,
            objectiveId: objId,
            text: kr,
            current: 0,
            target: 100,
            createdAt: new Date().toISOString()
        });
    });
    
    // ローカルストレージに保存
    localStorage.setItem('okrManagerData', JSON.stringify(okrData));
    
    closeModal('setupModal');
    updateDashboard();
    alert('OKRが保存されました！🎉\n\n今日から目標忘却防止システムが動作します。');
    
    // フォームをクリア
    document.getElementById('northStarInput').value = '';
    document.getElementById('objectiveInput').value = '';
    document.getElementById('kr1Input').value = '';
    document.getElementById('kr2Input').value = '';
    document.getElementById('kr3Input').value = '';
}

// OKRデータの読み込み
function loadOKRData() {
    const objective = localStorage.getItem(STORAGE_KEYS.objective);
    const whyObjective = localStorage.getItem(STORAGE_KEYS.whyObjective);
    const keyResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.keyResults) || '[]');

    if (objective) {
        document.getElementById('objective').value = objective;
    }
    if (whyObjective) {
        document.getElementById('why-objective').value = whyObjective;
    }
    
    if (keyResults.length > 0) {
        keyResults.forEach((kr, index) => {
            const krId = `kr${index + 1}`;
            const targetId = `kr${index + 1}-target`;
            const unitId = `kr${index + 1}-unit`;
            
            const krElement = document.getElementById(krId);
            const targetElement = document.getElementById(targetId);
            const unitElement = document.getElementById(unitId);
            
            if (krElement) krElement.value = kr.description;
            if (targetElement) targetElement.value = kr.target;
            if (unitElement) unitElement.value = kr.unit;
        });
    }
}

// ダッシュボードの更新
function updateDashboard() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('todayDate').textContent = now.toLocaleDateString('ja-JP', options);
    
    const hour = now.getHours();
    let greeting = '';
    if (hour < 12) greeting = 'おはようございます！今日も目標に向かって進みましょう';
    else if (hour < 18) greeting = 'こんにちは！午後も生産的な時間を過ごしましょう';
    else greeting = 'お疲れさまです！今日の進捗を振り返りましょう';
    
    document.getElementById('greeting').textContent = greeting;
    
    // North Star表示
    if (okrData.northStar) {
        document.getElementById('northStarText').textContent = okrData.northStar;
    }
    
    // OKR表示
    displayOKRCards();
    
    // 今日のフォーカス表示
    displayTodaysFocus();
}

// OKRカードの表示
function displayOKRCards() {
    const grid = document.getElementById('okrGrid');
    grid.innerHTML = '';
    
    if (okrData.objectives.length === 0) {
        grid.innerHTML = `
            <div class="okr-card">
                <div class="okr-type">お知らせ</div>
                <div class="okr-objective">OKRがまだ設定されていません</div>
                <p style="margin-top: 15px; color: #7f8c8d;">「OKR設定」から始めて、目標忘却を防止しましょう。</p>
            </div>
        `;
        return;
    }
    
    okrData.objectives.forEach((obj, index) => {
        const card = document.createElement('div');
        card.className = 'okr-card';
        
        const krs = okrData.keyResults.filter(kr => kr.objectiveId === obj.id);
        
        card.innerHTML = `
            <div class="okr-type">四半期目標 ${index + 1}</div>
            <div class="okr-objective">${obj.text}</div>
            <div class="kr-list">
                ${krs.map(kr => {
                    const progress = Math.min((kr.current / kr.target * 100), 100);
                    return `
                        <div class="kr-item">
                            <div>${kr.text}</div>
                            <div class="kr-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <div class="progress-text">${progress.toFixed(0)}%</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// 今日のフォーカス表示
function displayTodaysFocus() {
    const container = document.getElementById('focusTasks');
    container.innerHTML = '';
    
    // 保存されたタスクがあればそれを表示、なければサンプル
    let todayTasks = okrData.todayTasks || [
        { id: 1, title: 'ポートフォリオサイトのProject機能を修正', kr: 'KR1: ポートフォリオ公開', completed: false },
        { id: 2, title: 'About文章を作成（60%品質で可）', kr: 'KR1: ポートフォリオ公開', completed: false },
        { id: 3, title: 'note記事の骨子を作成', kr: 'KR2: note記事3本公開', completed: false }
    ];
    
    todayTasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'focus-task';
        taskEl.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-kr">${task.kr}</div>
            </div>
        `;
        container.appendChild(taskEl);
    });
}

// セクション切り替え
function showSection(sectionId) {
    // ナビゲーションのアクティブ状態更新
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
    
    // セクションの表示切り替え
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    // セクション別の初期化処理
    if (sectionId === 'progress') {
        displayProgressHistory();
    }
}

// モーダル操作
function openSetupModal() {
    document.getElementById('setupModal').style.display = 'block';
}

function openAdjustModal() {
    document.getElementById('adjustModal').style.display = 'block';
}

function openProgressModal() {
    document.getElementById('progressModal').style.display = 'block';
    displayKRCheckboxes();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// KRチェックボックスの表示
function displayKRCheckboxes() {
    const container = document.getElementById('krCheckboxes');
    container.innerHTML = '';
    
    if (okrData.keyResults.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d;">まずOKRを設定してください</p>';
        return;
    }
    
    okrData.keyResults.forEach(kr => {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.innerHTML = `
            <label style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" value="${kr.id}">
                <span>${kr.text}</span>
            </label>
        `;
        container.appendChild(div);
    });
}

// 進捗保存
function saveProgress() {
    const activity = document.getElementById('activityInput').value;
    const result = document.getElementById('resultInput').value;
    
    if (!activity || !result) {
        alert('活動と成果を入力してください');
        return;
    }
    
    // 選択されたKRを取得
    const selectedKRs = [];
    document.querySelectorAll('#krCheckboxes input:checked').forEach(checkbox => {
        selectedKRs.push(checkbox.value);
    });
    
    // 進捗履歴に追加
    okrData.progressHistory.push({
        date: new Date().toISOString(),
        activity: activity,
        result: result,
        relatedKRs: selectedKRs,
        mood: selectedMood || '😐'
    });
    
    // 気分履歴に追加
    if (selectedMood) {
        okrData.moodHistory.push({
            date: new Date().toISOString(),
            mood: selectedMood
        });
    }
    
    localStorage.setItem('okrManagerData', JSON.stringify(okrData));
    
    closeModal('progressModal');
    alert('進捗が記録されました！🎉');
    
    // フォームをクリア
    document.getElementById('activityInput').value = '';
    document.getElementById('resultInput').value = '';
    selectedMood = '';
    
    // ダッシュボードを更新
    updateDashboard();
}

// タスクのトグル
function toggleTask(taskId) {
    // 実装: タスクの完了状態を切り替え
    const checkbox = event.target;
    checkbox.classList.toggle('checked');
    
    // データの更新
    if (!okrData.todayTasks) okrData.todayTasks = [];
    
    const taskIndex = okrData.todayTasks.findIndex(task => task.id === taskId);
    if (taskIndex >= 0) {
        okrData.todayTasks[taskIndex].completed = checkbox.classList.contains('checked');
    }
    
    localStorage.setItem('okrManagerData', JSON.stringify(okrData));
    
    // 完了時のフィードバック
    if (checkbox.classList.contains('checked')) {
        setTimeout(() => {
            alert('タスク完了！お疲れさまです 🎉');
        }, 300);
    }
}

// 進捗履歴の表示
function displayProgressHistory() {
    const container = document.getElementById('progressHistory');
    
    if (!okrData.progressHistory || okrData.progressHistory.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #7f8c8d; padding: 40px;">
                <h3>📈 進捗記録</h3>
                <p>まだ進捗が記録されていません。<br>「進捗を記録」から日々の活動を記録しましょう。</p>
            </div>
        `;
        return;
    }
    
    const historyHtml = okrData.progressHistory
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10) // 最新10件
        .map(entry => {
            const date = new Date(entry.date).toLocaleDateString('ja-JP');
            return `
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3498db;">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                        <strong>${date}</strong>
                        <span style="font-size: 20px;">${entry.mood || '😐'}</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>活動:</strong> ${entry.activity}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>成果:</strong> ${entry.result}
                    </div>
                    ${entry.relatedKRs && entry.relatedKRs.length > 0 ? 
                        `<div style="font-size: 12px; color: #7f8c8d;">関連KR: ${entry.relatedKRs.length}件</div>` : ''
                    }
                </div>
            `;
        }).join('');
    
    container.innerHTML = `
        <h3 style="margin-bottom: 20px;">📈 最近の進捗記録</h3>
        ${historyHtml}
    `;
}

// 週次レビューデータの更新
function updateWeeklyReview() {
    // 実際のデータに基づく計算（簡易版）
    const thisWeekProgress = okrData.progressHistory ? 
        Math.min(okrData.progressHistory.length * 12, 100) : 0;
    
    const completedTasks = okrData.todayTasks ? 
        okrData.todayTasks.filter(task => task.completed).length : 0;
    
    const adjustmentCount = okrData.adjustmentHistory ? 
        okrData.adjustmentHistory.length : 0;
    
    const focusRate = okrData.todayTasks && okrData.todayTasks.length > 0 ? 
        Math.round((completedTasks / okrData.todayTasks.length) * 100) : 0;
    
    document.getElementById('weeklyProgress').textContent = `${thisWeekProgress}%`;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('adjustmentCount').textContent = adjustmentCount;
    document.getElementById('focusRate').textContent = `${focusRate}%`;
}

// AIプロンプト生成機能
function generateDailyPrompt() {
    const objective = okrData.objectives.length > 0 ? okrData.objectives[0].text : '未設定';
    const krs = okrData.keyResults.map(kr => kr.text).join('\n- ');
    
    const prompt = `# 今日の優先順位整理（個人事業主向け）

あなたは個人事業主のOKR達成をサポートするAIコーチです。以下の情報を基に、今日の最適な行動計画をアドバイスしてください。

## 現在のObjective（四半期目標）
${objective}

## 今月のKey Results
- ${krs || '未設定'}

## 今日のコーチング質問
1. 上記のKR達成のために、今日最も重要なタスクは何ですか？
2. そのタスクに集中するために、何を「やらない」と決めるべきですか？
3. 想定外の機会が現れた場合、どう判断しますか？（エフェクチュエーション思考）

## 回答形式
- 🎯 最重要タスク（1つだけ）
- ⚠️ 今日やらないこと（完璧主義の罠を避ける）
- 💡 軌道修正のサイン（何があったら計画を変更するか）

できるだけ具体的で実行可能なアドバイスをお願いします。`;

    showGeneratedPrompt(prompt);
}

function generateWeeklyPrompt() {
    const recentProgress = okrData.progressHistory
        .slice(-7)
        .map(entry => `- ${entry.date.split('T')[0]}: ${entry.activity} → ${entry.result}`)
        .join('\n');
    
    const prompt = `# 週次振り返り分析（個人事業主向け）

個人事業主として、客観的な振り返りと来週の戦略立案をサポートしてください。

## 今週の活動記録
${recentProgress || '記録なし'}

## 現在のOKR状況
- Objective: ${okrData.objectives.length > 0 ? okrData.objectives[0].text : '未設定'}
- Key Results: ${okrData.keyResults.map(kr => `${kr.text} (${Math.round(kr.current/kr.target*100)}%)`).join(', ')}

## 分析依頼
1. **成果分析**: 今週の活動でOKR達成に最も貢献したものは？
2. **時間効率**: 「もっともらしい努力」に時間を使っていませんか？
3. **軌道修正**: エフェクチュエーション的観点で、何か調整すべきことは？
4. **来週重点**: 来週最も集中すべき1つのことは何？

## 追加コンテキスト
- 個人事業主の特性（上司がいない、完璧主義の罠、孤独感）を考慮
- 短期的な成果と長期的なビジョンのバランス
- 時間とエネルギーの制約を現実的に評価`;

    showGeneratedPrompt(prompt);
}

function generateImprovementPrompt() {
    const krList = okrData.keyResults.map(kr => 
        `- ${kr.text} (現在: ${Math.round(kr.current/kr.target*100)}%)`
    ).join('\n');
    
    const prompt = `# KR改善提案（エフェクチュエーション × OKR）

現在のKRの効果性を評価し、改善案を提案してください。

## 現在のKey Results
${krList || '未設定'}

## 改善分析の観点
1. **測定可能性**: 本当に進捗が測定できているか？
2. **行動誘発性**: このKRは具体的な行動を促すか？
3. **現実適応性**: 想定外の状況に柔軟に対応できるか？
4. **成果志向**: 「活動」ではなく「結果」にフォーカスしているか？

## 個人事業主特有の課題
- 完璧主義による先延ばし
- 上司がいないことによる甘え
- リソース制約（時間・資金・人脈）
- 市場変化への対応

## 提案形式
各KRについて：
- ✅ 良い点
- ⚠️ 改善点  
- 💡 具体的な修正案
- 🔄 柔軟性確保の方法

現実的で実行可能な改善案をお願いします。`;

    showGeneratedPrompt(prompt);
}

function showGeneratedPrompt(prompt) {
    document.getElementById('prompt-text').value = prompt;
    document.getElementById('generated-prompt').style.display = 'block';
    
    // スムーズにスクロール
    document.getElementById('generated-prompt').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function copyPrompt() {
    const promptText = document.getElementById('prompt-text');
    promptText.select();
    document.execCommand('copy');
    
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✅ コピーしました！';
    button.style.backgroundColor = '#27ae60';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 2000);
}

// モーダルの外側クリックで閉じる
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// キーボードショートカット
document.addEventListener('keydown', function(event) {
    // Escape キーでモーダルを閉じる
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    // Ctrl/Cmd + Enter で進捗記録
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (document.getElementById('progressModal').style.display === 'block') {
            saveProgress();
        }
    }
});

// 通知機能（ブラウザ通知をサポートしている場合）
function setupNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>'
        });
    }
}

// 週次リマインダー（金曜日17時に通知）
function checkWeeklyReminder() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=日曜日, 5=金曜日
    const hour = now.getHours();
    
    if (dayOfWeek === 5 && hour === 17) { // 金曜日17時
        showNotification('週次振り返りの時間です', 'OKRの進捗を振り返って、来週の計画を立てましょう');
    }
}

// 初期化時に通知設定
setupNotifications();
setInterval(checkWeeklyReminder, 3600000); // 1時間ごとにチェック

// KR調整理由の選択
function selectAdjustReason(reason) {
    const chatContainer = document.getElementById('adjustmentChat');
    
    const responses = {
        'too-easy': '素晴らしい進捗ですね！より挑戦的な目標に更新することで、さらなる成長が期待できます。どのKRを調整しますか？',
        'too-hard': '現実的な目標に調整することは賢明な判断です。エフェクチュエーション的には「手の内のもの」を活用して調整しましょう。どのKRが特に困難でしたか？',
        'priority-change': '柔軟な軌道修正は個人事業主の強みです！新しい優先順位について詳しく教えてください。',
        'new-opportunity': 'エフェクチュエーション的なアプローチですね！偶然の機会を活かすのは起業家の重要なスキルです。どのような機会が生まれましたか？'
    };
    
    const message = document.createElement('div');
    message.className = 'chat-message';
    message.innerHTML = `
        <div class="chat-avatar">🤖</div>
        <div class="chat-bubble">${responses[reason]}</div>
    `;
    chatContainer.appendChild(message);
    
    // 調整履歴を保存
    okrData.adjustmentHistory.push({
        date: new Date().toISOString(),
        reason: reason,
        description: responses[reason]
    });
    
    localStorage.setItem('okrManagerData', JSON.stringify(okrData));
}

// 気分選択
function selectMood(mood) {
    selectedMood = mood;
    
    // ボタンの見た目を更新
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.style.backgroundColor = btn.textContent.includes(mood) ? '#3498db' : 'white';
        btn.style.color = btn.textContent.includes(mood) ? 'white' : '#333';
    });
} 