/**
 * Modern OKR Management Tool - Main JavaScript
 * モダンデザイン版のメインスクリプト
 */

class ModernOKRManager {
    constructor() {
        this.currentData = {
            northStar: '',
            objectives: [],
            keyResults: [],
            progressHistory: [],
            settings: {}
        };
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.initializeEventListeners();
        this.updateDashboard();
        this.initializeAnimations();
    }
    
    /**
     * イベントリスナーの初期化
     */
    initializeEventListeners() {
        // ナビゲーション
        this.initNavigation();
        
        // フォーム処理
        this.initFormHandlers();
        
        // インタラクティブ要素
        this.initInteractiveElements();
        
        // キーボードショートカット
        this.initKeyboardShortcuts();
    }
    
    /**
     * ナビゲーションの初期化
     */
    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.section');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(item);
            });
        });
    }
    
    navigateToSection(navItem) {
        const targetSection = navItem.getAttribute('data-section');
        
        // アクティブ状態を更新
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');
        
        // セクション切り替え
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        const target = document.getElementById(targetSection);
        if (target) {
            target.classList.add('active');
            
            // アニメーション付きスクロール
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // セクション固有の初期化
            this.initSectionSpecific(targetSection);
        }
    }
    
    /**
     * セクション固有の初期化
     */
    initSectionSpecific(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.updateDashboard();
                this.animateStats();
                break;
            case 'ai-assist':
                this.initAIAssist();
                break;
            case 'okr-manual':
                this.initManualOKRForm();
                break;
            case 'progress':
                this.loadProgressHistory();
                break;
            case 'review':
                this.initWeeklyReview();
                break;
        }
    }
    
    /**
     * フォームハンドラーの初期化
     */
    initFormHandlers() {
        // North Star保存
        const northStarInput = document.getElementById('northStarInput');
        if (northStarInput) {
            northStarInput.addEventListener('blur', () => {
                this.saveNorthStar(northStarInput.value);
            });
        }
        
        // OKR保存ボタン
        const saveOKRBtn = document.getElementById('saveOKR');
        if (saveOKRBtn) {
            saveOKRBtn.addEventListener('click', () => {
                this.saveOKRData();
            });
        }
        
        // Objective追加ボタン
        const addObjectiveBtn = document.getElementById('addObjective');
        if (addObjectiveBtn) {
            addObjectiveBtn.addEventListener('click', () => {
                this.addObjectiveForm();
            });
        }
        
        // Key Result追加ボタン
        const addKeyResultBtn = document.getElementById('addKeyResult');
        if (addKeyResultBtn) {
            addKeyResultBtn.addEventListener('click', () => {
                this.addKeyResultForm();
            });
        }
    }
    
    /**
     * インタラクティブ要素の初期化
     */
    initInteractiveElements() {
        // カードホバーエフェクト
        this.initCardHoverEffects();
        
        // ボタンリップルエフェクト
        this.initRippleEffects();
        
        // プログレスバーアニメーション
        this.initProgressAnimations();
    }
    
    /**
     * カードホバーエフェクトの初期化
     */
    initCardHoverEffects() {
        const cards = document.querySelectorAll('.action-card, .stat-card, .content-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.animateCardHover(e.target, true);
            });
            
            card.addEventListener('mouseleave', (e) => {
                this.animateCardHover(e.target, false);
            });
        });
    }
    
    animateCardHover(card, isHovering) {
        if (isHovering) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '';
        }
    }
    
    /**
     * リップルエフェクトの初期化
     */
    initRippleEffects() {
        const buttons = document.querySelectorAll('.btn, .action-card');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e);
            });
        });
    }
    
    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // CSSアニメーション用のスタイル
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple-animation 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    /**
     * キーボードショートカットの初期化
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + 数字でセクション切り替え
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '7') {
                e.preventDefault();
                const sectionIndex = parseInt(e.key) - 1;
                const navItems = document.querySelectorAll('.nav-item');
                if (navItems[sectionIndex]) {
                    navItems[sectionIndex].click();
                }
            }
            
            // Escキーでモーダルを閉じる
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    /**
     * アニメーションの初期化
     */
    initializeAnimations() {
        // CSS変数でアニメーションを追加
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes countUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .animate-count-up {
                animation: countUp 0.8s ease-out;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * ダッシュボードの更新
     */
    updateDashboard() {
        this.updateNorthStarDisplay();
        this.updateOKRGrid();
        this.updateStatistics();
    }
    
    updateNorthStarDisplay() {
        const display = document.getElementById('northStarDisplay');
        if (display) {
            if (this.currentData.northStar) {
                display.textContent = this.currentData.northStar;
            } else {
                display.textContent = 'まだ設定されていません。AI OKR設定から始めましょう。';
            }
        }
    }
    
    updateOKRGrid() {
        const grid = document.getElementById('okrGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.currentData.objectives.forEach(objective => {
            const objectiveElement = this.createObjectiveElement(objective);
            grid.appendChild(objectiveElement);
        });
        
        if (this.currentData.objectives.length === 0) {
            grid.innerHTML = `
                <div class="content-card" style="text-align: center; padding: var(--space-12);">
                    <h3 style="color: var(--color-gray-600); margin-bottom: var(--space-4);">OKRが設定されていません</h3>
                    <p style="color: var(--color-gray-500); margin-bottom: var(--space-6);">
                        AI OKR設定または手動設定でOKRを作成しましょう
                    </p>
                    <button class="btn btn-primary" onclick="document.querySelector('[data-section=\"ai-assist\"]').click()">
                        AI OKR設定を開始
                    </button>
                </div>
            `;
        }
    }
    
    createObjectiveElement(objective) {
        const relatedKRs = this.currentData.keyResults.filter(kr => kr.objectiveId === objective.id);
        const avgProgress = relatedKRs.length > 0 
            ? relatedKRs.reduce((sum, kr) => sum + (kr.current / kr.target * 100), 0) / relatedKRs.length
            : 0;
        
        const element = document.createElement('div');
        element.className = 'okr-objective';
        element.innerHTML = `
            <div class="objective-header">
                <h3 class="objective-title">${objective.text}</h3>
                <span class="objective-status status-${objective.status}">${objective.status}</span>
            </div>
            <div class="kr-list">
                ${relatedKRs.map(kr => this.createKRElement(kr)).join('')}
            </div>
        `;
        
        return element;
    }
    
    createKRElement(kr) {
        const progress = Math.min((kr.current / kr.target) * 100, 100);
        
        return `
            <div class="kr-item">
                <div class="kr-header">
                    <span class="kr-title">${kr.text}</span>
                    <span class="kr-metrics">${kr.current}/${kr.target} ${kr.unit}</span>
                </div>
                <div class="kr-progress">
                    <div class="kr-progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * 統計情報の更新とアニメーション
     */
    updateStatistics() {
        const stats = this.calculateStatistics();
        
        // アニメーション付きで数値を更新
        this.animateNumber('activeObjectives', stats.activeObjectives);
        this.animateNumber('completionRate', `${stats.completionRate}%`);
        this.animateNumber('weeklyProgress', stats.weeklyProgress);
        this.animateNumber('daysLeft', stats.daysLeft);
    }
    
    calculateStatistics() {
        const activeObjectives = this.currentData.objectives.filter(obj => obj.status === 'active').length;
        const totalKRs = this.currentData.keyResults.length;
        const completedKRs = this.currentData.keyResults.filter(kr => kr.current >= kr.target).length;
        const completionRate = totalKRs > 0 ? Math.round((completedKRs / totalKRs) * 100) : 0;
        
        // 今週の進捗計算（仮の実装）
        const weeklyProgress = this.currentData.progressHistory.filter(p => {
            const date = new Date(p.date);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
        }).length;
        
        // 残り日数計算（四半期末まで）
        const now = new Date();
        const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
        const daysLeft = Math.max(0, Math.ceil((quarterEnd - now) / (24 * 60 * 60 * 1000)));
        
        return {
            activeObjectives,
            completionRate,
            weeklyProgress,
            daysLeft
        };
    }
    
    animateNumber(elementId, finalValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const isPercentage = String(finalValue).includes('%');
        const numericValue = parseFloat(String(finalValue).replace('%', ''));
        let currentValue = 0;
        const increment = numericValue / 30; // 30フレームでアニメーション
        
        element.classList.add('animate-count-up');
        
        const animation = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                currentValue = numericValue;
                clearInterval(animation);
            }
            
            const displayValue = Math.round(currentValue);
            element.textContent = isPercentage ? `${displayValue}%` : displayValue;
        }, 16); // 60fps
    }
    
    animateStats() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'slideUp 0.6s ease-out';
            }, index * 100);
        });
    }
    
    /**
     * AI アシスト機能の初期化
     */
    initAIAssist() {
        // AI対話の初期化は既存のai-assistant.jsに委譲
        if (window.aiAssistant) {
            console.log('AI Assistant ready for modern interface');
        }
    }
    
    /**
     * 手動OKRフォームの初期化
     */
    initManualOKRForm() {
        this.loadOKRFormData();
    }
    
    loadOKRFormData() {
        const northStarInput = document.getElementById('northStarInput');
        if (northStarInput && this.currentData.northStar) {
            northStarInput.value = this.currentData.northStar;
        }
        
        this.renderObjectiveForms();
        this.renderKeyResultForms();
    }
    
    renderObjectiveForms() {
        const container = document.getElementById('objectivesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.currentData.objectives.forEach((objective, index) => {
            const form = this.createObjectiveForm(objective, index);
            container.appendChild(form);
        });
    }
    
    createObjectiveForm(objective, index) {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <input type="text" class="form-input" value="${objective.text}" 
                       placeholder="Objective ${index + 1}" 
                       data-objective-id="${objective.id}">
                <button class="btn btn-ghost btn-sm" onclick="this.removeObjective(${objective.id})">削除</button>
            </div>
        `;
        return div;
    }
    
    addObjectiveForm() {
        const newObjective = {
            id: Date.now(),
            text: '',
            status: 'active'
        };
        
        this.currentData.objectives.push(newObjective);
        this.renderObjectiveForms();
    }
    
    renderKeyResultForms() {
        const container = document.getElementById('keyResultsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.currentData.keyResults.forEach((kr, index) => {
            const form = this.createKeyResultForm(kr, index);
            container.appendChild(form);
        });
    }
    
    createKeyResultForm(kr, index) {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <div class="grid" style="grid-template-columns: 2fr 80px 80px 80px auto; gap: var(--space-3);">
                <input type="text" class="form-input" value="${kr.text}" 
                       placeholder="Key Result ${index + 1}" 
                       data-kr-id="${kr.id}">
                <input type="number" class="form-input" value="${kr.current}" 
                       placeholder="現在" data-kr-field="current">
                <input type="number" class="form-input" value="${kr.target}" 
                       placeholder="目標" data-kr-field="target">
                <input type="text" class="form-input" value="${kr.unit}" 
                       placeholder="単位" data-kr-field="unit">
                <button class="btn btn-ghost btn-sm" onclick="this.removeKeyResult(${kr.id})">削除</button>
            </div>
        `;
        return div;
    }
    
    addKeyResultForm() {
        const newKR = {
            id: Date.now(),
            objectiveId: this.currentData.objectives[0]?.id || 1,
            text: '',
            current: 0,
            target: 100,
            unit: ''
        };
        
        this.currentData.keyResults.push(newKR);
        this.renderKeyResultForms();
    }
    
    /**
     * データの保存と読み込み
     */
    saveNorthStar(value) {
        this.currentData.northStar = value;
        this.saveData();
        this.updateNorthStarDisplay();
        this.showNotification('North Starを保存しました', 'success');
    }
    
    saveOKRData() {
        // フォームからデータを収集
        this.collectFormData();
        this.saveData();
        this.updateDashboard();
        this.showNotification('OKRを保存しました', 'success');
    }
    
    collectFormData() {
        // North Star
        const northStarInput = document.getElementById('northStarInput');
        if (northStarInput) {
            this.currentData.northStar = northStarInput.value;
        }
        
        // Objectives
        const objectiveInputs = document.querySelectorAll('[data-objective-id]');
        objectiveInputs.forEach(input => {
            const id = parseInt(input.getAttribute('data-objective-id'));
            const objective = this.currentData.objectives.find(obj => obj.id === id);
            if (objective) {
                objective.text = input.value;
            }
        });
        
        // Key Results
        const krInputs = document.querySelectorAll('[data-kr-id]');
        krInputs.forEach(input => {
            const id = parseInt(input.getAttribute('data-kr-id'));
            const kr = this.currentData.keyResults.find(k => k.id === id);
            if (kr) {
                kr.text = input.value;
            }
        });
    }
    
    saveData() {
        try {
            localStorage.setItem('okr-modern-data', JSON.stringify(this.currentData));
        } catch (error) {
            console.error('Failed to save data:', error);
            this.showNotification('データの保存に失敗しました', 'error');
        }
    }
    
    loadData() {
        try {
            const saved = localStorage.getItem('okr-modern-data');
            if (saved) {
                this.currentData = { ...this.currentData, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }
    
    /**
     * 通知システム
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // アニメーション
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out';
        }, 10);
        
        // 自動削除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * モーダル管理
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.remove());
    }
    
    /**
     * 進捗履歴の読み込み
     */
    loadProgressHistory() {
        // 実装予定
        console.log('Loading progress history...');
    }
    
    /**
     * 週次レビューの初期化
     */
    initWeeklyReview() {
        // 実装予定
        console.log('Initializing weekly review...');
    }
}

// CSS追加アニメーション
const additionalStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
    }
    
    .notification.success {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    }
    
    .notification.error {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    }
    
    .notification.info {
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// スタイルを追加
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// グローバルインスタンス
window.modernOKRManager = new ModernOKRManager();