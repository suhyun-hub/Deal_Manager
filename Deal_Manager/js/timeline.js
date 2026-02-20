// ============================================================
// timeline.js — 메모/타임라인 기능
// ============================================================

const Timeline = {
    currentDealId: null,

    render(deal) {
        this.currentDealId = deal.id;
        const container = document.getElementById('detailTimeline');
        if (!container) return;

        const entries = deal.timeline || [];

        // Sort by date descending (newest first)
        const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = `
            <div class="timeline__add">
                <input type="text" id="timelineInput" placeholder="새 메모 입력 (예: 1차 미팅 완료)" 
                    onkeydown="if(event.key==='Enter') Timeline.add()">
                <button class="btn btn-primary btn-sm" onclick="Timeline.add()">추가</button>
            </div>
            ${sorted.length > 0 ? `
                <div class="timeline" style="margin-top: var(--space-lg);">
                    ${sorted.map((entry, idx) => {
            // Find original index for deletion
            const origIdx = entries.indexOf(entry);
            return `
                            <div class="timeline__item">
                                <div class="timeline__date">${formatDateTime(entry.date)}</div>
                                <div class="timeline__content">
                                    ${entry.content}
                                    <button class="btn-ghost btn-sm" 
                                        style="float:right; padding:2px 6px; font-size:0.7rem; color:var(--text-muted);"
                                        onclick="Timeline.remove(${origIdx})"
                                        data-tooltip="삭제">✕</button>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            ` : `
                <div style="color:var(--text-muted); font-size:0.85rem; margin-top:var(--space-md); text-align:center;">
                    진행 메모가 없습니다. 위에서 새 메모를 추가하세요.
                </div>
            `}
        `;
    },

    add() {
        const input = document.getElementById('timelineInput');
        if (!input) return;
        const content = input.value.trim();
        if (!content) {
            UI.showToast('메모 내용을 입력해주세요.', 'error');
            return;
        }

        Storage.addTimelineEntry(this.currentDealId, content);
        UI.showToast('메모가 추가되었습니다.', 'success');

        // Re-render
        const deal = Storage.getById(this.currentDealId);
        if (deal) {
            this.render(deal);
        }
    },

    remove(entryIndex) {
        if (!confirm('이 메모를 삭제하시겠습니까?')) return;

        Storage.removeTimelineEntry(this.currentDealId, entryIndex);
        UI.showToast('메모가 삭제되었습니다.', 'info');

        const deal = Storage.getById(this.currentDealId);
        if (deal) {
            this.render(deal);
        }
    }
};
