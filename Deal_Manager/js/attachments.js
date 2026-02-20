// ============================================================
// attachments.js — 첨부파일/문서 관리 모듈
// ============================================================

const Attachments = {
    // 문서 유형별 아이콘 매핑
    getIcon(name) {
        const n = (name || '').toLowerCase();
        if (n.includes('im') || n.includes('정보') || n.includes('memorandum')) return '📋';
        if (n.includes('재무') || n.includes('financial') || n.includes('제표')) return '📊';
        if (n.includes('nda') || n.includes('비밀') || n.includes('기밀')) return '🔒';
        if (n.includes('계약') || n.includes('contract')) return '📃';
        if (n.includes('실사') || n.includes('dd') || n.includes('due')) return '🔍';
        if (n.includes('보고') || n.includes('report')) return '📑';
        if (n.includes('제안') || n.includes('proposal')) return '💡';
        return '📎';
    },

    // 상세 모달용 첨부파일 목록 렌더
    renderList(dealId, attachments = []) {
        const items = (attachments || []).map((att, i) => `
            <div class="attachment-item">
                <span class="attachment-item__icon">${this.getIcon(att.name)}</span>
                <div class="attachment-item__info">
                    <div class="attachment-item__name">${att.name || '미명'}</div>
                    ${att.note ? `<div class="attachment-item__note">${att.note}</div>` : ''}
                </div>
                <span class="attachment-item__date">${att.addedAt ? formatDate(att.addedAt) : ''}</span>
                <button class="attachment-item__remove" onclick="Attachments.remove('${dealId}', ${i})" title="삭제">🗑️</button>
            </div>
        `).join('');

        return `
            <div class="attachment-list">
                ${items || '<p style="color:var(--text-muted); font-size:0.8rem;">등록된 첨부파일이 없습니다.</p>'}
            </div>
            <div class="attachment-add">
                <input type="text" id="attachName_${dealId}" placeholder="문서명 (예: IM자료, 재무제표, NDA)">
                <input type="text" id="attachNote_${dealId}" placeholder="비고/메모">
            </div>
            <div style="margin-top:var(--space-sm);">
                <button class="btn btn-secondary btn-sm" onclick="Attachments.add('${dealId}')">📎 첨부</button>
            </div>
        `;
    },

    // 첨부파일 추가
    add(dealId) {
        const nameInput = document.getElementById(`attachName_${dealId}`);
        const noteInput = document.getElementById(`attachNote_${dealId}`);
        if (!nameInput) return;

        const name = nameInput.value.trim();
        if (!name) {
            UI.showToast('문서명을 입력해주세요.', 'error');
            nameInput.focus();
            return;
        }

        const deal = Storage.getById(dealId);
        if (!deal) return;

        const attachments = deal.attachments || [];
        attachments.push({
            name,
            url: '',
            note: noteInput ? noteInput.value.trim() : '',
            addedAt: new Date().toISOString()
        });

        Storage.update(dealId, { attachments });
        nameInput.value = '';
        if (noteInput) noteInput.value = '';
        App.showDetail(dealId);
        UI.showToast(`"${name}" 첨부 완료`, 'success');
    },

    // 첨부파일 제거
    remove(dealId, index) {
        const deal = Storage.getById(dealId);
        if (!deal) return;
        const attachments = deal.attachments || [];
        const removed = attachments.splice(index, 1);
        Storage.update(dealId, { attachments });
        App.showDetail(dealId);
        UI.showToast(`"${removed[0]?.name || '문서'}" 삭제됨`, 'info');
    },

    // 카드용 간단 첨부파일 카운트
    renderCardCount(attachments = []) {
        if (!attachments || attachments.length === 0) return '';
        return `<span style="font-size:0.7rem; color:var(--text-muted);">📎 ${attachments.length}건</span>`;
    }
};
