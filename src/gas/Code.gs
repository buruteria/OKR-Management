/**
 * OKR Management Tool - Google Apps Script Backend
 * Google Sheets API統合用のバックエンドスクリプト
 */

// 設定
const CONFIG = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),
  SHEETS: {
    OKR_DATA: 'OKR_Data',
    PROGRESS: 'Progress_History',
    WEEKLY_REVIEW: 'Weekly_Reviews'
  }
};

/**
 * Web App のエントリーポイント
 */
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

/**
 * OKRデータの同期
 */
function syncOKRData(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CONFIG.SHEETS.OKR_DATA);
    
    // シートが存在しない場合は作成
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.OKR_DATA);
      initializeOKRSheet(sheet);
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
    
    // 既存データを更新または新規追加
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

/**
 * OKRデータの取得
 */
function getOKRData() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
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

/**
 * 進捗データの保存
 */
function saveProgress(progressData) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CONFIG.SHEETS.PROGRESS);
    
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.PROGRESS);
      initializeProgressSheet(sheet);
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

/**
 * 進捗履歴の取得
 */
function getProgressHistory(limit = 30) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
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
    })).reverse(); // 最新順に並び替え
    
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

/**
 * OKRシートの初期化
 */
function initializeOKRSheet(sheet) {
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
  sheet.setFrozenRows(1);
}

/**
 * 進捗シートの初期化
 */
function initializeProgressSheet(sheet) {
  const headers = [
    'Date',
    'Activity',
    'Result',
    'Related KRs',
    'Mood'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * 週次レポートの生成
 */
function generateWeeklyReport() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const progressSheet = ss.getSheetByName(CONFIG.SHEETS.PROGRESS);
    
    if (!progressSheet || progressSheet.getLastRow() <= 1) {
      return { success: false, message: '進捗データがありません' };
    }
    
    // 過去7日間のデータを取得
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const data = progressSheet.getDataRange().getValues();
    const weeklyData = data.filter(row => {
      const date = new Date(row[0]);
      return date >= weekAgo && date <= today;
    });
    
    // 週次統計の計算
    const stats = {
      totalActivities: weeklyData.length,
      moodDistribution: {},
      productiveDays: 0,
      completedKRs: new Set()
    };
    
    weeklyData.forEach(row => {
      const mood = row[4];
      stats.moodDistribution[mood] = (stats.moodDistribution[mood] || 0) + 1;
      
      if (row[2] && row[2].trim()) { // 成果があった日
        stats.productiveDays++;
      }
      
      const relatedKRs = JSON.parse(row[3] || '[]');
      relatedKRs.forEach(kr => stats.completedKRs.add(kr));
    });
    
    return {
      success: true,
      stats: stats,
      weeklyData: weeklyData
    };
    
  } catch (error) {
    Logger.log('Error in generateWeeklyReport: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * 設定のテスト用関数
 */
function testSetup() {
  Logger.log('Testing Google Apps Script setup...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    Logger.log('Spreadsheet access: OK');
    
    const testData = {
      northStar: 'テスト用North Star',
      objectives: [{ id: 1, text: 'テスト目標' }],
      keyResults: [{ id: 1, text: 'テストKR', current: 50, target: 100 }]
    };
    
    const result = syncOKRData(testData);
    Logger.log('Sync test result: ' + result.getContent());
    
    return 'Setup test completed successfully';
  } catch (error) {
    Logger.log('Setup test failed: ' + error.toString());
    return 'Setup test failed: ' + error.toString();
  }
}