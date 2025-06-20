// Settings Management Module
// API設定とアプリケーション設定の管理

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
    }

    // 設定の読み込み
    loadSettings() {
        const defaultSettings = {
            apiKeys: {
                anthropic: '',
                googleSheets: {
                    spreadsheetId: '',
                    webAppUrl: '',
                    sheetName: 'OKR_Data'
                }
            },
            preferences: {
                theme: 'light',
                language: 'ja',
                notifications: {
                    dailyReminder: true,
                    weeklyReview: true,
                    progressMilestone: true
                },
                privacy: {
                    dataSync: false,
                    analyticsOptIn: false
                }
            },
            backup: {
                autoBackup: true,
                backupFrequency: 'daily',
                maxBackups: 7
            }
        };

        const saved = localStorage.getItem('okr_settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    // 設定の保存
    saveSettings() {
        localStorage.setItem('okr_settings', JSON.stringify(this.settings));
    }

    // API キーの設定
    setApiKey(service, key) {
        if (service === 'anthropic') {
            this.settings.apiKeys.anthropic = key;
        } else if (service === 'googleSheets') {
            this.settings.apiKeys.googleSheets = { ...this.settings.apiKeys.googleSheets, ...key };
        }
        this.saveSettings();
    }

    // API キーの取得
    getApiKey(service) {
        return this.settings.apiKeys[service] || {};
    }

    // 設定UIの表示
    showSettingsModal() {
        const modal = this.createSettingsModal();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    // 設定モーダルの作成
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'settingsModal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h2 class="modal-title">⚙️ アプリケーション設定</h2>
                    <button class="close-button" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="settings-tabs">
                        <button class="settings-tab active" onclick="showSettingsTab('api')">API設定</button>
                        <button class="settings-tab" onclick="showSettingsTab('preferences')">基本設定</button>
                        <button class="settings-tab" onclick="showSettingsTab('backup')">バックアップ</button>
                    </div>
                    
                    <!-- API設定タブ -->
                    <div id="api-settings" class="settings-content active">
                        <h3>🤖 Anthropic API設定</h3>
                        <div class="form-group">
                            <label class="form-label">API Key</label>
                            <input type="password" id="anthropic-key" class="form-input" 
                                   placeholder="sk-ant-..." 
                                   value="${this.settings.apiKeys.anthropic}">
                            <small style="color: #7f8c8d;">
                                Anthropic Console から取得したAPI Keyを入力してください。
                                ローカルに保存され、外部に送信されることはありません。
                            </small>
                        </div>
                        
                        <h3 style="margin-top: 30px;">📊 Google Sheets設定</h3>
                        <div class="form-group">
                            <label class="form-label">Spreadsheet ID</label>
                            <input type="text" id="sheets-id" class="form-input" 
                                   placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                                   value="${this.settings.apiKeys.googleSheets.spreadsheetId}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Web App URL（Google Apps Script）</label>
                            <input type="text" id="webapp-url" class="form-input" 
                                   placeholder="https://script.google.com/macros/s/.../exec"
                                   value="${this.settings.apiKeys.googleSheets.webAppUrl}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">シート名</label>
                            <input type="text" id="sheet-name" class="form-input" 
                                   value="${this.settings.apiKeys.googleSheets.sheetName}">
                        </div>
                    </div>
                    
                    <!-- 基本設定タブ -->
                    <div id="preferences-settings" class="settings-content">
                        <h3>🔔 通知設定</h3>
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="daily-reminder" 
                                       ${this.settings.preferences.notifications.dailyReminder ? 'checked' : ''}>
                                <span>日次リマインダー（午前9時）</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="weekly-review" 
                                       ${this.settings.preferences.notifications.weeklyReview ? 'checked' : ''}>
                                <span>週次振り返り（金曜日17時）</span>
                            </label>
                        </div>
                        
                        <h3 style="margin-top: 30px;">🔒 プライバシー設定</h3>
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="data-sync" 
                                       ${this.settings.preferences.privacy.dataSync ? 'checked' : ''}>
                                <span>データ同期を有効にする</span>
                            </label>
                            <small style="color: #7f8c8d; margin-left: 30px;">
                                Google Sheetsとの自動同期を行います
                            </small>
                        </div>
                    </div>
                    
                    <!-- バックアップタブ -->
                    <div id="backup-settings" class="settings-content">
                        <h3>💾 データバックアップ</h3>
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="auto-backup" 
                                       ${this.settings.backup.autoBackup ? 'checked' : ''}>
                                <span>自動バックアップを有効にする</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="form-label">バックアップ頻度</label>
                            <select id="backup-frequency" class="form-input">
                                <option value="daily" ${this.settings.backup.backupFrequency === 'daily' ? 'selected' : ''}>毎日</option>
                                <option value="weekly" ${this.settings.backup.backupFrequency === 'weekly' ? 'selected' : ''}>毎週</option>
                                <option value="manual" ${this.settings.backup.backupFrequency === 'manual' ? 'selected' : ''}>手動のみ</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <button class="button button-secondary" onclick="settingsManager.exportData()">
                                📤 データをエクスポート
                            </button>
                            <button class="button button-secondary" onclick="document.getElementById('import-file').click()">
                                📥 データをインポート
                            </button>
                            <input type="file" id="import-file" accept=".json" style="display: none;" 
                                   onchange="settingsManager.importData(event)">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                        <button class="button button-secondary" onclick="this.closest('.modal').remove()">キャンセル</button>
                        <button class="button button-primary" onclick="settingsManager.saveSettingsFromModal()">設定を保存</button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    // モーダルから設定を保存
    saveSettingsFromModal() {
        // API設定
        this.settings.apiKeys.anthropic = document.getElementById('anthropic-key').value;
        this.settings.apiKeys.googleSheets.spreadsheetId = document.getElementById('sheets-id').value;
        this.settings.apiKeys.googleSheets.webAppUrl = document.getElementById('webapp-url').value;
        this.settings.apiKeys.googleSheets.sheetName = document.getElementById('sheet-name').value;
        
        // 基本設定
        this.settings.preferences.notifications.dailyReminder = document.getElementById('daily-reminder').checked;
        this.settings.preferences.notifications.weeklyReview = document.getElementById('weekly-review').checked;
        this.settings.preferences.privacy.dataSync = document.getElementById('data-sync').checked;
        
        // バックアップ設定
        this.settings.backup.autoBackup = document.getElementById('auto-backup').checked;
        this.settings.backup.backupFrequency = document.getElementById('backup-frequency').value;
        
        this.saveSettings();
        
        // API Serviceに設定を反映
        if (window.apiService) {
            window.apiService.setApiKey('anthropic', this.settings.apiKeys.anthropic);
            window.apiService.setGoogleSheetsConfig(this.settings.apiKeys.googleSheets);
        }
        
        document.getElementById('settingsModal').remove();
        alert('設定が保存されました！');
    }

    // データエクスポート
    exportData() {
        const data = {
            okrData: JSON.parse(localStorage.getItem('okrManagerData') || '{}'),
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `okr-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // データインポート
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('現在のデータを上書きしますか？この操作は元に戻せません。')) {
                    if (data.okrData) {
                        localStorage.setItem('okrManagerData', JSON.stringify(data.okrData));
                    }
                    if (data.settings) {
                        this.settings = data.settings;
                        this.saveSettings();
                    }
                    
                    alert('データがインポートされました！ページを再読み込みしてください。');
                    location.reload();
                }
            } catch (error) {
                alert('無効なファイル形式です。');
            }
        };
        reader.readAsText(file);
    }
}

// 設定タブの切り替え
function showSettingsTab(tabName) {
    // タブボタンの状態更新
    document.querySelectorAll('.settings-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // コンテンツの表示切り替え
    document.querySelectorAll('.settings-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-settings`).classList.add('active');
}

// グローバルインスタンス
const settingsManager = new SettingsManager();
window.settingsManager = settingsManager;