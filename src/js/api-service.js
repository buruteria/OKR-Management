// API Service Module
// Anthropic API と Google Sheets API の統合

class APIService {
    constructor() {
        this.anthropicApiKey = this.getApiKey('anthropic');
        this.googleSheetsConfig = this.getGoogleSheetsConfig();
        this.requestQueue = [];
        this.isOffline = false;
        
        // オフライン状態の監視
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    // API キーの取得（ローカルストレージから）
    getApiKey(service) {
        return localStorage.getItem(`${service}_api_key`) || '';
    }

    // API キーの設定
    setApiKey(service, key) {
        localStorage.setItem(`${service}_api_key`, key);
        if (service === 'anthropic') {
            this.anthropicApiKey = key;
        }
    }

    // Google Sheets設定の取得
    getGoogleSheetsConfig() {
        const config = localStorage.getItem('google_sheets_config');
        return config ? JSON.parse(config) : {
            spreadsheetId: '',
            sheetName: 'OKR_Data'
        };
    }

    // Google Sheets設定の保存
    setGoogleSheetsConfig(config) {
        localStorage.setItem('google_sheets_config', JSON.stringify(config));
        this.googleSheetsConfig = config;
    }

    // Anthropic API呼び出し
    async callAnthropicAPI(prompt, context = {}) {
        if (!this.anthropicApiKey) {
            throw new Error('Anthropic API キーが設定されていません');
        }

        const requestData = {
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: this.buildPrompt(prompt, context)
                }
            ]
        };

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.anthropicApiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                content: data.content[0].text,
                usage: data.usage
            };
        } catch (error) {
            console.error('Anthropic API Error:', error);
            
            // オフライン時はキューに追加
            if (this.isOffline) {
                this.requestQueue.push({
                    type: 'anthropic',
                    prompt,
                    context,
                    timestamp: Date.now()
                });
            }
            
            return {
                success: false,
                error: error.message,
                fallback: this.generateFallbackResponse(prompt, context)
            };
        }
    }

    // プロンプト構築
    buildPrompt(prompt, context) {
        const { okrData, currentObjective, keyResults } = context;
        
        let contextualPrompt = prompt;
        
        if (currentObjective) {
            contextualPrompt += `\n\n## 現在の目標\n${currentObjective}`;
        }
        
        if (keyResults && keyResults.length > 0) {
            contextualPrompt += `\n\n## Key Results\n${keyResults.map(kr => `- ${kr.text} (進捗: ${Math.round(kr.current/kr.target*100)}%)`).join('\n')}`;
        }
        
        return contextualPrompt;
    }

    // フォールバック応答生成
    generateFallbackResponse(prompt, context) {
        // プロンプトタイプに基づく簡易応答
        if (prompt.includes('優先順位')) {
            return {
                content: "AIサービスに接続できません。今日の最重要タスクを1つ選んで集中しましょう。",
                type: 'fallback'
            };
        } else if (prompt.includes('振り返り')) {
            return {
                content: "AIサービスに接続できません。今週の成果と来週の課題を整理してみましょう。",
                type: 'fallback'
            };
        } else {
            return {
                content: "AIサービスに接続できません。後でもう一度お試しください。",
                type: 'fallback'
            };
        }
    }

    // Google Sheets API 呼び出し（簡易版）
    async syncToGoogleSheets(data) {
        if (!this.googleSheetsConfig.spreadsheetId) {
            console.warn('Google Sheets設定が不完全です');
            return { success: false, error: 'Google Sheets未設定' };
        }

        try {
            // Google Apps Script Web App へのPOST
            const response = await fetch(this.googleSheetsConfig.webAppUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'sync_okr_data',
                    data: data,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`Sheets sync failed: ${response.status}`);
            }

            const result = await response.json();
            return { success: true, result };
        } catch (error) {
            console.error('Google Sheets Sync Error:', error);
            
            // オフライン時はキューに追加
            if (this.isOffline) {
                this.requestQueue.push({
                    type: 'sheets',
                    data,
                    timestamp: Date.now()
                });
            }
            
            return { success: false, error: error.message };
        }
    }

    // オンライン復帰時の処理
    async handleOnline() {
        this.isOffline = false;
        console.log('オンラインに復帰しました');
        
        // キューされたリクエストを処理
        const queuedRequests = [...this.requestQueue];
        this.requestQueue = [];
        
        for (const request of queuedRequests) {
            try {
                if (request.type === 'anthropic') {
                    await this.callAnthropicAPI(request.prompt, request.context);
                } else if (request.type === 'sheets') {
                    await this.syncToGoogleSheets(request.data);
                }
            } catch (error) {
                console.error('Queued request failed:', error);
            }
        }
    }

    // オフライン時の処理
    handleOffline() {
        this.isOffline = true;
        console.log('オフラインモードに移行しました');
    }

    // OKR自動生成
    async generateOKRFromConversation(conversationText) {
        const prompt = `
個人事業主向けOKR生成アシスタントとして、以下の会話内容からObjectiveとKey Resultsを抽出・提案してください。

# 会話内容
${conversationText}

# 出力形式
以下のJSON形式で出力してください：

{
  "objective": "四半期の目標（Objective）",
  "keyResults": [
    "測定可能なKR1",
    "測定可能なKR2", 
    "測定可能なKR3"
  ],
  "reasoning": "なぜこのOKRを提案するのかの理由"
}

# 個人事業主向けの考慮点
- 現実的なリソース制約を考慮
- 測定可能で具体的な成果指標
- エフェクチュエーション的な柔軟性
- 完璧主義の罠を避ける表現
        `;

        const result = await this.callAnthropicAPI(prompt);
        
        if (result.success) {
            try {
                const parsedResult = JSON.parse(result.content);
                return {
                    success: true,
                    objective: parsedResult.objective,
                    keyResults: parsedResult.keyResults,
                    reasoning: parsedResult.reasoning
                };
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                return {
                    success: false,
                    error: 'AI応答の解析に失敗しました',
                    rawContent: result.content
                };
            }
        } else {
            return result;
        }
    }

    // 日次コーチング
    async generateDailyCoaching(okrData, progressHistory) {
        const prompt = `
あなたは個人事業主のOKR達成をサポートするAIコーチです。

# 現在の状況
- Objective: ${okrData.objectives[0]?.text || '未設定'}
- Key Results: ${okrData.keyResults.map(kr => `${kr.text} (${Math.round(kr.current/kr.target*100)}%)`).join(', ')}
- 最近の進捗: ${progressHistory.slice(-3).map(p => p.activity).join(', ')}

# コーチング内容
1. 今日の最重要タスク（1つだけ）
2. 避けるべき完璧主義の罠
3. エフェクチュエーション的な柔軟性のポイント

簡潔で実行可能なアドバイスをお願いします。
        `;

        return await this.callAnthropicAPI(prompt, { okrData, progressHistory });
    }
}

// シングルトンインスタンス
const apiService = new APIService();
export default apiService;