# 🎯 Google Sheets 簡単セットアップガイド

OKR Management ToolとGoogle Sheetsの連携を**5分で**完了させるための簡単ガイドです。

## 🚀 クイックスタート（推奨）

### 📋 準備するもの
- Googleアカウント
- ブラウザ（Chrome/Edge/Safari）

### ⚡ 自動セットアップ（最短ルート）

1. **セットアップページを開く**
   ```
   templates/google-sheets-template.html をブラウザで開く
   ```

2. **「スプレッドシートテンプレートを作成」をクリック**
   - 新しいタブでGoogleスプレッドシートが開きます
   - 自動的にOKR用のシートが作成されます

3. **Apps Scriptをセットアップ**
   - スプレッドシートで「拡張機能」→「Apps Script」
   - 表示されたコードをコピー＆ペースト
   - `setupOKRManagement()` 関数を実行

4. **Web Appとして公開**
   - 「デプロイ」→「新しいデプロイ」
   - 種類: ウェブアプリ、実行者: 自分、アクセス: 全員
   - 生成されたURLをコピー

5. **OKRツールで設定**
   - OKRツールの「⚙️設定」→「API設定」
   - スプレッドシートIDとWeb App URLを入力

## 📝 手動セットアップ（詳細版）

### Step 1: スプレッドシート作成

1. **新しいGoogleスプレッドシートを作成**
   ```
   https://sheets.google.com/ → 空白のスプレッドシート
   ```

2. **スプレッドシート名を変更**
   ```
   「OKR Management Tool - Data」
   ```

### Step 2: Apps Script設定

1. **Apps Scriptを開く**
   - スプレッドシートで「拡張機能」→「Apps Script」

2. **コードを置き換え**
   - `scripts/setup-google-sheets.js` 内の Apps Script コードをコピー
   - 既存コードを削除し、新しいコードをペースト

3. **初期セットアップを実行**
   ```javascript
   // 関数選択で「setupOKRManagement」を選択して実行
   setupOKRManagement()
   ```

### Step 3: Web App公開

1. **デプロイ設定**
   - 「デプロイ」→「新しいデプロイ」
   - 種類: ウェブアプリ
   - 実行者: 自分
   - アクセス: 全員（匿名ユーザーを含む）

2. **権限許可**
   - 初回実行時に権限の許可が必要
   - 「詳細設定」→「安全でないページに移動」で許可

3. **URLを保存**
   - 生成されたWeb App URLをメモ

### Step 4: OKRツール連携

1. **OKRツールを開く**
   ```
   src/index.html をブラウザで開く
   ```

2. **API設定**
   - サイドバーの「⚙️ 設定」をクリック
   - 「API設定」タブを選択

3. **Google Sheets設定を入力**
   ```
   Spreadsheet ID: [作成したスプレッドシートのID]
   Web App URL: [デプロイしたWeb App URL]
   ```

4. **設定を保存**
   - 「設定を保存」をクリック
   - 接続テストが自動実行されます

## 🔍 設定値の確認方法

### Spreadsheet IDの取得
スプレッドシートのURLから取得：
```
https://docs.google.com/spreadsheets/d/【この部分がSpreadsheet ID】/edit
```

### Web App URLの確認
Apps Scriptのデプロイ画面で確認：
```
https://script.google.com/macros/s/【ランダムな文字列】/exec
```

## ✅ 動作確認

### 接続テスト
1. OKRツールの「設定」画面で「接続テスト」ボタンをクリック
2. 「✅ 接続成功」が表示されればOK

### データ同期テスト
1. OKRツールで簡単なデータを入力
2. 「同期」ボタンをクリック
3. Googleスプレッドシートでデータが反映されていることを確認

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### ❌ 「権限エラー」が発生する
**解決方法:**
- Apps Scriptの実行権限を確認
- Google アカウントでの認証を再実行
- スプレッドシートの共有設定を確認

#### ❌ 「接続テストに失敗」
**解決方法:**
1. Web App URLが正しいか確認
2. Apps Scriptが正しくデプロイされているか確認
3. ブラウザのキャッシュをクリア

#### ❌ 「データが同期されない」
**解決方法:**
1. Spreadsheet IDが正しいか確認
2. Apps Scriptの `setupOKRManagement()` 関数が実行済みか確認
3. スプレッドシートに必要なシートが作成されているか確認

#### ❌ 「スクリプトエラー」が発生
**解決方法:**
1. Apps Scriptのコードが完全にコピーされているか確認
2. `setupOKRManagement()` 関数を再実行
3. エラーログを確認（Apps Script エディタのログ）

## 📊 作成されるシート構成

セットアップ完了後、以下のシートが作成されます：

### 1. OKR_Data
- タイムスタンプ
- North Star（長期ビジョン）
- Objectives（目標）
- Key Results（主要成果）
- 進捗履歴
- 調整履歴
- 週次レビュー

### 2. Progress_History
- 日付
- 活動内容
- 成果
- 関連KR
- 気分

### 3. Weekly_Reviews
- 週末日
- 達成事項
- 課題
- 来週の焦点
- 気分評価
- メモ

## 🔒 セキュリティとプライバシー

### データの保存場所
- **ローカル**: ブラウザのローカルストレージ
- **クラウド**: あなたのGoogleスプレッドシート（プライベート）
- **外部送信**: Anthropic API（設定時のみ）

### プライバシー保護
- スプレッドシートはあなたのGoogleアカウントでのみアクセス可能
- APIキーはローカルに暗号化保存
- 第三者にデータは送信されません

## 📞 サポート

### セットアップで困ったら
1. **自動セットアップページ**: `templates/google-sheets-template.html`
2. **詳細ガイド**: `docs/setup-guide.md`
3. **技術仕様**: `docs/project-management/3_planning/technical_design.md`

### よくある質問
**Q: 複数のデバイスで同期できますか？**
A: はい。同じSpreadsheet IDとWeb App URLを設定すれば、複数デバイスで同期できます。

**Q: データの バックアップは必要ですか？**
A: Googleスプレッドシートが自動バックアップとして機能します。追加で「設定」→「バックアップ」からJSONエクスポートも可能です。

**Q: 無料で使えますか？**
A: Google Sheets APIは無料枠内で十分利用可能です。Anthropic APIは使用量に応じた従量課金です。

---

🎯 **このガイドに従って、効果的なOKR管理を始めましょう！**