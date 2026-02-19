// ============================================================
// tags.js — 태그/라벨 관리 모듈
// ============================================================

const Tags = {
    // 태그 목록 HTML 생성 (수정 가능)
    renderTagList(dealId, tags = [], editable = true) {
        const tagPills = (tags || []).map((tag, i) => {
            const bgColor = tag.color + '22';  // alpha
            const removeBtn = editable
                ? `<button class="tag-pill__remove" onclick="event.stopPropagation(); Tags.removeTag('${dealId}', ${i})">×</button>`
                : '';
            return `<span class="tag-pill" style="background:${bgColor}; color:${tag.color}; border-color:${tag.color}33">
                🏷️ ${tag.name}${removeBtn}
            </span>`;
        }).join('');

        if (!editable) return `<div class="tag-list">${tagPills}</div>`;

        const presetBtns = TAG_PRESETS.map(p => {
            const isActive = (tags || []).some(t => t.name === p.name);
            if (isActive) return '';
            return `<button class="tag-preset-btn" 
                style="color:${p.color}; border-color:${p.color}44"
                onclick="event.stopPropagation(); Tags.addPresetTag('${dealId}', '${p.name}', '${p.color}')">
                + ${p.name}
            </button>`;
        }).join('');

        return `
            <div class="tag-list">${tagPills}</div>
            <div class="tag-presets">${presetBtns}</div>
            <div class="tag-input-wrap">
                <input type="text" id="customTagInput_${dealId}" placeholder="커스텀 태그 입력..." 
                    onkeydown="if(event.key==='Enter'){event.preventDefault(); Tags.addCustomTag('${dealId}');}">
                <button class="btn btn-secondary btn-sm" onclick="Tags.addCustomTag('${dealId}')">+ 추가</button>
            </div>
        `;
    },

    // 프리셋 태그 추가
    addPresetTag(dealId, name, color) {
        const deal = Storage.getById(dealId);
        if (!deal) return;
        const tags = deal.tags || [];
        if (tags.some(t => t.name === name)) return;
        tags.push({ name, color });
        Storage.update(dealId, { tags });
        // 현재 상세 모달이 열려있으면 리렌더
        App.showDetail(dealId);
        App.refresh();
    },

    // 커스텀 태그 추가
    addCustomTag(dealId) {
        const input = document.getElementById(`customTagInput_${dealId}`);
        if (!input) return;
        const name = input.value.trim();
        if (!name) return;

        const deal = Storage.getById(dealId);
        if (!deal) return;
        const tags = deal.tags || [];
        if (tags.some(t => t.name === name)) {
            UI.showToast('이미 추가된 태그입니다.', 'error');
            return;
        }

        // 랜덤 색상 할당
        const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        tags.push({ name, color });
        Storage.update(dealId, { tags });
        input.value = '';
        App.showDetail(dealId);
        App.refresh();
        UI.showToast(`태그 "${name}" 추가됨`, 'success');
    },

    // 태그 제거
    removeTag(dealId, tagIndex) {
        const deal = Storage.getById(dealId);
        if (!deal) return;
        const tags = deal.tags || [];
        tags.splice(tagIndex, 1);
        Storage.update(dealId, { tags });
        App.showDetail(dealId);
        App.refresh();
    },

    // 카드용 간단 태그 표시
    renderCardTags(tags = []) {
        if (!tags || tags.length === 0) return '';
        return `<div class="tag-list" style="margin-top:6px;">
            ${tags.slice(0, 3).map(t => {
            const bgColor = t.color + '22';
            return `<span class="tag-pill" style="background:${bgColor}; color:${t.color}; border-color:${t.color}33; font-size:0.65rem; padding:2px 7px;">
                    ${t.name}
                </span>`;
        }).join('')}
            ${tags.length > 3 ? `<span style="font-size:0.65rem; color:var(--text-muted);">+${tags.length - 3}</span>` : ''}
        </div>`;
    }
};
