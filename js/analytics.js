// ============================================================
// analytics.js — 대시보드 분석 강화 모듈
// ============================================================

const Analytics = {
    // 월별 딜 추이 차트 렌더링
    renderMonthlyTrend(deals, container) {
        if (!container) return;

        // 최근 6개월 데이터 집계
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: `${d.getMonth() + 1}월`,
                count: 0,
                revenue: 0
            });
        }

        deals.forEach(deal => {
            const created = new Date(deal.createdAt);
            const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
            const month = months.find(m => m.key === key);
            if (month) {
                month.count++;
                month.revenue += Number(deal.revenue) || 0;
            }
        });

        const maxCount = Math.max(...months.map(m => m.count), 1);
        const chartHeight = 80;

        container.innerHTML = `
            <div style="display:flex; align-items:flex-end; gap:8px; height:${chartHeight + 26}px; padding:4px 2px;">
                ${months.map(m => {
            const barH = Math.max(Math.round((m.count / maxCount) * chartHeight), m.count > 0 ? 6 : 2);
            const isMax = m.count === maxCount && m.count > 0;
            const barColor = isMax
                ? 'linear-gradient(180deg, #818cf8, #6366f1)'
                : 'linear-gradient(180deg, rgba(99,102,241,0.5), rgba(99,102,241,0.3))';
            return `
                        <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%;">
                            <span style="font-size:0.68rem; font-weight:700; color:${isMax ? 'var(--text-accent)' : 'var(--text-muted)'}; margin-bottom:3px;">${m.count}</span>
                            <div style="width:100%; max-width:30px; height:${barH}px; background:${barColor}; border-radius:3px 3px 0 0; transition:height 0.6s ease;"></div>
                            <span style="font-size:0.6rem; color:var(--text-muted); margin-top:4px;">${m.label}</span>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    // 성사율 게이지 + 상태별 분포
    renderSuccessRate(deals, container) {
        if (!container) return;

        const total = deals.length;
        const completed = deals.filter(d => d.status === '완료').length;
        const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

        const circumference = 2 * Math.PI * 40;
        const filled = (rate / 100) * circumference;
        const empty = circumference - filled;

        let rateColor = '#10b981';
        if (rate < 20) rateColor = '#ef4444';
        else if (rate < 50) rateColor = '#f59e0b';

        // Status vertical bars
        const statuses = [
            { name: '신규', color: '#64748b' },
            { name: '검토중', color: '#06b6d4' },
            { name: '관심', color: '#f59e0b' },
            { name: '미팅진행', color: '#8b5cf6' },
            { name: '완료', color: '#10b981' },
            { name: '보류', color: '#ef4444' }
        ];

        const maxCount = Math.max(...statuses.map(s => deals.filter(d => d.status === s.name).length), 1);
        const barMaxH = 60;

        const verticalBars = statuses.map(s => {
            const count = deals.filter(d => d.status === s.name).length;
            const barH = Math.max(Math.round((count / maxCount) * barMaxH), count > 0 ? 4 : 2);
            return `
                <div class="status-bar-item" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:${barMaxH + 28}px;">
                    <span style="font-size:0.68rem; font-weight:700; color:${count === maxCount && count > 0 ? 'var(--text-accent)' : 'var(--text-muted)'}; margin-bottom:2px;">${count}</span>
                    <div style="width:100%; max-width:24px; height:${barH}px; background:${s.color}; border-radius:3px 3px 0 0; transition:height 0.6s ease;"></div>
                    <span style="font-size:0.5rem; color:var(--text-muted); margin-top:3px; white-space:nowrap;">${s.name}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="analytics-success-layout">
                <div class="analytics-gauge">
                    <svg viewBox="0 0 100 100" class="analytics-gauge__svg">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="${rateColor}" stroke-width="8"
                            stroke-dasharray="${filled} ${empty}" stroke-dashoffset="${circumference * 0.25}"
                            stroke-linecap="round" style="transition: stroke-dasharray 1s ease;"/>
                    </svg>
                    <div class="analytics-gauge__center">
                        <div class="analytics-gauge__value" style="color:${rateColor}">${rate}%</div>
                        <div class="analytics-gauge__label">성사율</div>
                    </div>
                </div>
                <div class="analytics-status-bars">
                    ${verticalBars}
                </div>
            </div>
            <div style="text-align:center; margin-top:var(--space-sm);">
                <span style="font-size:0.72rem; color:var(--text-muted);">완료 ${completed}건 / 전체 ${total}건</span>
            </div>
        `;
    },

    // 업종별 희망가격 비중 차트
    renderIndustryAvgPrice(deals, container) {
        if (!container) return;

        const industryData = {};
        deals.forEach(d => {
            if (!d.industry) return;
            if (!industryData[d.industry]) {
                industryData[d.industry] = { totalPrice: 0, count: 0 };
            }
            industryData[d.industry].totalPrice += Number(d.askingPrice) || 0;
            industryData[d.industry].count++;
        });

        const entries = Object.entries(industryData)
            .map(([name, data]) => ({ name, totalPrice: data.totalPrice, count: data.count }))
            .filter(e => e.totalPrice > 0)
            .sort((a, b) => b.totalPrice - a.totalPrice);

        if (entries.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); font-size:0.8rem; text-align:center;">데이터 부족</p>';
            return;
        }

        const grandTotal = entries.reduce((s, e) => s + e.totalPrice, 0);
        const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#ec4899', '#14b8a6'];

        // Stacked bar
        const stackedSegments = entries.map((e, i) => {
            const pct = (e.totalPrice / grandTotal) * 100;
            return `<div style="width:${pct}%; height:100%; background:${colors[i % colors.length]};" title="${e.name} ${pct.toFixed(1)}%"></div>`;
        }).join('');

        // Breakdown list
        const breakdown = entries.map((e, i) => {
            const pct = ((e.totalPrice / grandTotal) * 100).toFixed(1);
            return `
                <div style="display:flex; align-items:center; gap:6px; padding:2px 0;">
                    <span style="width:8px; height:8px; border-radius:2px; background:${colors[i % colors.length]}; flex-shrink:0;"></span>
                    <span style="font-size:0.72rem; color:var(--text-secondary); flex:1;">${e.name}</span>
                    <span style="font-size:0.72rem; font-weight:700; color:var(--text-accent);">${pct}%</span>
                    <span style="font-size:0.62rem; color:var(--text-muted); width:55px; text-align:right;">${formatCurrency(e.totalPrice)}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div style="margin-bottom:6px;">
                <div style="height:20px; border-radius:10px; overflow:hidden; display:flex; background:rgba(255,255,255,0.04);">
                    ${stackedSegments}
                </div>
                <div style="font-size:0.58rem; color:var(--text-muted); text-align:right; margin-top:3px;">총 ${formatCurrency(grandTotal)}</div>
            </div>
            <div style="display:flex; flex-direction:column; gap:2px;">
                ${breakdown}
            </div>
        `;
    },

    // 지역별 분포 (카드형 그리드)
    renderRegionDistribution(deals, container) {
        if (!container) return;

        const regionCounts = {};
        REGIONS.forEach(r => regionCounts[r.label] = 0);
        let unmapped = 0;

        deals.forEach(d => {
            if (!d.location) { unmapped++; return; }
            const loc = d.location;
            let matched = false;
            for (const region of REGIONS) {
                if (region.keywords.some(kw => loc.includes(kw))) {
                    regionCounts[region.label]++;
                    matched = true;
                    break;
                }
            }
            if (!matched) unmapped++;
        });

        const total = deals.length;
        const maxCount = Math.max(...Object.values(regionCounts), 1);

        const regionMeta = {
            '서울': { icon: '🏙️', color: '#6366f1' },
            '인천': { icon: '🌊', color: '#0ea5e9' },
            '경기': { icon: '🏘️', color: '#10b981' },
            '강원': { icon: '⛰️', color: '#06b6d4' },
            '충청': { icon: '🌾', color: '#a78bfa' },
            '전라': { icon: '🌿', color: '#ec4899' },
            '경상': { icon: '🏭', color: '#f97316' },
            '부산': { icon: '⚓', color: '#f59e0b' },
            '제주': { icon: '🍊', color: '#14b8a6' }
        };

        // 딜 수 기준 내림차순 정렬
        const sorted = REGIONS.map(r => ({
            label: r.label,
            count: regionCounts[r.label],
            ...regionMeta[r.label]
        })).sort((a, b) => b.count - a.count);

        const cards = sorted.map(r => {
            const pct = total > 0 ? ((r.count / total) * 100).toFixed(0) : 0;
            const barW = r.count > 0 ? Math.max(8, (r.count / maxCount) * 100) : 0;
            const isTop = r.count === maxCount && r.count > 0;
            const glowStyle = isTop ? `box-shadow:0 0 12px ${r.color}30;border-color:${r.color}40;` : '';

            return `
                <div style="
                    background:rgba(255,255,255,0.03);
                    border:1px solid rgba(255,255,255,0.06);
                    border-radius:10px;
                    padding:10px 12px;
                    display:flex;
                    flex-direction:column;
                    gap:6px;
                    cursor:${r.count > 0 ? 'pointer' : 'default'};
                    transition:all 0.2s ease;
                    ${glowStyle}
                " onmouseenter="this.style.background='rgba(255,255,255,0.07)';this.style.transform='translateY(-1px)'"
                   onmouseleave="this.style.background='rgba(255,255,255,0.03)';this.style.transform=''"
                   ${r.count > 0 ? `onclick="App.filterByRegion('${r.label}')"` : ''}>
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="font-size:1.1rem;">${r.icon}</span>
                            <span style="font-size:0.78rem;font-weight:600;color:var(--text-primary);">${r.label}</span>
                        </div>
                        <div style="display:flex;align-items:baseline;gap:3px;">
                            <span style="font-size:1rem;font-weight:800;color:${r.count > 0 ? r.color : 'var(--text-muted)'};">${r.count}</span>
                            <span style="font-size:0.6rem;color:var(--text-muted);">건</span>
                        </div>
                    </div>
                    <div style="position:relative;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;">
                        <div style="height:100%;width:${barW}%;background:${r.color};border-radius:2px;transition:width 0.6s ease;"></div>
                    </div>
                    <div style="font-size:0.6rem;color:var(--text-muted);text-align:right;">${pct}%</div>
                </div>`;
        }).join('');

        const unmappedHtml = unmapped > 0
            ? `<div style="text-align:center;font-size:0.65rem;color:var(--text-muted);margin-top:4px;">미분류 ${unmapped}건</div>` : '';

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:2px;">
                ${cards}
            </div>
            ${unmappedHtml}
        `;
    }
};
