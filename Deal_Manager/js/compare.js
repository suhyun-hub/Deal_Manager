// ============================================================
// compare.js — 딜 비교 기능
// ============================================================

const Compare = {
    selectedIds: [],

    toggle(dealId, checked) {
        if (checked) {
            if (this.selectedIds.length >= 4) {
                UI.showToast('최대 4개까지 비교할 수 있습니다.', 'error');
                // uncheck
                const cb = document.querySelector(`input[data-compare-id="${dealId}"]`);
                if (cb) cb.checked = false;
                return;
            }
            if (!this.selectedIds.includes(dealId)) {
                this.selectedIds.push(dealId);
            }
        } else {
            this.selectedIds = this.selectedIds.filter(id => id !== dealId);
        }
        this.updateBar();
    },

    updateBar() {
        const bar = document.getElementById('compareBar');
        const count = document.getElementById('compareCount');
        if (this.selectedIds.length > 0) {
            bar.classList.add('active');
            count.textContent = this.selectedIds.length;
        } else {
            bar.classList.remove('active');
        }
    },

    clearAll() {
        this.selectedIds = [];
        document.querySelectorAll('input[data-compare-id]').forEach(cb => cb.checked = false);
        this.updateBar();
    },

    showComparison() {
        if (this.selectedIds.length < 2) {
            UI.showToast('2개 이상의 딜을 선택해주세요.', 'error');
            return;
        }

        const deals = this.selectedIds.map(id => Storage.getById(id)).filter(Boolean);

        const modal = document.getElementById('compareModal');
        const body = modal.querySelector('.modal__body');

        const rows = [
            { label: '회사명', key: 'companyName', format: v => v || '-' },
            { label: '업종', key: 'industry', format: v => v || '-' },
            { label: '소재지', key: 'location', format: v => v || '-' },
            { label: '설립연도', key: 'foundedYear', format: v => v || '-' },
            { label: '종업원 수', key: 'employeeCount', format: v => v ? v + '명' : '-' },
            { label: '매출액', key: 'revenue', format: v => formatCurrency(v), highlight: true },
            { label: '영업이익', key: 'operatingProfit', format: v => formatCurrency(v), highlight: true },
            { label: '순이익', key: 'netIncome', format: v => formatCurrency(v) },
            { label: '총자산', key: 'totalAssets', format: v => formatCurrency(v) },
            { label: '부채비율', key: 'debtRatio', format: v => formatPercent(v) },
            { label: '희망가격', key: 'askingPrice', format: v => formatCurrency(v), highlight: true },
            { label: '매각지분율', key: 'sharePercentage', format: v => v ? v + '%' : '-' },
            { label: '딜 구조', key: 'dealStructure', format: v => v || '-' },
            { label: '매각사유', key: 'saleReason', format: v => v || '-' },
            { label: '상태', key: 'status', format: v => `<span class="badge badge--${v}">${v}</span>` },
            { label: '핵심역량', key: 'coreCompetency', format: v => v || '-' }
        ];

        body.innerHTML = `
            <div style="overflow-x:auto;">
                <table class="compare-table">
                    <thead>
                        <tr>
                            <th style="min-width:100px;">항목</th>
                            ${deals.map(d => `<th style="min-width:160px;">${d.companyName}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => {
            const values = deals.map(d => d[r.key]);
            // Highlight best value for numeric comparison rows
            let bestIdx = -1;
            if (r.highlight) {
                const nums = values.map(v => Number(v));
                if (nums.some(n => !isNaN(n))) {
                    if (r.key === 'debtRatio') {
                        bestIdx = nums.indexOf(Math.min(...nums.filter(n => !isNaN(n))));
                    } else {
                        bestIdx = nums.indexOf(Math.max(...nums.filter(n => !isNaN(n))));
                    }
                }
            }
            return `
                                <tr>
                                    <td>${r.label}</td>
                                    ${values.map((v, i) => `
                                        <td style="${i === bestIdx ? 'color:var(--accent-success); font-weight:700;' : ''}">
                                            ${r.format(v)}
                                        </td>
                                    `).join('')}
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        UI.openModal('compareModal');
    }
};
