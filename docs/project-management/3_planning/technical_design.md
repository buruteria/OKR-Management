# 技術設計書
## 個人事業主向けOKRマネジメントシステム

### 基本情報
- **作成日**: 2025年6月20日
- **バージョン**: 1.0
- **対象システム**: OKR Management Tool for Freelancers

---

## 1. システムアーキテクチャ概要

### 1.1 アーキテクチャ図
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                          │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   HTML/CSS    │  │ Vanilla JS   │  │  PWA Service    │  │
│  │  (UI/UX)      │  │ (Logic/API)  │  │     Worker      │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                         HTTPS/REST API
                               │
┌─────────────────────────────────────────────────────────────┐
│                  Google Apps Script Layer                  │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  API Gateway  │  │  AI Service  │  │  Data Service   │  │
│  │  (Routing)    │  │ Integration  │  │  (CRUD Ops)     │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                      Google APIs / AI APIs
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Data & External Layer                   │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Google Sheets │  │   AI APIs    │  │  Local Storage  │  │
│  │  (Database)   │  │ (OpenAI/etc) │  │    (Cache)      │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技術スタック詳細

#### Frontend
- **HTML5**: セマンティックマークアップ、PWA対応
- **CSS3**: CSS Grid/Flexbox、CSS Variables、アニメーション
- **Vanilla JavaScript**: ES6+、モジュールシステム、Service Worker
- **PWA**: マニフェスト、オフライン対応、プッシュ通知

#### Backend
- **Google Apps Script**: サーバーレス実行環境
- **Google Drive API**: ファイル操作、認証
- **Google Sheets API**: データベース操作

#### External Services
- **OpenAI API**: GPT-4 for OKR generation
- **Anthropic API**: Claude for dialogue analysis
- **Google AI API**: Gemini for backup processing

