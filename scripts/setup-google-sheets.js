/**
 * Google Sheets セットアップ自動化スクリプト
 * OKR Management Tool用のGoogle Sheetsとの連携を簡単にセットアップ
 */

class GoogleSheetsSetup {
    constructor() {
        this.spreadsheetId = null;
        this.webAppUrl = null;
        this.setupComplete = false;
    }

    /**
     * セットアップウィザードを開始
     */
    async startSetup() {
        console.log('🎯 OKR Management Tool - Google Sheets セットアップ開始');
        
        try {
            // Step 1: スプレッドシート作成の案内
            await this.guideSpreadsheetCreation();
            
            // Step 2: Apps Script設定の案内
            await this.guideAppsScriptSetup();
            
            // Step 3: デプロイ設定の案内
            await this.guideDeployment();
            
            // Step 4: OKRツール連携設定
            await this.setupOKRToolIntegration();
            
            console.log('✅ セットアップが完了しました！');
            
        } catch (error) {
            console.error('❌ セットアップ中にエラーが発生しました:', error);
            throw error;
        }
    }

    /**
     * Step 1: スプレッドシート作成の案内
     */
    async guideSpreadsheetCreation() {
        console.log('\n📊 Step 1: スプレッドシートの作成');
        console.log('次のURLをクリックして、テンプレートスプレッドシートを作成してください:');
        console.log('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/copy?title=OKR%20Management%20Tool%20-%20Data');
        
        // ユーザーの入力を待つ（実際の実装では、UIからの入力を待つ）
        this.spreadsheetId = await this.waitForUserInput('作成されたスプレッドシートのIDを入力してください:');
        
        console.log(`✅ スプレッドシートID: ${this.spreadsheetId}`);
    }

