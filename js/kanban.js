// ============================================================
// kanban.js — 파이프라인(칸반) 뷰 모듈
// ============================================================

const Kanban = {
    dragDealId: null,

    render() {
        const container = document.getElementById('kanbanBoard');
        if (!container) return;

        const deals = Storage.getAll();
        const statuses = Object.values(DEAL_STATUS);

        const statusIcons = {
            '신규': '🆕', '검토중': '🔍', '관심': '⭐',
            '미팅진행': '🤝', '완료': '✅', '보류': '⏸️'
        };

        const statusColors = {
            '신규': '#a78bfa', '검토중': '#fbbf24', '관심': '#34d399',
            '미팅진행': '#60a5fa', '완료': '#22d3ee', '보류': '#94a3b8'
        };

        container.innerHTML = statuses.map(status => {
            const statusDeals = deals.filter(d => d.status === status);
            const color = statusColors[status] || '#6366f1';

            return `
                <div class="kanban-column" data-status="${status}" 
                     ondragover="Kanban.onDragOver(event)" 
                     ondrop="Kanban.onDrop(event, '${status}')"
                     ondragenter="Kanban.onDragEnter(event)"
                     ondragleave="Kanban.onDragLeave(event)">
                    <div class="kanban-column__header" style="--col-color: ${color}">
                        <span class="kanban-column__title">
                            ${statusIcons[status] || '📌'} ${status}
                        </span>
                        <span class="kanban-column__count">${statusDeals.length}</span>
                    </div>
                    <div class="kanban-column__cards">
                        ${statusDeals.map(deal => this._renderCard(deal, color)).join('')}
                        ${statusDeals.length === 0 ? '<div class="kanban-empty">딜 없음</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    _renderCard(deal, color) {
        const favStar = deal.isFavorite ? '<span style="margin-left:auto;">⭐</span>' : '';
        const ddayHtml = deal.deadline
            ? `<span class="dday-badge ${getDdayClass(deal.deadline)}" style="font-size:0.6rem; padding:2px 6px;">⏰ ${formatDday(deal.deadline)}</span>`
            : '';
        const tagsHtml = (deal.tags || []).slice(0, 2).map(t =>
            `<span style="font-size:0.6rem; padding:1px 6px; border-radius:10px; background:${t.color}22; color:${t.color};">${t.name}</span>`
        ).join('');

        return `
            <div class="kanban-card" draggable="true" 
                 data-deal-id="${deal.id}"
                 ondragstart="Kanban.onDragStart(event, '${deal.id}')"
                 ondragend="Kanban.onDragEnd(event)"
                 onclick="App.showDetail('${deal.id}')"
                 style="--card-accent: ${color}">
                <div class="kanban-card__header">
                    <span class="kanban-card__company">${deal.companyName || '미입력'}</span>
                    ${favStar}
                </div>
                <div class="kanban-card__meta">
                    <span>${deal.industry || '미분류'}</span>
                    ${ddayHtml}
                </div>
                <div class="kanban-card__financials">
                    <span>매출 ${formatCurrency(deal.revenue)}</span>
                    <span>희망가 ${formatCurrency(deal.askingPrice)}</span>
                </div>
                ${tagsHtml ? `<div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:4px;">${tagsHtml}</div>` : ''}
            </div>
        `;
    },

    // ---- Drag & Drop ----
    onDragStart(e, dealId) {
        this.dragDealId = dealId;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    },

    onDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('drag-over'));
    },

    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    onDragEnter(e) {
        e.preventDefault();
        const col = e.target.closest('.kanban-column');
        if (col) col.classList.add('drag-over');
    },

    onDragLeave(e) {
        const col = e.target.closest('.kanban-column');
        if (col && !col.contains(e.relatedTarget)) {
            col.classList.remove('drag-over');
        }
    },

    onDrop(e, newStatus) {
        e.preventDefault();
        const col = e.target.closest('.kanban-column');
        if (col) col.classList.remove('drag-over');

        if (!this.dragDealId) return;

        const deal = Storage.getById(this.dragDealId);
        if (!deal) return;

        const oldStatus = deal.status;
        if (oldStatus === newStatus) return;

        Storage.update(this.dragDealId, { status: newStatus });
        Storage.addTimelineEntry(this.dragDealId, `상태 변경: ${oldStatus} → ${newStatus}`);

        UI.showToast(`${deal.companyName}: ${oldStatus} → ${newStatus}`, 'success');
        this.dragDealId = null;

        // Refresh kanban + dashboard
        this.render();
        App.refresh();
    }
};
