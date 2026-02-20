// ============================================================
// print.js — 모던 컨설팅 스타일 인쇄 보고서
// ============================================================

const PrintReport = {

    // ── 상태별 스타일 ──
    statusStyles: {
        '신규': { bg: '#ede9fe', color: '#6c5ce7', icon: '◆' },
        '검토중': { bg: '#fef3c7', color: '#d97706', icon: '◈' },
        '관심': { bg: '#d1fae5', color: '#059669', icon: '★' },
        '미팅진행': { bg: '#dbeafe', color: '#2563eb', icon: '▶' },
        '완료': { bg: '#ccfbf1', color: '#0d9488', icon: '✔' },
        '보류': { bg: '#f1f5f9', color: '#64748b', icon: '■' }
    },

    // ============================================================
    // 단일 딜 인쇄
    // ============================================================
    printDeal(dealId) {
        const deal = Storage.getById(dealId);
        if (!deal) { UI.showToast('딜 정보를 찾을 수 없습니다.', 'error'); return; }
        UI.closeAllModals();
        const reportEl = document.getElementById('printReport');
        reportEl.innerHTML = this.wrapPrintStyles(this.generateDealReport(deal));
        reportEl.style.display = 'block';
        setTimeout(() => { window.print(); setTimeout(() => { reportEl.style.display = 'none'; }, 500); }, 300);
    },

    // ============================================================
    // 전체 목록 인쇄
    // ============================================================
    printAll() {
        const deals = Storage.getAll();
        if (deals.length === 0) { UI.showToast('인쇄할 딜이 없습니다.', 'error'); return; }
        const reportEl = document.getElementById('printReport');
        reportEl.innerHTML = this.wrapPrintStyles(this.generateListReport(deals));
        reportEl.style.display = 'block';
        setTimeout(() => { window.print(); setTimeout(() => { reportEl.style.display = 'none'; }, 500); }, 300);
    },

    // ============================================================
    // 인쇄 전용 스타일
    // ============================================================
    wrapPrintStyles(content) {
        return `
        <style>
            @media print {
                @page { margin: 5mm; size: A4; }
                body * { visibility: hidden; }
                .print-report, .print-report * { visibility: visible; }
                .print-report {
                    position: absolute; left: 0; top: 0; width: 100%;
                    padding: 10mm 8mm 12mm 8mm;
                    font-family: 'Noto Sans KR', -apple-system, sans-serif;
                    color: #1e293b; font-size: 9pt; line-height: 1.6;
                    -webkit-print-color-adjust: exact; print-color-adjust: exact;
                }
            }
            .pr { font-family: 'Noto Sans KR', -apple-system, sans-serif; color: #1e293b; font-size: 9pt; line-height: 1.6; }

            /* Header */
            .pr-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #6366f1; padding-bottom: 14px; margin-bottom: 24px; }
            .pr-header__left h1 { font-size: 18pt; font-weight: 700; color: #1e293b; margin: 0 0 2px 0; letter-spacing: -0.5px; }
            .pr-header__left .pr-subtitle { font-size: 9pt; color: #64748b; }
            .pr-header__right { text-align: right; font-size: 8pt; color: #64748b; }
            .pr-header__right .pr-brand { font-size: 10pt; font-weight: 700; color: #6366f1; margin-bottom: 2px; }
            .pr-header__right .pr-confidential { display: inline-block; background: #fef2f2; color: #dc2626; font-size: 7pt; padding: 2px 8px; border-radius: 3px; font-weight: 600; margin-top: 4px; border: 1px solid #fecaca; }

            /* Pipeline Summary */
            .pr-pipeline { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
            .pr-pipeline__item { flex: 1; min-width: 80px; text-align: center; padding: 10px 6px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .pr-pipeline__count { font-size: 20pt; font-weight: 700; line-height: 1.2; }
            .pr-pipeline__label { font-size: 7pt; font-weight: 500; margin-top: 2px; }
            .pr-pipeline__total { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border-color: transparent; }
            .pr-pipeline__total .pr-pipeline__count, .pr-pipeline__total .pr-pipeline__label { color: white; }

            /* KPI */
            .pr-kpi-row { display: flex; gap: 10px; margin-bottom: 20px; }
            .pr-kpi { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; border-top: 3px solid #6366f1; }
            .pr-kpi__value { font-size: 14pt; font-weight: 700; color: #1e293b; }
            .pr-kpi__label { font-size: 7.5pt; color: #64748b; margin-top: 2px; }

            /* Section */
            .pr-section { margin-top: 22px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; page-break-after: avoid; }
            .pr-section h2 { font-size: 11pt; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 6px; }
            .pr-section h2 .pr-bar { display: inline-block; width: 4px; height: 16px; background: #6366f1; border-radius: 2px; }

            /* Table */
            .pr-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 8.5pt; page-break-inside: avoid; }
            .pr-table thead th { background: #f1f5f9; color: #475569; font-weight: 600; padding: 8px 10px; text-align: left; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 2px solid #cbd5e1; }
            .pr-table tbody td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
            .pr-table tbody tr:nth-child(even) { background: #fafbfc; }
            .pr-table .td-r { text-align: right; font-variant-numeric: tabular-nums; }
            .pr-table .td-c { text-align: center; }

            /* Badge */
            .pr-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 7.5pt; font-weight: 600; white-space: nowrap; }

            /* Deal Header */
            .pr-deal-hd { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 20px 24px; border-radius: 10px; margin-bottom: 20px; }
            .pr-deal-hd h2 { font-size: 16pt; font-weight: 700; margin: 0 0 6px 0; color: white; }
            .pr-deal-hd .meta { display: flex; gap: 16px; font-size: 8.5pt; opacity: 0.85; }

            /* Financial Highlight */
            .pr-fin { display: flex; gap: 10px; margin-bottom: 16px; page-break-inside: avoid; }
            .pr-fin-item { flex: 1; text-align: center; padding: 14px 8px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }
            .pr-fin-item.c1 { border-top: 3px solid #6366f1; }
            .pr-fin-item.c2 { border-top: 3px solid #10b981; }
            .pr-fin-item.c3 { border-top: 3px solid #f59e0b; }
            .pr-fin-item.c4 { border-top: 3px solid #0ea5e9; }
            .pr-fin-val { font-size: 14pt; font-weight: 700; color: #1e293b; }
            .pr-fin-lbl { font-size: 7.5pt; color: #64748b; margin-top: 2px; }
            .pr-fin-val.neg { color: #ef4444; }

            /* Info Grid */
            .pr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; page-break-inside: avoid; }
            .pr-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: white; page-break-inside: avoid; }
            .pr-card h4 { font-size: 8pt; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
            .pr-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 8.5pt; }
            .pr-row .l { color: #64748b; }
            .pr-row .v { font-weight: 600; color: #1e293b; }

            /* Valuation */
            .pr-val { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px; margin-bottom: 16px; page-break-inside: avoid; }
            .pr-val h4 { font-size: 9pt; font-weight: 700; color: #0369a1; margin: 0 0 10px 0; }
            .pr-val-methods { display: flex; gap: 10px; flex-wrap: wrap; }
            .pr-val-m { flex: 1; min-width: 120px; background: white; border-radius: 6px; padding: 10px; text-align: center; border: 1px solid #e0f2fe; }
            .pr-val-m__n { font-size: 7pt; color: #64748b; font-weight: 500; }
            .pr-val-m__v { font-size: 12pt; font-weight: 700; color: #0369a1; margin-top: 2px; }
            .pr-val-avg { margin-top: 10px; text-align: center; font-size: 10pt; font-weight: 700; color: #0369a1; padding-top: 8px; border-top: 1px dashed #bae6fd; }

            /* Text Box */
            .pr-text { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; font-size: 8.5pt; line-height: 1.7; color: #334155; border-left: 4px solid #6366f1; }
            .pr-text.memo { border-left-color: #f59e0b; }

            /* Timeline */
            .pr-tl-item { display: flex; gap: 12px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
            .pr-tl-item:last-child { border-bottom: none; }
            .pr-tl-date { font-size: 7.5pt; color: #64748b; min-width: 100px; font-variant-numeric: tabular-nums; }
            .pr-tl-dot { width: 8px; height: 8px; border-radius: 50%; background: #6366f1; margin-top: 5px; flex-shrink: 0; }
            .pr-tl-txt { font-size: 8.5pt; color: #334155; flex: 1; }

            /* Tags */
            .pr-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 14px; }
            .pr-tag { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 7pt; font-weight: 600; color: white; }

            /* Footer */
            .pr-footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 7pt; color: #94a3b8; }

            /* Disclaimer */
            .pr-disc { margin-top: 20px; padding: 10px 14px; background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 7pt; color: #94a3b8; line-height: 1.6; }
        </style>
        <div class="pr">${content}</div>`;
    },

    // ── 공통 빌더 ──
    badge(status) {
        const s = this.statusStyles[status] || { bg: '#f1f5f9', color: '#64748b', icon: '●' };
        return `<span class="pr-badge" style="background:${s.bg};color:${s.color};">${s.icon} ${status}</span>`;
    },

    header(title, subtitle) {
        return `
        <div class="pr-header">
            <div class="pr-header__left">
                <h1>${title}</h1>
                <div class="pr-subtitle">${subtitle}</div>
            </div>
            <div class="pr-header__right">
                <div class="pr-brand">M&A BANK X 메가인포</div>
                <div style="font-size:7.5pt;color:#64748b;margin-top:2px;">작성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}</div>
                <div class="pr-confidential">CONFIDENTIAL</div>
            </div>
        </div>`;
    },

    footer() {
        return `
        <div class="pr-disc">
            <strong>Disclaimer</strong> — 본 보고서는 M&A 딜 소싱 단계에서의 내부 검토 목적으로 작성된 참고자료이며,
            투자 권유 또는 자문을 구성하지 않습니다. 기재된 재무 데이터는 매도측 제공 자료 기반이며,
            독립적인 실사(Due Diligence) 이전의 미검증 정보입니다. 간이 밸류에이션은 업종 평균 멀티플 기반 추정치로,
            실제 거래가격과 상이할 수 있습니다.
        </div>
        <div class="pr-footer">
            <span>본 자료는 내부 검토 목적으로 작성되었으며, 외부 배포를 금합니다.</span>
        </div>`;
    },

    // ============================================================
    // 전체 목록 보고서
    // ============================================================
    generateListReport(deals) {
        // 통계
        const statusCounts = {};
        Object.values(DEAL_STATUS).forEach(s => statusCounts[s] = 0);
        deals.forEach(d => { if (statusCounts[d.status] !== undefined) statusCounts[d.status]++; });

        const totalAsk = deals.reduce((s, d) => s + (Number(d.askingPrice) || 0), 0);
        const totalRev = deals.reduce((s, d) => s + (Number(d.revenue) || 0), 0);
        const avgRev = deals.length > 0 ? Math.round(totalRev / deals.length) : 0;
        const activeCount = deals.filter(d => d.status !== '보류' && d.status !== '완료').length;

        // 업종 분포
        const indCounts = {};
        deals.forEach(d => { const k = d.industry || '미분류'; indCounts[k] = (indCounts[k] || 0) + 1; });
        const topInd = Object.entries(indCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return `
        ${this.header('M&A Deal Pipeline Report', 'M&A BANK X 메가인포 · 딜 파이프라인 현황 보고서')}

        <!-- Pipeline -->
        <div class="pr-pipeline">
            <div class="pr-pipeline__item pr-pipeline__total">
                <div class="pr-pipeline__count">${deals.length}</div>
                <div class="pr-pipeline__label">전체 딜</div>
            </div>
            ${Object.entries(statusCounts).map(([st, cnt]) => {
            const s = this.statusStyles[st] || {};
            return `<div class="pr-pipeline__item" style="background:${s.bg || '#f1f5f9'};"><div class="pr-pipeline__count" style="color:${s.color || '#64748b'};">${cnt}</div><div class="pr-pipeline__label" style="color:${s.color || '#64748b'};">${st}</div></div>`;
        }).join('')}
        </div>

        <!-- KPI -->
        <div class="pr-kpi-row">
            <div class="pr-kpi"><div class="pr-kpi__value">${totalAsk.toLocaleString()}억</div><div class="pr-kpi__label">총 딜 사이즈 (희망가격 합계)</div></div>
            <div class="pr-kpi"><div class="pr-kpi__value">${activeCount}건</div><div class="pr-kpi__label">Active 딜</div></div>
            <div class="pr-kpi"><div class="pr-kpi__value">${avgRev.toLocaleString()}억</div><div class="pr-kpi__label">평균 매출액</div></div>
            <div class="pr-kpi"><div class="pr-kpi__value">${topInd.length > 0 ? topInd[0][0] : '-'}</div><div class="pr-kpi__label">최다 업종</div></div>
        </div>

        <!-- 업종 분포 -->
        <div class="pr-section"><h2><span class="pr-bar"></span>업종 분포</h2></div>
        <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
            ${topInd.map(([ind, cnt]) => `<div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:6px 14px;font-size:8pt;"><strong>${ind}</strong> <span style="color:#6366f1;font-weight:700;">${cnt}건</span></div>`).join('')}
        </div>

        <!-- Deal List -->
        <div class="pr-section"><h2><span class="pr-bar"></span>딜 목록 상세</h2></div>
        <table class="pr-table">
            <thead><tr>
                <th style="width:28px;">No.</th><th>회사명</th><th>업종</th>
                <th style="text-align:right;">매출액</th><th style="text-align:right;">영업이익</th>
                <th style="text-align:right;">희망가격</th><th style="text-align:center;">지분율</th>
                <th style="text-align:center;">등급</th>
                <th style="text-align:center;">리스크</th>
                <th style="text-align:center;">상태</th>
            </tr></thead>
            <tbody>${deals.map((d, i) => {
            const sc = calcDealScore(d);
            const rf = calcRiskFlags(d);
            const highRisk = rf.filter(f => f.level === 'high').length;
            const midRisk = rf.filter(f => f.level === 'mid').length;
            let riskLabel = '-', riskColor = '#94a3b8';
            if (highRisk > 0) { riskLabel = '🔴 ' + highRisk; riskColor = '#ef4444'; }
            else if (midRisk > 0) { riskLabel = '🟡 ' + midRisk; riskColor = '#d97706'; }
            else if (rf.length === 0) { riskLabel = '✅'; riskColor = '#10b981'; }
            return `<tr>
                <td class="td-c" style="color:#94a3b8;">${i + 1}</td>
                <td><strong>${d.companyName || '-'}</strong></td>
                <td>${d.industry || '-'}</td>
                <td class="td-r">${formatCurrency(d.revenue)}</td>
                <td class="td-r" style="${Number(d.operatingProfit) < 0 ? 'color:#ef4444;' : ''}">${formatCurrency(d.operatingProfit)}</td>
                <td class="td-r" style="font-weight:600;">${formatCurrency(d.askingPrice)}</td>
                <td class="td-c">${d.sharePercentage ? d.sharePercentage + '%' : '-'}</td>
                <td class="td-c"><span style="display:inline-block;background:${sc.gradeColor};color:white;width:26px;height:26px;border-radius:50%;line-height:26px;text-align:center;font-weight:700;font-size:9pt;">${sc.grade}</span><div style="font-size:6.5pt;color:#94a3b8;margin-top:1px;">${sc.total}점</div></td>
                <td class="td-c" style="color:${riskColor};font-weight:600;font-size:8pt;">${riskLabel}</td>
                <td class="td-c">${this.badge(d.status)}</td>
            </tr>`;
        }).join('')}</tbody>
        </table>

        <!-- 리스크 플래그 상세 -->
        <div class="pr-section"><h2><span class="pr-bar"></span>리스크 플래그 상세</h2></div>
        <table class="pr-table">
            <thead><tr><th>회사명</th><th style="text-align:center;">레벨</th><th>플래그</th><th>상세</th></tr></thead>
            <tbody>${deals.map(d => {
            const rf = calcRiskFlags(d);
            if (rf.length === 0) return `<tr><td><strong>${d.companyName}</strong></td><td class="td-c" style="color:#10b981;">✅</td><td colspan="2" style="color:#10b981;">특이사항 없음</td></tr>`;
            return rf.map((f, fi) => `<tr>
                    ${fi === 0 ? `<td rowspan="${rf.length}" style="vertical-align:top;"><strong>${d.companyName}</strong></td>` : ''}
                    <td class="td-c">${f.icon}</td>
                    <td style="font-weight:600;">${f.label}</td>
                    <td style="font-size:8pt;color:#475569;">${f.detail}</td>
                </tr>`).join('');
        }).join('')}</tbody>
        </table>

        <!-- 간이 밸류에이션 -->
        <div class="pr-section"><h2><span class="pr-bar"></span>간이 밸류에이션 요약</h2></div>
        <table class="pr-table">
            <thead><tr>
                <th>회사명</th><th style="text-align:right;">EV/EBITDA</th>
                <th style="text-align:right;">순자산가치</th><th style="text-align:right;">평균 추정가치</th>
                <th style="text-align:right;">희망가격</th><th style="text-align:center;">Gap</th>
            </tr></thead>
            <tbody>${deals.map(d => {
            const val = calcSimpleValuation(d);
            const ev = val.methods.find(m => m.name === 'EV/EBITDA');

            const nav = val.methods.find(m => m.name === '순자산가치');
            const ask = Number(d.askingPrice) || 0;
            let gap = '-', gc = '#64748b';
            if (val.avgValue && ask > 0) {
                const g = ((ask - val.avgValue) / val.avgValue * 100).toFixed(1);
                gap = (g > 0 ? '+' : '') + g + '%';
                gc = g > 20 ? '#ef4444' : g > 0 ? '#f59e0b' : '#10b981';
            }
            return `<tr>
                    <td><strong>${d.companyName || '-'}</strong></td>
                    <td class="td-r">${ev ? ev.value + '억' : '-'}</td>

                    <td class="td-r">${nav ? nav.value + '억' : '-'}</td>
                    <td class="td-r" style="font-weight:700;color:#0369a1;">${val.avgValue ? val.avgValue + '억' : '-'}</td>
                    <td class="td-r">${formatCurrency(d.askingPrice)}</td>
                    <td class="td-c" style="font-weight:700;color:${gc};">${gap}</td>
                </tr>`;
        }).join('')}</tbody>
        </table>

        ${this.footer()}`;
    },

    // ============================================================
    // 단일 딜 상세 보고서
    // ============================================================
    generateDealReport(deal) {
        const val = calcSimpleValuation(deal);
        const sc = calcDealScore(deal);
        const rf = calcRiskFlags(deal);

        return `
        ${this.header('M&A Deal Report', `${deal.companyName} · 딜 상세 분석 보고서`)}

        <!-- Deal Header -->
        <div class="pr-deal-hd">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <h2>${deal.companyName}</h2>
                    <div class="meta">
                        <span>📍 ${deal.industry || '-'}</span>
                        <span>📌 ${deal.location || '-'}</span>
                        <span>🏢 설립 ${deal.foundedYear || '-'}년</span>
                        <span>👥 ${deal.employeeCount ? deal.employeeCount + '명' : '-'}</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:10px;padding:4px 14px;">
                        <span style="font-size:20pt;font-weight:800;">${sc.grade}</span>
                        <span style="font-size:8pt;opacity:0.8;margin-left:4px;">${sc.total}점</span>
                    </div>
                    <div style="margin-top:4px;">${this.badge(deal.status)}</div>
                    ${deal.deadline ? `<div style="font-size:8pt;margin-top:4px;opacity:0.85;">마감: ${formatDate(deal.deadline)}</div>` : ''}
                </div>
            </div>
        </div>

        <!-- Score + Risk Summary Row -->
        <div style="display:flex;gap:12px;margin-bottom:16px;">
            <!-- 스코어링 카드 -->
            <div style="flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:14px;background:white;">
                <h4 style="font-size:8pt;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px 0;padding-bottom:6px;border-bottom:1px solid #e2e8f0;">📊 투자 매력도 스코어링</h4>
                ${sc.details.map(d => {
            const pct = d.max > 0 ? (d.score / d.max * 100).toFixed(0) : 0;
            const barColor = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
            return `
                <div style="margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                        <span style="font-size:8pt;color:#1e293b;font-weight:500;">${d.name} <span style="font-size:6.5pt;color:#94a3b8;font-weight:400;">(가중치 ${d.max}점)</span></span>
                        <span style="font-size:8pt;font-weight:700;color:${barColor};">${d.score}/${d.max}</span>
                    </div>
                    <div style="background:#f1f5f9;border-radius:4px;height:8px;overflow:hidden;">
                        <div style="width:${pct}%;height:100%;background:${barColor};border-radius:4px;"></div>
                    </div>
                    <div style="font-size:6.5pt;color:#94a3b8;margin-top:2px;">${d.note}</div>
                </div>`;
        }).join('')}
                <div style="text-align:center;margin-top:12px;padding-top:8px;border-top:1px dashed #e2e8f0;">
                    <span style="font-size:8pt;color:#64748b;">종합 등급</span>
                    <span style="display:inline-block;background:${sc.gradeColor};color:white;width:30px;height:30px;border-radius:50%;line-height:30px;text-align:center;font-weight:800;font-size:12pt;margin-left:8px;">${sc.grade}</span>
                    <span style="font-size:10pt;font-weight:700;color:${sc.gradeColor};margin-left:6px;">${sc.total}점</span>
                    <span style="font-size:8pt;color:${sc.gradeColor};margin-left:4px;">(${sc.gradeLabel})</span>
                </div>
            </div>
            <!-- 리스크 플래그 -->
            <div style="flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:14px;background:white;">
                <h4 style="font-size:8pt;font-weight:600;color:#ef4444;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px 0;padding-bottom:6px;border-bottom:1px solid #e2e8f0;">⚠️ 리스크 플래그</h4>
                ${rf.length === 0 ? `<div style="text-align:center;padding:16px 0;color:#10b981;font-size:9pt;font-weight:600;">✅ 특이사항 없음</div>` :
                rf.map(f => `
                <div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid #f8fafc;align-items:flex-start;">
                    <span style="font-size:10pt;">${f.icon}</span>
                    <div>
                        <div style="font-size:8.5pt;font-weight:600;color:#1e293b;">${f.label}</div>
                        <div style="font-size:7.5pt;color:#64748b;margin-top:1px;">${f.detail}</div>
                    </div>
                </div>`).join('')}
            </div>
        </div>

        <!-- Financial Highlights -->
        <div class="pr-fin">
            <div class="pr-fin-item c1"><div class="pr-fin-val">${formatCurrency(deal.revenue)}</div><div class="pr-fin-lbl">매출액</div></div>
            <div class="pr-fin-item c2"><div class="pr-fin-val ${Number(deal.operatingProfit) < 0 ? 'neg' : ''}">${formatCurrency(deal.operatingProfit)}</div><div class="pr-fin-lbl">영업이익</div></div>
            <div class="pr-fin-item c3"><div class="pr-fin-val">${formatCurrency(deal.askingPrice)}</div><div class="pr-fin-lbl">희망가격</div></div>
            <div class="pr-fin-item c4"><div class="pr-fin-val">${formatCurrency(deal.totalAssets)}</div><div class="pr-fin-lbl">총자산</div></div>
        </div>

        <!-- Info Grid -->
        <div class="pr-grid">
            <div class="pr-card">
                <h4>기본 정보</h4>
                <div class="pr-row"><span class="l">업종</span><span class="v">${deal.industry || '-'}</span></div>
                <div class="pr-row"><span class="l">소재지</span><span class="v">${deal.location || '-'}</span></div>
                <div class="pr-row"><span class="l">설립연도</span><span class="v">${deal.foundedYear || '-'}</span></div>
                <div class="pr-row"><span class="l">종업원 수</span><span class="v">${deal.employeeCount ? deal.employeeCount + '명' : '-'}</span></div>
            </div>
            <div class="pr-card">
                <h4>딜 조건</h4>
                <div class="pr-row"><span class="l">희망가격</span><span class="v" style="color:#6366f1;">${formatCurrency(deal.askingPrice)}</span></div>
                <div class="pr-row"><span class="l">매각지분율</span><span class="v">${deal.sharePercentage ? deal.sharePercentage + '%' : '-'}</span></div>
                <div class="pr-row"><span class="l">딜 구조</span><span class="v">${deal.dealStructure || '-'}</span></div>
                <div class="pr-row"><span class="l">매각사유</span><span class="v">${deal.saleReason || '-'}</span></div>
            </div>
            <div class="pr-card">
                <h4>재무 정보</h4>
                <div class="pr-row"><span class="l">매출액</span><span class="v">${formatCurrency(deal.revenue)}</span></div>
                <div class="pr-row"><span class="l">영업이익</span><span class="v" style="${Number(deal.operatingProfit) < 0 ? 'color:#ef4444;' : ''}">${formatCurrency(deal.operatingProfit)}</span></div>
                <div class="pr-row"><span class="l">순이익</span><span class="v">${formatCurrency(deal.netIncome)}</span></div>
                <div class="pr-row"><span class="l">총자산</span><span class="v">${formatCurrency(deal.totalAssets)}</span></div>
                <div class="pr-row"><span class="l">부채비율</span><span class="v">${formatPercent(deal.debtRatio)}</span></div>
            </div>
            <div class="pr-card">
                <h4>수익성 지표</h4>
                ${(() => {
                const rev = Number(deal.revenue) || 0;
                const op = Number(deal.operatingProfit) || 0;
                const ni = Number(deal.netIncome) || 0;
                const opm = rev > 0 ? (op / rev * 100).toFixed(1) : '-';
                const npm = rev > 0 ? (ni / rev * 100).toFixed(1) : '-';
                const ask = Number(deal.askingPrice) || 0;
                const per = ni > 0 ? (ask / ni).toFixed(1) : '-';
                const evEbitda = op > 0 ? (ask / op).toFixed(1) : '-';
                return `
                    <div class="pr-row"><span class="l">영업이익률</span><span class="v" style="${op < 0 ? 'color:#ef4444;' : ''}">${opm !== '-' ? opm + '%' : '-'}</span></div>
                    <div class="pr-row"><span class="l">순이익률</span><span class="v">${npm !== '-' ? npm + '%' : '-'}</span></div>
                    <div class="pr-row"><span class="l">Implied PER</span><span class="v">${per !== '-' ? per + 'x' : '-'}</span></div>
                    <div class="pr-row"><span class="l">Implied EV/EBITDA</span><span class="v">${evEbitda !== '-' ? evEbitda + 'x' : '-'}</span></div>`;
            })()}
            </div>
        </div>

        <!-- 간이 밸류에이션 -->
        ${val.methods.length > 0 ? `
        <div class="pr-val">
            <h4>📊 간이 밸류에이션 (업종 멀티플 기반)</h4>
            <div class="pr-val-methods">
                ${val.methods.map(m => `<div class="pr-val-m"><div class="pr-val-m__n">${m.name}</div><div class="pr-val-m__v">${m.value}억</div><div style="font-size:6.5pt;color:#94a3b8;margin-top:2px;">${m.detail}</div></div>`).join('')}
            </div>
            <div class="pr-val-avg">
                추정 평균 기업가치: <span style="font-size:14pt;">${val.avgValue}억원</span>
                ${(() => {
                    const ask = Number(deal.askingPrice) || 0;
                    if (val.avgValue && ask > 0) {
                        const g = ((ask - val.avgValue) / val.avgValue * 100).toFixed(1);
                        const dir = g > 0 ? '↑' : '↓';
                        const c = g > 20 ? '#ef4444' : g > 0 ? '#f59e0b' : '#10b981';
                        return ` <span style="font-size:9pt;color:${c};margin-left:8px;">vs 희망가격 ${dir}${Math.abs(g)}%</span>`;
                    }
                    return '';
                })()}
            </div>
        </div>` : ''}

        <!-- Tags -->
        ${deal.tags && deal.tags.length > 0 ? `<div class="pr-tags">${deal.tags.map(t => `<span class="pr-tag" style="background:${t.color};">${t.name}</span>`).join('')}</div>` : ''}

        <!-- 핵심역량 -->
        ${deal.coreCompetency ? `<div class="pr-section"><h2><span class="pr-bar"></span>핵심역량</h2></div><div class="pr-text">${deal.coreCompetency}</div>` : ''}

        <!-- 메모 -->
        ${deal.memo ? `<div class="pr-section"><h2><span class="pr-bar"></span>검토 의견</h2></div><div class="pr-text memo">${deal.memo}</div>` : ''}

        <!-- 타임라인 -->
        ${deal.timeline && deal.timeline.length > 0 ? `
        <div class="pr-section"><h2><span class="pr-bar"></span>진행 타임라인</h2></div>
        <div>${deal.timeline.map(t => `<div class="pr-tl-item"><div class="pr-tl-date">${formatDateTime(t.date)}</div><div class="pr-tl-dot"></div><div class="pr-tl-txt">${t.content}</div></div>`).join('')}</div>` : ''}

        <!-- 첨부파일 -->
        ${deal.attachments && deal.attachments.length > 0 ? `
        <div class="pr-section"><h2><span class="pr-bar"></span>첨부 자료</h2></div>
        <table class="pr-table">
            <thead><tr><th>자료명</th><th>비고</th><th>등록일</th></tr></thead>
            <tbody>${deal.attachments.map(a => `<tr><td>📎 ${a.name}</td><td>${a.note || '-'}</td><td style="font-size:7.5pt;color:#64748b;">${a.addedAt ? formatDate(a.addedAt) : '-'}</td></tr>`).join('')}</tbody>
        </table>` : ''}

        ${this.footer()}`;
    }
};
