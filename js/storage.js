// ============================================================
// storage.js — Firestore CRUD for Deal Management
// ============================================================

const DEALS_COLLECTION = 'deals';

const Storage = {
    _cache: [],
    _initialized: false,
    _refreshTimer: null,

    // Firestore에서 데이터 로드 + 실시간 리스너 설정
    async init() {
        // 초기 데이터 로드
        try {
            const snapshot = await db.collection(DEALS_COLLECTION).get();
            this._cache = snapshot.docs.map(doc => doc.data());
            this._initialized = true;
        } catch (e) {
            console.error('Storage init error:', e);
            this._cache = [];
            this._initialized = true;
        }

        // 실시간 리스너 (다른 기기 변경 감지)
        db.collection(DEALS_COLLECTION).onSnapshot(snapshot => {
            this._cache = snapshot.docs.map(doc => doc.data());
            // 디바운스된 UI 갱신
            if (this._refreshTimer) clearTimeout(this._refreshTimer);
            this._refreshTimer = setTimeout(() => {
                if (typeof App !== 'undefined' && App.refresh) {
                    App.refresh();
                }
            }, 150);
        }, err => {
            console.error('Firestore listener error:', err);
        });
    },

    // 전체 딜 목록 가져오기 (캐시에서 동기적으로)
    getAll() {
        return [...this._cache];
    },

    // 단일 딜 ID로 가져오기
    getById(id) {
        return this._cache.find(d => d.id === id) || null;
    },

    // 전체 딜 목록 저장 (CSV 가져오기 등에서 사용)
    saveAll(deals) {
        // 캐시 즉시 업데이트
        this._cache = [...deals];

        // Firestore 일괄 업데이트 (백그라운드)
        this._batchSaveAll(deals).catch(e => {
            console.error('Firestore saveAll error:', e);
        });
        return true;
    },

    // Firestore 일괄 저장 (내부용)
    async _batchSaveAll(deals) {
        // 기존 문서 전부 삭제
        const existing = await db.collection(DEALS_COLLECTION).get();
        const deleteBatch = db.batch();
        existing.docs.forEach(doc => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();

        // 새 문서 일괄 추가 (500개씩 분할 — Firestore batch 제한)
        for (let i = 0; i < deals.length; i += 500) {
            const chunk = deals.slice(i, i + 500);
            const batch = db.batch();
            chunk.forEach(deal => {
                batch.set(db.collection(DEALS_COLLECTION).doc(deal.id), deal);
            });
            await batch.commit();
        }
    },

    // 딜 추가
    add(deal) {
        // 캐시 즉시 업데이트
        this._cache.push(deal);

        // Firestore 저장 (백그라운드)
        db.collection(DEALS_COLLECTION).doc(deal.id).set(deal).catch(e => {
            console.error('Firestore add error:', e);
        });
        return true;
    },

    // 딜 수정
    update(id, updates) {
        // 캐시 즉시 업데이트
        const idx = this._cache.findIndex(d => d.id === id);
        if (idx === -1) return false;
        this._cache[idx] = { ...this._cache[idx], ...updates, updatedAt: new Date().toISOString() };

        // Firestore 업데이트 (백그라운드)
        db.collection(DEALS_COLLECTION).doc(id).update({
            ...updates,
            updatedAt: new Date().toISOString()
        }).catch(e => {
            console.error('Firestore update error:', e);
        });
        return true;
    },

    // 딜 삭제
    remove(id) {
        // 캐시 즉시 업데이트
        this._cache = this._cache.filter(d => d.id !== id);

        // Firestore 삭제 (백그라운드)
        db.collection(DEALS_COLLECTION).doc(id).delete().catch(e => {
            console.error('Firestore remove error:', e);
        });
        return true;
    },

    // 전체 데이터 삭제
    reset() {
        // 캐시 즉시 비우기
        this._cache = [];

        // Firestore 전체 삭제 (백그라운드)
        this._deleteAll().catch(e => {
            console.error('Firestore reset error:', e);
        });
    },

    async _deleteAll() {
        const snapshot = await db.collection(DEALS_COLLECTION).get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    },

    // 타임라인 메모 추가
    addTimelineEntry(dealId, content) {
        const idx = this._cache.findIndex(d => d.id === dealId);
        if (idx === -1) return false;

        if (!this._cache[idx].timeline) this._cache[idx].timeline = [];
        const entry = { date: new Date().toISOString(), content: content };
        this._cache[idx].timeline.push(entry);
        this._cache[idx].updatedAt = new Date().toISOString();

        // Firestore 업데이트 (백그라운드)
        db.collection(DEALS_COLLECTION).doc(dealId).update({
            timeline: this._cache[idx].timeline,
            updatedAt: this._cache[idx].updatedAt
        }).catch(e => {
            console.error('Firestore addTimelineEntry error:', e);
        });
        return true;
    },

    // 타임라인 메모 삭제
    removeTimelineEntry(dealId, entryIndex) {
        const idx = this._cache.findIndex(d => d.id === dealId);
        if (idx === -1) return false;
        if (!this._cache[idx].timeline) return false;

        this._cache[idx].timeline.splice(entryIndex, 1);
        this._cache[idx].updatedAt = new Date().toISOString();

        // Firestore 업데이트 (백그라운드)
        db.collection(DEALS_COLLECTION).doc(dealId).update({
            timeline: this._cache[idx].timeline,
            updatedAt: this._cache[idx].updatedAt
        }).catch(e => {
            console.error('Firestore removeTimelineEntry error:', e);
        });
        return true;
    }
};
