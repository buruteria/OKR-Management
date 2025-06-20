/**
 * AI Assistant Module
 * AIアシスト型OKR設定システム
 */

class AIAssistant {
    constructor() {
        this.apiService = null;
        this.currentConversation = [];
        this.isProcessing = false;
        this.extractedData = null;
        
        this.initializeEventListeners();
    }

    /**
     * 初期化
     */
    init(apiService) {
        this.apiService = apiService;
        console.log('AI Assistant initialized');
    }

    /**
     * イベントリスナーの初期化
     */
    initializeEventListeners() {
        // AI対話の開始
        document.addEventListener('click', (e) => {
            if (e.target.id === 'start-ai-dialogue') {
                this.startAIDialogue();
            }
            if (e.target.id === 'send-ai-message') {
                this.sendMessage();
            }
            if (e.target.id === 'apply-extracted-okr') {
                this.applyExtractedOKR();
            }
            if (e.target.id === 'analyze-external-log') {
                this.analyzeExternalLog();
            }
        });

        // Enterキーでメッセージ送信
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'ai-input' && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    /**
     * AI対話の開始
     */
    startAIDialogue() {
        const dialogueContainer = document.getElementById('ai-dialogue-container');
        if (!dialogueContainer) return;

        dialogueContainer.innerHTML = `
            <div class="ai-dialogue-section">
                <div class="ai-dialogue-header">
                    <h3>🤖 AIアシスタント - OKR設定サポート</h3>
                    <p>あなたの目標や状況を自然な言葉で教えてください。AIが最適なOKRを提案します。</p>
                </div>
                
                <div class="conversation-area" id="conversation-area">
                    <div class="ai-message">
                        <div class="message-content">
                            <strong>AIアシスタント:</strong><br>
                            こんにちは！OKR設定をサポートします。<br><br>
                            まず、以下について教えてください：<br>
                            • 現在の事業状況や取り組み<br>
                            • 今期達成したい目標<br>
                            • 困っていることや課題<br><br>
                            どんなことでも構いません。自然な言葉で話しかけてください。
                        </div>
                    </div>
                </div>
                
                <div class="input-area">
                    <textarea id="ai-input" placeholder="例: 編集の仕事をしていて、今年は海外展開を考えています。ポートフォリオサイトを作って、note記事も書いて認知度を上げたいと思っています..."></textarea>
                    <div class="input-controls">
                        <button id="send-ai-message" class="send-btn">送信</button>
                        <button id="analyze-external-log" class="secondary-btn">外部ログ解析</button>
                    </div>
                </div>
                
                <div class="extraction-result" id="extraction-result" style="display: none;">
                    <h4>📋 抽出されたOKR</h4>
                    <div id="extracted-okr-content"></div>
                    <button id="apply-extracted-okr" class="apply-btn">このOKRを適用</button>
                </div>
            </div>
        `;

        // 対話履歴をリセット
        this.currentConversation = [];
        this.extractedData = null;
    }

    /**
     * メッセージ送信
     */
    async sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        if (!message || this.isProcessing) return;

        this.isProcessing = true;
        this.addUserMessage(message);
        input.value = '';

        try {
            // API呼び出し
            const response = await this.callAIAPI(message);
            this.addAIMessage(response.message);
            
            // OKR抽出の試行
            if (response.extractedOKR) {
                this.showExtractedOKR(response.extractedOKR);
            }
            
            this.currentConversation.push({
                user: message,
                ai: response.message,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('AI API Error:', error);
            this.addAIMessage('申し訳ありません。AIサービスに接続できませんでした。APIキーの設定を確認してください。');
        }
        
        this.isProcessing = false;
    }

    /**
     * ユーザーメッセージを追加
     */
    addUserMessage(message) {
        const conversationArea = document.getElementById('conversation-area');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>あなた:</strong><br>
                ${this.formatMessage(message)}
            </div>
        `;
        conversationArea.appendChild(messageDiv);
        conversationArea.scrollTop = conversationArea.scrollHeight;
    }

    /**
     * AIメッセージを追加
     */
    addAIMessage(message) {
        const conversationArea = document.getElementById('conversation-area');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>AIアシスタント:</strong><br>
                ${this.formatMessage(message)}
            </div>
        `;
        conversationArea.appendChild(messageDiv);
        conversationArea.scrollTop = conversationArea.scrollHeight;
    }

    /**
     * メッセージのフォーマット
     */
    formatMessage(message) {
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    /**
     * AI API呼び出し
     */
    async callAIAPI(userMessage) {
        if (!this.apiService) {
            throw new Error('API Service not initialized');
        }

        const prompt = this.buildOKRExtractionPrompt(userMessage);
        
        try {
            const response = await this.apiService.callAnthropic(prompt);
            
            // レスポンスからOKRを抽出
            const extractedOKR = this.extractOKRFromResponse(response);
            
            return {
                message: response,
                extractedOKR: extractedOKR
            };
        } catch (error) {
            console.error('Anthropic API Error:', error);
            throw error;
        }
    }

    /**
     * OKR抽出用プロンプトの構築
     */
    buildOKRExtractionPrompt(userMessage) {
        const conversationContext = this.currentConversation
            .map(conv => `ユーザー: ${conv.user}\nAI: ${conv.ai}`)
            .join('\n\n');

        return `あなたは個人事業主・フリーランス向けのOKR設定アシスタントです。

【これまでの会話】
${conversationContext}

【最新のユーザーメッセージ】
${userMessage}

【あなたの役割】
1. ユーザーの状況を理解し、適切な質問で詳細を引き出す
2. 十分な情報が得られたら、OKRを提案する
3. 個人事業主の実情に合った現実的なOKRを作成する

【OKR作成の原則】
- Objective: 定性的で志向性の高い目標（1-3個）
- Key Results: 定量的で測定可能な成果（各Objectiveに2-4個）
- 3ヶ月で達成可能な現実的なスコープ
- 個人事業主の限られたリソースを考慮

【出力形式】
通常の会話に加えて、OKRを提案する場合は以下の形式を含めてください：

---OKR_EXTRACTION_START---
{
  "northStar": "長期的なビジョン（1年後の理想像）",
  "objectives": [
    {
      "id": 1,
      "text": "Objective内容",
      "status": "active"
    }
  ],
  "keyResults": [
    {
      "id": 1,
      "objectiveId": 1,
      "text": "Key Result内容",
      "current": 0,
      "target": 目標値,
      "unit": "単位"
    }
  ]
}
---OKR_EXTRACTION_END---

まず、ユーザーの状況に共感し、適切な質問やアドバイスを行ってください。`;
    }

    /**
     * レスポンスからOKRを抽出
     */
    extractOKRFromResponse(response) {
        const startMarker = '---OKR_EXTRACTION_START---';
        const endMarker = '---OKR_EXTRACTION_END---';
        
        const startIndex = response.indexOf(startMarker);
        const endIndex = response.indexOf(endMarker);
        
        if (startIndex === -1 || endIndex === -1) {
            return null;
        }
        
        const jsonString = response.substring(
            startIndex + startMarker.length,
            endIndex
        ).trim();
        
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Failed to parse extracted OKR:', error);
            return null;
        }
    }

    /**
     * 抽出されたOKRを表示
     */
    showExtractedOKR(okrData) {
        const resultContainer = document.getElementById('extraction-result');
        const contentDiv = document.getElementById('extracted-okr-content');
        
        if (!resultContainer || !contentDiv) return;
        
        let html = `
            <div class="extracted-okr">
                <div class="north-star">
                    <h5>🌟 North Star (長期ビジョン)</h5>
                    <p>${okrData.northStar}</p>
                </div>
                
                <div class="objectives">
                    <h5>🎯 Objectives (目標)</h5>
        `;
        
        okrData.objectives.forEach(obj => {
            html += `
                <div class="objective-item">
                    <p><strong>O${obj.id}:</strong> ${obj.text}</p>
                    <div class="key-results">
            `;
            
            const relatedKRs = okrData.keyResults.filter(kr => kr.objectiveId === obj.id);
            relatedKRs.forEach(kr => {
                html += `
                    <div class="kr-item">
                        <span>KR${kr.id}: ${kr.text}</span>
                        <span class="kr-metrics">(${kr.current}/${kr.target} ${kr.unit})</span>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        contentDiv.innerHTML = html;
        resultContainer.style.display = 'block';
        this.extractedData = okrData;
    }

    /**
     * 抽出されたOKRを適用
     */
    applyExtractedOKR() {
        if (!this.extractedData) return;
        
        try {
            // North Star を設定
            const northStarInput = document.getElementById('north-star');
            if (northStarInput) {
                northStarInput.value = this.extractedData.northStar;
            }
            
            // Objectives を設定
            const objectivesContainer = document.getElementById('objectives-container');
            if (objectivesContainer) {
                this.extractedData.objectives.forEach(obj => {
                    this.addObjectiveToUI(obj);
                });
            }
            
            // Key Results を設定
            const keyResultsContainer = document.getElementById('key-results-container');
            if (keyResultsContainer) {
                this.extractedData.keyResults.forEach(kr => {
                    this.addKeyResultToUI(kr);
                });
            }
            
            // データ保存
            if (window.dataManager) {
                window.dataManager.saveOKRData({
                    northStar: this.extractedData.northStar,
                    objectives: this.extractedData.objectives,
                    keyResults: this.extractedData.keyResults
                });
            }
            
            // 成功メッセージ
            this.showNotification('OKRが正常に適用されました！', 'success');
            
            // OKR設定画面に移動
            this.switchToOKRSettings();
            
        } catch (error) {
            console.error('Failed to apply extracted OKR:', error);
            this.showNotification('OKRの適用に失敗しました。', 'error');
        }
    }

    /**
     * 外部ログ解析
     */
    analyzeExternalLog() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📄 外部AI対話ログ解析</h3>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>ChatGPTやClaudeとの対話ログを貼り付けてください。AIがOKRを自動抽出します。</p>
                    <textarea id="external-log-input" placeholder="ここに対話ログを貼り付けてください...&#10;&#10;例：&#10;User: 今年は編集の仕事を拡大したいと思っています...&#10;Assistant: それは素晴らしい目標ですね..."></textarea>
                    <div class="modal-actions">
                        <button onclick="this.closest('.modal-overlay').remove()" class="secondary-btn">キャンセル</button>
                        <button onclick="window.aiAssistant.processExternalLog()" class="primary-btn">解析開始</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * 外部ログの処理
     */
    async processExternalLog() {
        const input = document.getElementById('external-log-input');
        const logContent = input.value.trim();
        
        if (!logContent) {
            this.showNotification('ログ内容を入力してください。', 'warning');
            return;
        }
        
        this.isProcessing = true;
        
        try {
            const prompt = this.buildLogAnalysisPrompt(logContent);
            const response = await this.apiService.callAnthropic(prompt);
            
            // モーダルを閉じる
            document.querySelector('.modal-overlay').remove();
            
            // 解析結果を表示
            this.addAIMessage(`外部ログを解析しました：\n\n${response}`);
            
            // OKR抽出の試行
            const extractedOKR = this.extractOKRFromResponse(response);
            if (extractedOKR) {
                this.showExtractedOKR(extractedOKR);
            }
            
        } catch (error) {
            console.error('Log analysis error:', error);
            this.showNotification('ログ解析に失敗しました。', 'error');
        }
        
        this.isProcessing = false;
    }

    /**
     * ログ解析用プロンプトの構築
     */
    buildLogAnalysisPrompt(logContent) {
        return `以下は外部AIとの対話ログです。この内容を分析して、ユーザーのOKRを抽出してください。

【対話ログ】
${logContent}

【分析のポイント】
1. ユーザーの現在の状況・事業内容
2. 目標や願望
3. 抱えている課題
4. 具体的な行動計画

【出力要求】
1. まず、ログ内容の要約と分析
2. 抽出されたOKRを以下の形式で提示：

---OKR_EXTRACTION_START---
{
  "northStar": "長期的なビジョン",
  "objectives": [
    {
      "id": 1,
      "text": "Objective内容",
      "status": "active"
    }
  ],
  "keyResults": [
    {
      "id": 1,
      "objectiveId": 1,
      "text": "Key Result内容",
      "current": 0,
      "target": 目標値,
      "unit": "単位"
    }
  ]
}
---OKR_EXTRACTION_END---

分析を開始してください。`;
    }

    /**
     * ObjectiveをUIに追加
     */
    addObjectiveToUI(objective) {
        // 実装は既存のOKR設定機能と連携
        if (window.uiManager && window.uiManager.addObjective) {
            window.uiManager.addObjective(objective);
        }
    }

    /**
     * Key ResultをUIに追加
     */
    addKeyResultToUI(keyResult) {
        // 実装は既存のOKR設定機能と連携
        if (window.uiManager && window.uiManager.addKeyResult) {
            window.uiManager.addKeyResult(keyResult);
        }
    }

    /**
     * OKR設定画面に切り替え
     */
    switchToOKRSettings() {
        // 既存のナビゲーション機能を使用
        const okrSettingsTab = document.querySelector('[data-section="okr-settings"]');
        if (okrSettingsTab) {
            okrSettingsTab.click();
        }
    }

    /**
     * 通知表示
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// グローバルインスタンス
window.aiAssistant = new AIAssistant();