// ============================================================
// app.js — 앱 초기화 및 이벤트 바인딩
// ============================================================

const App = {
    // State
    currentSearch: '',
    currentIndustry: '',
    currentStatus: '',
    currentRevenue: '',
    currentSort: 'newest',
    currentView: 'grid',

    // ---- Init ----
    init() {
        // 샘플 데이터 초기화
        Storage.initWithSampleData();

        // 필터 초기화
        UI.initFilters();

        // 이벤트 바인딩
        this.bindEvents();

        // 고급 필터 프리셋 렌더링
        AdvFilter.renderPresets();

        // 초기 렌더링
        this.refresh();

        // 알림 체크
        Notifications.showStartupAlerts();
    },

    // ---- Events ----
    bindEvents() {
        // Search
        const searchInput = document.getElementById('searchInput');
        let searchTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                this.currentSearch = e.target.value.trim();
                this.renderFilteredList();
            }, 200);
        });

        // Filters
        document.getElementById('filterIndustry').addEventListener('change', (e) => {
            this.currentIndustry = e.target.value;
            this.renderFilteredList();
        });

        document.getElementById('filterStatus').addEventListener('change', (e) => {
            this.currentStatus = e.target.value;
            this.renderFilteredList();
        });

        document.getElementById('filterRevenue').addEventListener('change', (e) => {
            this.currentRevenue = e.target.value;
            this.renderFilteredList();
        });

        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderFilteredList();
        });

        // Modal close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UI.closeAllModals();
            }
        });
    },

    // ---- Refresh all ----
    refresh() {
        const allDeals = Storage.getAll();
        UI.renderDashboard(allDeals);
        this.renderFilteredList();
        Compare.updateBar();
        if (this.currentView === 'kanban') {
            Kanban.render();
        }
    },

    // ---- Filtered & Sorted List ----
    renderFilteredList() {
        let deals = Storage.getAll();

        // Search
        if (this.currentSearch) {
            const q = this.currentSearch.toLowerCase();
            deals = deals.filter(d =>
                (d.companyName && d.companyName.toLowerCase().includes(q)) ||
                (d.industry && d.industry.toLowerCase().includes(q)) ||
                (d.location && d.location.toLowerCase().includes(q)) ||
                (d.coreCompetency && d.coreCompetency.toLowerCase().includes(q)) ||
                (d.memo && d.memo.toLowerCase().includes(q))
            );
        }

        // Industry filter
        if (this.currentIndustry) {
            deals = deals.filter(d => d.industry === this.currentIndustry);
        }

        // Status filter
        if (this.currentStatus) {
            deals = deals.filter(d => d.status === this.currentStatus);
        }

        // Revenue filter
        if (this.currentRevenue) {
            const range = REVENUE_RANGES.find(r => r.label === this.currentRevenue);
            if (range) {
                deals = deals.filter(d => {
                    const rev = Number(d.revenue);
                    if (isNaN(rev)) return false;
                    return rev >= range.min && rev < range.max;
                });
            }
        }

        // Sort
        switch (this.currentSort) {
            case 'newest':
                deals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                deals.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'revenue-high':
                deals.sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0));
                break;
            case 'revenue-low':
                deals.sort((a, b) => (Number(a.revenue) || 0) - (Number(b.revenue) || 0));
                break;
            case 'price-high':
                deals.sort((a, b) => (Number(b.askingPrice) || 0) - (Number(a.askingPrice) || 0));
                break;
            case 'price-low':
                deals.sort((a, b) => (Number(a.askingPrice) || 0) - (Number(b.askingPrice) || 0));
                break;
            case 'name':
                deals.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
                break;
        }

        // Advanced filter
        if (AdvFilter.isActive()) {
            deals = AdvFilter.apply(deals);
        }

        UI.renderDealList(deals, Compare.selectedIds);
    },

    // ---- Deal Actions ----
    showDetail(dealId) {
        const deal = Storage.getById(dealId);
        if (deal) {
            UI.renderDetail(deal);
        }
    },

    showNewForm() {
        UI.renderForm(null);
    },

    showEditForm(dealId) {
        UI.closeModal('detailModal');
        const deal = Storage.getById(dealId);
        if (deal) {
            UI.renderForm(deal);
        }
    },

    saveDeal() {
        const form = document.getElementById('dealForm');
        if (!form) return;

        // Validate
        const companyName = form.querySelector('[name="companyName"]').value.trim();
        const industry = form.querySelector('[name="industry"]').value;

        if (!companyName) {
            UI.showToast('회사명을 입력해주세요.', 'error');
            form.querySelector('[name="companyName"]').focus();
            return;
        }
        if (!industry) {
            UI.showToast('업종을 선택해주세요.', 'error');
            form.querySelector('[name="industry"]').focus();
            return;
        }

        const isEdit = form.querySelector('[name="isEdit"]').value === 'true';
        const id = form.querySelector('[name="id"]').value;

        const data = {};
        const fields = [
            'companyName', 'industry', 'location', 'foundedYear', 'employeeCount',
            'revenue', 'operatingProfit', 'netIncome', 'totalAssets', 'debtRatio',
            'saleReason', 'askingPrice', 'sharePercentage', 'dealStructure',
            'coreCompetency', 'memo', 'status', 'deadline'
        ];

        fields.forEach(field => {
            const el = form.querySelector(`[name="${field}"]`);
            if (!el) return;
            let val = el.value;
            if (['revenue', 'operatingProfit', 'netIncome', 'totalAssets', 'debtRatio',
                'askingPrice', 'sharePercentage', 'foundedYear', 'employeeCount'].includes(field)) {
                val = val === '' ? '' : Number(val);
            }
            data[field] = val;
        });

        if (isEdit) {
            Storage.update(id, data);
            UI.showToast('딜 정보가 수정되었습니다.', 'success');
        } else {
            const newDeal = createDeal(data);
            Storage.add(newDeal);
            UI.showToast('새 딜이 등록되었습니다.', 'success');
        }

        UI.closeModal('formModal');
        this.refresh();
    },

    deleteDeal(dealId) {
        if (!confirm('이 딜을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        Storage.remove(dealId);
        Compare.selectedIds = Compare.selectedIds.filter(id => id !== dealId);
        UI.showToast('딜이 삭제되었습니다.', 'info');
        UI.closeModal('detailModal');
        this.refresh();
    },

    // ---- Compare ----
    toggleCompare(dealId, checked) {
        Compare.toggle(dealId, checked);
    },

    // ---- Favorites ----
    toggleFavorite(dealId) {
        const deal = Storage.getAll().find(d => d.id === dealId);
        if (!deal) return;
        Storage.update(dealId, { isFavorite: !deal.isFavorite });
        this.refresh();
        UI.showToast(
            deal.isFavorite ? '즐겨찾기가 해제되었습니다.' : '즐겨찾기에 추가되었습니다.',
            'success'
        );
    },

    showCompare() {
        Compare.showComparison();
    },

    clearCompare() {
        Compare.clearAll();
    },

    // ---- CSV ----
    showCSVImport() {
        CSV.showImportModal();
    },

    exportCSV() {
        CSV.exportCSV();
    },

    // ---- Print ----
    printAll() {
        PrintReport.printAll();
    },

    // ---- Reset ----
    resetData() {
        if (!confirm('모든 데이터를 샘플 데이터로 초기화하시겠습니까?')) return;
        Storage.reset();
        Compare.clearAll();
        UI.showToast('데이터가 초기화되었습니다.', 'info');
        this.refresh();
    },

    // ---- View Toggle ----
    setView(view) {
        this.currentView = view;
        const gridEl = document.getElementById('dealGrid');
        const kanbanEl = document.getElementById('kanbanView');
        const btnGrid = document.getElementById('viewGrid');
        const btnKanban = document.getElementById('viewKanban');

        if (view === 'kanban') {
            if (gridEl) gridEl.style.display = 'none';
            if (kanbanEl) kanbanEl.style.display = 'block';
            if (btnGrid) btnGrid.classList.remove('active');
            if (btnKanban) btnKanban.classList.add('active');
            Kanban.render();
        } else {
            if (gridEl) gridEl.style.display = '';
            if (kanbanEl) kanbanEl.style.display = 'none';
            if (btnGrid) btnGrid.classList.add('active');
            if (btnKanban) btnKanban.classList.remove('active');
        }
    },

    // ---- Advanced Filter ----
    filterByStatus(status) {
        // 상태 필터 드롭다운 업데이트
        const statusFilter = document.getElementById('filterStatus');
        if (statusFilter) statusFilter.value = status;
        this.currentStatus = status;
        this.renderFilteredList();

        // 딜 그리드로 스크롤
        const grid = document.getElementById('dealGrid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    toggleAdvFilter() {
        const panel = document.getElementById('advFilterPanel');
        if (panel) panel.classList.toggle('collapsed');
    },

    applyAdvFilter() {
        this.renderFilteredList();
        UI.showToast('고급 필터가 적용되었습니다.', 'info');
    },

    clearAdvFilter() {
        AdvFilter.clear();
        this.renderFilteredList();
        UI.showToast('고급 필터가 초기화되었습니다.', 'info');
    },

    saveFilterPreset() {
        const name = prompt('필터 프리셋 이름을 입력하세요:');
        if (!name || !name.trim()) return;
        AdvFilter.savePreset(name.trim());
        UI.showToast(`필터 "${name.trim()}" 저장 완료`, 'success');
    }
};

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
