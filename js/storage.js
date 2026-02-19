// ============================================================
// storage.js — localStorage CRUD for Deal Management
// ============================================================

const STORAGE_KEY = 'megainfo_deals';

const Storage = {
    // 전체 딜 목록 가져오기
    getAll() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            return JSON.parse(raw);
        } catch (e) {
            console.error('Storage getAll error:', e);
            return [];
        }
    },

    // 단일 딜 ID로 가져오기
    getById(id) {
        return this.getAll().find(d => d.id === id) || null;
    },

    // 전체 딜 목록 저장
    saveAll(deals) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
            return true;
        } catch (e) {
            console.error('Storage saveAll error:', e);
            return false;
        }
    },

    // 딜 1건 가져오기
    getById(id) {
        const deals = this.getAll();
        return deals.find(d => d.id === id) || null;
    },

    // 딜 추가
    add(deal) {
        const deals = this.getAll();
        deals.push(deal);
        return this.saveAll(deals);
    },

    // 딜 수정
    update(id, updates) {
        const deals = this.getAll();
        const idx = deals.findIndex(d => d.id === id);
        if (idx === -1) return false;
        deals[idx] = { ...deals[idx], ...updates, updatedAt: new Date().toISOString() };
        return this.saveAll(deals);
    },

    // 딜 삭제
    remove(id) {
        const deals = this.getAll();
        const filtered = deals.filter(d => d.id !== id);
        return this.saveAll(filtered);
    },

    // 샘플 데이터로 초기화 (데이터가 없을 때만)
    initWithSampleData() {
        if (this.getAll().length === 0) {
            this.saveAll(SAMPLE_DEALS);
            return true;
        }
        return false;
    },

    // 전체 초기화 (샘플 데이터로 리셋)
    reset() {
        this.saveAll(SAMPLE_DEALS);
    },

    // 타임라인 메모 추가
    addTimelineEntry(dealId, content) {
        const deals = this.getAll();
        const idx = deals.findIndex(d => d.id === dealId);
        if (idx === -1) return false;
        if (!deals[idx].timeline) deals[idx].timeline = [];
        deals[idx].timeline.push({
            date: new Date().toISOString(),
            content: content
        });
        deals[idx].updatedAt = new Date().toISOString();
        return this.saveAll(deals);
    },

    // 타임라인 메모 삭제
    removeTimelineEntry(dealId, entryIndex) {
        const deals = this.getAll();
        const idx = deals.findIndex(d => d.id === dealId);
        if (idx === -1) return false;
        if (!deals[idx].timeline) return false;
        deals[idx].timeline.splice(entryIndex, 1);
        deals[idx].updatedAt = new Date().toISOString();
        return this.saveAll(deals);
    }
};