    /**
     * Step 2: Apps Script設定の案内
     */
    async guideAppsScriptSetup() {
        console.log('\n⚡ Step 2: Apps Script の設定');
        console.log('作成したスプレッドシートで以下を実行してください:');
        console.log('1. 「拡張機能」→「Apps Script」をクリック');
        console.log('2. 既存コードを削除');
        console.log('3. 提供されたコードをコピー＆ペースト');
        console.log('4. 「保存」をクリック');
        console.log('5. setupOKRManagement() 関数を実行');
        
        const appsScriptCode = this.getAppsScriptCode();
        
        // クリップボードにコピー（ブラウザ環境の場合）
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(appsScriptCode);
                console.log('📋 Apps Scriptコードがクリップボードにコピーされました');
            } catch (err) {
                console.log('⚠️ 自動コピーに失敗しました。手動でコピーしてください。');
            }
        }
        
        await this.waitForUserConfirmation('Apps Scriptの設定が完了したら、Enterキーを押してください');
    }

    /**
     * Step 3: デプロイ設定の案内
     */
    async guideDeployment() {
        console.log('\n🚀 Step 3: Web App としてデプロイ');
        console.log('Apps Scriptエディタで以下を実行してください:');
        console.log('1. 「デプロイ」→「新しいデプロイ」をクリック');
        console.log('2. 種類: ウェブアプリ');
        console.log('3. 実行者: 自分');
        console.log('4. アクセス: 全員');
        console.log('5. 「デプロイ」をクリック');
        console.log('6. 表示されたWeb App URLをコピー');
        
        this.webAppUrl = await this.waitForUserInput('Web App URLを入力してください:');
        
        console.log(`✅ Web App URL: ${this.webAppUrl}`);
    }

    /**
     * Step 4: OKRツール連携設定
     */
    async setupOKRToolIntegration() {
        console.log('\n⚙️ Step 4: OKRツールとの連携設定');
        
        const settings = {
            spreadsheetId: this.spreadsheetId,
            webAppUrl: this.webAppUrl,
            setupDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        // ローカルストレージに設定を保存
        this.saveSettings(settings);
        
        console.log('設定が保存されました:');
        console.log(`- Spreadsheet ID: ${settings.spreadsheetId}`);
        console.log(`- Web App URL: ${settings.webAppUrl}`);
        console.log(`- セットアップ日時: ${settings.setupDate}`);
        
        this.setupComplete = true;
    }

    /**
     * Apps Scriptコードを取得
     */
    getAppsScriptCode() {
        return `/**
 * OKR Management Tool - Google Apps Script Backend
 * 自動生成されたバックエンドスクリプト
 */

const CONFIG = {
  SPREADSHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  SHEETS: {
    OKR_DATA: 'OKR_Data',
    PROGRESS: 'Progress_History',
    WEEKLY_REVIEW: 'Weekly_Reviews'
  }
};

/**
 * 初期セットアップ関数 - 最初に必ず実行してください
 */
function setupOKRManagement() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // 必要なシートを作成
    setupOKRDataSheet(ss);
    setupProgressSheet(ss);
    setupWeeklyReviewSheet(ss);
    
    Logger.log('OKR Management setup completed successfully!');
    
    return {
      success: true,
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      message: 'セットアップが完了しました'
    };
  } catch (error) {
    Logger.log('Setup error: ' + error.toString());
    throw error;
  }
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    switch (action) {
      case 'sync_okr_data':
        return syncOKRData(requestData.data);
      case 'get_okr_data':
        return getOKRData();
      case 'save_progress':
        return saveProgress(requestData.data);
      case 'get_progress_history':
        return getProgressHistory();
      case 'test_connection':
        return testConnection();
      default:
        throw new Error('Invalid action: ' + action);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testConnection() {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Google Sheets API connection successful!',
      timestamp: new Date().toISOString(),
      spreadsheetId: CONFIG.SPREADSHEET_ID
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function syncOKRData(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEETS.OKR_DATA);
    
    if (!sheet) {
      sheet = setupOKRDataSheet(ss);
    }
    
    const timestamp = new Date();
    const row = [
      timestamp,
      data.northStar || '',
      JSON.stringify(data.objectives || []),
      JSON.stringify(data.keyResults || []),
      JSON.stringify(data.progressHistory || []),
      JSON.stringify(data.adjustmentHistory || []),
      JSON.stringify(data.weeklyReviews || [])
    ];
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(lastRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'OKRデータが正常に同期されました',
        timestamp: timestamp.toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in syncOKRData: ' + error.toString());
    throw error;
  }
}

function getOKRData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.OKR_DATA);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: {},
          message: 'データが見つかりません'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(lastRow, 1, 1, 7).getValues()[0];
    
    const okrData = {
      timestamp: data[0],
      northStar: data[1],
      objectives: JSON.parse(data[2] || '[]'),
      keyResults: JSON.parse(data[3] || '[]'),
      progressHistory: JSON.parse(data[4] || '[]'),
      adjustmentHistory: JSON.parse(data[5] || '[]'),
      weeklyReviews: JSON.parse(data[6] || '[]')
    };
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: okrData
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in getOKRData: ' + error.toString());
    throw error;
  }
}

function saveProgress(progressData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEETS.PROGRESS);
    
    if (!sheet) {
      sheet = setupProgressSheet(ss);
    }
    
    const row = [
      new Date(progressData.date),
      progressData.activity || '',
      progressData.result || '',
      JSON.stringify(progressData.relatedKRs || []),
      progressData.mood || '😐'
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '進捗データが保存されました'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in saveProgress: ' + error.toString());
    throw error;
  }
}

function getProgressHistory(limit = 30) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.PROGRESS);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: [],
          message: '進捗データが見つかりません'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const lastRow = sheet.getLastRow();
    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;
    
    const data = sheet.getRange(startRow, 1, numRows, 5).getValues();
    
    const progressHistory = data.map(row => ({
      date: row[0].toISOString(),
      activity: row[1],
      result: row[2],
      relatedKRs: JSON.parse(row[3] || '[]'),
      mood: row[4]
    })).reverse();
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: progressHistory
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in getProgressHistory: ' + error.toString());
    throw error;
  }
}

function setupOKRDataSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.OKR_DATA);
  
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  
  sheet = ss.insertSheet(CONFIG.SHEETS.OKR_DATA);
  
  const headers = [
    'Timestamp',
    'North Star',
    'Objectives', 
    'Key Results',
    'Progress History',
    'Adjustment History',
    'Weekly Reviews'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4299e1');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('white');
  sheet.setFrozenRows(1);
  
  // サンプルデータを追加
  const sampleData = [
    new Date(),
    '編集者×海外商社モデルを確立し、日本の専門知・文化を海外展開する事業で月50万円を達成している',
    JSON.stringify([{
      id: 1,
      text: 'ポートフォリオ公開を起点に、海外展開可能な事業の種を見つけ、収益化の初期検証を完了する',
      status: 'active'
    }]),
    JSON.stringify([
      {
        id: 1,
        objectiveId: 1,
        text: '6月30日までにポートフォリオサイトを公開し、7月中に新規問い合わせを5件獲得する',
        current: 3,
        target: 5,
        unit: '件'
      },
      {
        id: 2,
        objectiveId: 1,
        text: 'note記事3本を公開し、合計200いいね以上獲得する',
        current: 120,
        target: 200,
        unit: 'いいね'
      }
    ]),
    '[]',
    '[]',
    '[]'
  ];
  
  sheet.appendRow(sampleData);
  
  return sheet;
}

function setupProgressSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.PROGRESS);
  
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  
  sheet = ss.insertSheet(CONFIG.SHEETS.PROGRESS);
  
  const headers = [
    'Date',
    'Activity', 
    'Result',
    'Related KRs',
    'Mood'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#48bb78');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('white');
  sheet.setFrozenRows(1);
  
  const today = new Date();
  const sampleData = [
    [
      new Date(today.getTime() - 86400000),
      'ポートフォリオサイトのデザイン検討',
      '参考サイトを5つピックアップし、デザインの方向性を決定',
      JSON.stringify([1]),
      '😊'
    ],
    [
      today,
      'note記事の執筆', 
      '「海外展開の可能性」について2000文字の記事を完成',
      JSON.stringify([2]),
      '😄'
    ]
  ];
  
  sampleData.forEach(row => sheet.appendRow(row));
  
  return sheet;
}

function setupWeeklyReviewSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.WEEKLY_REVIEW);
  
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  
  sheet = ss.insertSheet(CONFIG.SHEETS.WEEKLY_REVIEW);
  
  const headers = [
    'Week Ending',
    'Achievements',
    'Challenges', 
    'Next Week Focus',
    'Mood Rating',
    'Notes'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#ed8936');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('white');
  sheet.setFrozenRows(1);
  
  return sheet;
}`;
    }

    /**
     * 設定をローカルストレージに保存
     */
    saveSettings(settings) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('okr-google-sheets-config', JSON.stringify(settings));
        } else {
            // Node.js環境などの場合
            console.log('設定:', JSON.stringify(settings, null, 2));
        }
    }

    /**
     * ユーザー入力を待つ（デモ用）
     */
    async waitForUserInput(prompt) {
        console.log(prompt);
        // 実際の実装では、UIからの入力を待つか、プロンプトを表示
        return new Promise((resolve) => {
            // デモ用のデフォルト値
            setTimeout(() => {
                if (prompt.includes('スプレッドシート')) {
                    resolve('demo-spreadsheet-id-12345');
                } else if (prompt.includes('Web App')) {
                    resolve('https://script.google.com/macros/s/demo-web-app-url/exec');
                }
            }, 1000);
        });
    }

    /**
     * ユーザー確認を待つ
     */
    async waitForUserConfirmation(message) {
        console.log(message);
        // 実際の実装では、ユーザーの確認を待つ
        return new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
    }

    /**
     * セットアップ状況を確認
     */
    checkSetupStatus() {
        if (typeof localStorage !== 'undefined') {
            const config = localStorage.getItem('okr-google-sheets-config');
            return config ? JSON.parse(config) : null;
        }
        return null;
    }

    /**
     * 接続テスト
     */
    async testConnection() {
        const config = this.checkSetupStatus();
        if (!config) {
            throw new Error('セットアップが完了していません');
        }

        try {
            const response = await fetch(config.webAppUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'test_connection'
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Google Sheets接続テスト成功');
                return result;
            } else {
                throw new Error(result.error || '接続テストに失敗しました');
            }
        } catch (error) {
            console.error('❌ Google Sheets接続テスト失敗:', error);
            throw error;
        }
    }
}

// エクスポート（ブラウザ環境とNode.js環境の両方に対応）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleSheetsSetup;
} else if (typeof window !== 'undefined') {
    window.GoogleSheetsSetup = GoogleSheetsSetup;
}