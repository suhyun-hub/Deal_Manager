// ============================================================
// advfilter.js — 고급 필터 & 프리셋 저장/불러오기
// ============================================================

const FILTER_PRESETS_KEY = 'megainfo_filter_presets';

const AdvFilter = {
    // 현재 고급 필터 값 수집
    getValues() {
        return {
            revenueMin: document.getElementById('advRevenueMin')?.value || '',
            revenueMax: document.getElementById('advRevenueMax')?.value || '',
            priceMin: document.getElementById('advPriceMin')?.value || '',
            priceMax: document.getElementById('advPriceMax')?.value || '',
            tag: document.getElementById('advTagFilter')?.value?.trim() || '',
            favOnly: document.getElementById('advFavOnly')?.value || '',
            deadline: document.getElementById('advDeadline')?.value || ''
        };
    },

    // 필터값 UI에 세팅
    setValues(vals) {
        if (vals.revenueMin !== undefined) document.getElementById('advRevenueMin').value = vals.revenueMin;
        if (vals.revenueMax !== undefined) document.getElementById('advRevenueMax').value = vals.revenueMax;
        if (vals.priceMin !== undefined) document.getElementById('advPriceMin').value = vals.priceMin;
        if (vals.priceMax !== undefined) document.getElementById('advPriceMax').value = vals.priceMax;
        if (vals.tag !== undefined) document.getElementById('advTagFilter').value = vals.tag;
        if (vals.favOnly !== undefined) document.getElementById('advFavOnly').value = vals.favOnly;
        if (vals.deadline !== undefined) document.getElementById('advDeadline').value = vals.deadline;
    },

    // 필터 초기화
    clear() {
        this.setValues({ revenueMin: '', revenueMax: '', priceMin: '', priceMax: '', tag: '', favOnly: '', deadline: '' });
    },

    // 딜 배열에 고급 필터 적용
    apply(deals) {
        const v = this.getValues();
        let filtered = [...deals];

        // 매출 범위
        if (v.revenueMin) {
            const min = Number(v.revenueMin);
            filtered = filtered.filter(d => (Number(d.revenue) || 0) >= min);
        }
        if (v.revenueMax) {
            const max = Number(v.revenueMax);
            filtered = filtered.filter(d => (Number(d.revenue) || 0) <= max);
        }

        // 희망가격 범위
        if (v.priceMin) {
            const min = Number(v.priceMin);
            filtered = filtered.filter(d => (Number(d.askingPrice) || 0) >= min);
        }
        if (v.priceMax) {
            const max = Number(v.priceMax);
            filtered = filtered.filter(d => (Number(d.askingPrice) || 0) <= max);
        }

        // 태그 필터
        if (v.tag) {
            const keyword = v.tag.toLowerCase();
            filtered = filtered.filter(d =>
                (d.tags || []).some(t => t.name.toLowerCase().includes(keyword))
            );
        }

        // 즐겨찾기만
        if (v.favOnly === 'yes') {
            filtered = filtered.filter(d => d.isFavorite);
        }

        // 마감임박
        if (v.deadline) {
            filtered = filtered.filter(d => {
                if (!d.deadline) return false;
                const dday = calcDday(d.deadline);
                if (v.deadline === 'overdue') return dday > 0;
                if (v.deadline === '3days') return dday >= -3 && dday <= 0;
                if (v.deadline === '7days') return dday >= -7 && dday <= 0;
                return true;
            });
        }

        return filtered;
    },

    // 활성 필터가 있는지 확인
    isActive() {
        const v = this.getValues();
        return v.revenueMin || v.revenueMax || v.priceMin || v.priceMax || v.tag || v.favOnly || v.deadline;
    },

    // ---- 프리셋 저장/불러오기 ----
    getPresets() {
        try {
            return JSON.parse(localStorage.getItem(FILTER_PRESETS_KEY) || '[]');
        } catch { return []; }
    },

    savePreset(name) {
        const presets = this.getPresets();
        const values = this.getValues();
        presets.push({ name, values, createdAt: new Date().toISOString() });
        localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(presets));
        this.renderPresets();
    },

    deletePreset(index) {
        const presets = this.getPresets();
        presets.splice(index, 1);
        localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(presets));
        this.renderPresets();
    },

    loadPreset(index) {
        const presets = this.getPresets();
        if (presets[index]) {
            this.setValues(presets[index].values);
            App.applyAdvFilter();
        }
    },

    renderPresets() {
        const container = document.getElementById('filterPresets');
        if (!container) return;
        const presets = this.getPresets();

        if (presets.length === 0) {
            container.innerHTML = '<span style="font-size:0.72rem; color:var(--text-muted);">저장된 필터 프리셋이 없습니다.</span>';
            return;
        }

        container.innerHTML = presets.map((p, i) => `
            <div class="adv-filter-preset" onclick="AdvFilter.loadPreset(${i})">
                📁 ${p.name}
                <button class="adv-filter-preset__delete" onclick="event.stopPropagation(); AdvFilter.deletePreset(${i})" title="삭제">×</button>
            </div>
        `).join('');
    }
};
