// ============================================================
// csv.js — CSV 가져오기/내보내기
// ============================================================

const CSV = {
    // CSV 필드 목록 (export/import 순서)
    fields: [
        'companyName', 'industry', 'location', 'foundedYear', 'employeeCount',
        'revenue', 'operatingProfit', 'netIncome', 'totalAssets', 'debtRatio',
        'saleReason', 'askingPrice', 'sharePercentage', 'dealStructure',
        'coreCompetency', 'memo', 'status'
    ],

    headers: [
        '회사명', '업종', '소재지', '설립연도', '종업원수',
        '매출액(억)', '영업이익(억)', '순이익(억)', '총자산(억)', '부채비율(%)',
        '매각사유', '희망가격(억)', '매각지분율(%)', '딜구조',
        '핵심역량', '메모', '상태'
    ],

    // ---- Export ----
    exportCSV() {
        const deals = Storage.getAll();
        if (deals.length === 0) {
            UI.showToast('내보낼 딜 데이터가 없습니다.', 'error');
            return;
        }

        // BOM + header
        let csv = '\uFEFF' + this.headers.join(',') + '\n';

        deals.forEach(deal => {
            const row = this.fields.map(f => {
                let val = deal[f];
                if (val === undefined || val === null) val = '';
                val = String(val);
                // Escape commas and quotes
                if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                    val = '"' + val.replace(/"/g, '""') + '"';
                }
                return val;
            });
            csv += row.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `M&A_딜목록_${formatDate(new Date().toISOString()).replace(/\./g, '')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UI.showToast(`${deals.length}건의 딜을 CSV로 내보냈습니다.`, 'success');
    },

    // ---- Import ----
    importCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split(/\r?\n/).filter(l => l.trim());

                    if (lines.length < 2) {
                        reject('CSV 파일에 데이터가 없습니다.');
                        return;
                    }

                    // Parse header to detect column mapping
                    const headerRow = this.parseCSVLine(lines[0]);
                    const columnMap = this.mapColumns(headerRow);

                    const newDeals = [];

                    for (let i = 1; i < lines.length; i++) {
                        const values = this.parseCSVLine(lines[i]);
                        if (values.length === 0 || values.every(v => !v.trim())) continue;

                        const dealData = {};
                        this.fields.forEach((field, idx) => {
                            const colIdx = columnMap[idx];
                            if (colIdx !== undefined && colIdx < values.length) {
                                let val = values[colIdx].trim();
                                // Convert numeric fields
                                if (['revenue', 'operatingProfit', 'netIncome', 'totalAssets',
                                    'debtRatio', 'askingPrice', 'sharePercentage',
                                    'foundedYear', 'employeeCount'].includes(field)) {
                                    const num = Number(val);
                                    val = isNaN(num) ? '' : num;
                                }
                                dealData[field] = val;
                            }
                        });

                        // Validate required fields
                        if (!dealData.companyName) continue;

                        // Validate status
                        if (dealData.status && !Object.values(DEAL_STATUS).includes(dealData.status)) {
                            dealData.status = DEAL_STATUS.NEW;
                        }

                        newDeals.push(createDeal(dealData));
                    }

                    resolve(newDeals);
                } catch (err) {
                    reject('CSV 파싱 오류: ' + err.message);
                }
            };
            reader.onerror = () => reject('파일 읽기 오류');
            reader.readAsText(file, 'UTF-8');
        });
    },

    // Parse a single CSV line respecting quotes
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"' && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else if (ch === '"') {
                    inQuotes = false;
                } else {
                    current += ch;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                } else if (ch === ',') {
                    result.push(current);
                    current = '';
                } else {
                    current += ch;
                }
            }
        }
        result.push(current);
        return result;
    },

    // Map CSV header columns to our field indices
    mapColumns(headerRow) {
        const map = {};
        // Try exact match first
        headerRow.forEach((h, colIdx) => {
            const hClean = h.replace(/\uFEFF/g, '').trim();
            const matchIdx = this.headers.findIndex(myH => myH === hClean);
            if (matchIdx !== -1) {
                map[matchIdx] = colIdx;
            }
        });

        // If no headers matched, assume order
        if (Object.keys(map).length === 0) {
            headerRow.forEach((_, i) => {
                if (i < this.fields.length) map[i] = i;
            });
        }

        return map;
    },

    // Show import modal
    showImportModal() {
        const modal = document.getElementById('csvModal');
        const body = modal.querySelector('.modal__body');

        body.innerHTML = `
            <div id="csvDropzone" class="csv-dropzone">
                <div class="csv-dropzone__icon">📄</div>
                <div class="csv-dropzone__text">CSV 파일을 여기에 드래그하거나 클릭하여 선택하세요</div>
                <div class="csv-dropzone__hint">UTF-8 인코딩, 첫 행은 헤더</div>
                <input type="file" id="csvFileInput" accept=".csv" style="display:none">
            </div>
            <div id="csvPreview" style="margin-top: var(--space-lg); display:none;"></div>
        `;

        const footer = modal.querySelector('.modal__footer');
        footer.innerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal('csvModal')">취소</button>
            <button class="btn btn-primary" id="csvImportBtn" disabled onclick="CSV.confirmImport()">📥 가져오기</button>
        `;

        // Dropzone events
        const dropzone = document.getElementById('csvDropzone');
        const fileInput = document.getElementById('csvFileInput');

        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) this.handleFile(file);
        });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) this.handleFile(e.target.files[0]);
        });

        UI.openModal('csvModal');
    },

    _pendingDeals: [],

    async handleFile(file) {
        if (!file.name.endsWith('.csv')) {
            UI.showToast('CSV 파일만 가져올 수 있습니다.', 'error');
            return;
        }

        try {
            const deals = await this.importCSV(file);
            this._pendingDeals = deals;

            const preview = document.getElementById('csvPreview');
            preview.style.display = 'block';
            preview.innerHTML = `
                <div style="color:var(--accent-success); font-weight:600; margin-bottom: var(--space-sm);">
                    ✅ ${deals.length}건의 딜 데이터를 감지했습니다.
                </div>
                <div style="max-height:200px; overflow-y:auto;">
                    ${deals.map(d => `
                        <div style="padding:6px 10px; background:var(--bg-glass); border-radius:var(--radius-sm); margin-bottom:4px; font-size:0.85rem;">
                            <strong>${d.companyName}</strong> — ${d.industry || '미분류'} — ${formatCurrency(d.revenue)}
                        </div>
                    `).join('')}
                </div>
            `;

            document.getElementById('csvImportBtn').disabled = false;
        } catch (err) {
            UI.showToast(err, 'error');
        }
    },

    confirmImport() {
        if (this._pendingDeals.length === 0) return;

        const existing = Storage.getAll();
        const merged = [...existing, ...this._pendingDeals];
        Storage.saveAll(merged);

        UI.showToast(`${this._pendingDeals.length}건의 딜을 가져왔습니다.`, 'success');
        this._pendingDeals = [];
        UI.closeModal('csvModal');
        App.refresh();
    }
};
