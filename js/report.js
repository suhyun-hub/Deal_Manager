// ============================================================
// report.js — 딜 요약 리포트 템플릿 자동 생성
// ============================================================

const Report = {
    // 리포트 템플릿 유형
    templates: [
        {
            id: 'executive',
            icon: '📋',
            name: '경영진 보고용',
            desc: '핵심 재무 + 밸류에이션 요약'
        },
        {
            id: 'email',
            icon: '📧',
            name: '이메일 공유용',
            desc: '간략 소개 + 투자 포인트'
        },
        {
            id: 'comparison',
            icon: '⚖️',
            name: '비교 분석표',
            desc: '선택 딜 비교 요약 테이블'
        },
        {
            id: 'full',
            icon: '📑',
            name: '전체 상세 보고서',
            desc: '전 항목 + 타임라인 + 밸류에이션'
        }
    ],

    // 리포트 선택 모달 표시
    showTemplateSelector(dealId) {
        const modal = document.getElementById('reportModal');
        const body = modal.querySelector('.modal__body');

        const deal = Storage.getById(dealId);
        if (!deal) return;

        body.innerHTML = `
            <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:var(--space-md);">
                <strong>${deal.companyName}</strong> 딜에 대한 리포트 템플릿을 선택하세요.
            </p>
            <div class="report-template-selector">
                ${this.templates.filter(t => t.id !== 'comparison').map(t => `
                    <div class="report-template-card" onclick="Report.generate('${dealId}', '${t.id}')">
                        <div class="report-template-card__icon">${t.icon}</div>
                        <div class="report-template-card__name">${t.name}</div>
                        <div class="report-template-card__desc">${t.desc}</div>
                    </div>
                `).join('')}
            </div>
        `;

        UI.openModal('reportModal');
    },

    // 리포트 생성
    generate(dealId, templateId) {
        const deal = Storage.getById(dealId);
        if (!deal) return;

        let content = '';

        switch (templateId) {
            case 'executive':
                content = this._genExecutive(deal);
                break;
            case 'email':
                content = this._genEmail(deal);
                break;
            case 'full':
                content = this._genFull(deal);
                break;
        }

        this._showResult(content, deal.companyName);
    },

    // 비교 리포트 생성
    generateComparison(dealIds) {
        const deals = dealIds.map(id => Storage.getById(id)).filter(Boolean);
        if (deals.length < 2) {
            UI.showToast('2개 이상의 딜을 선택해주세요.', 'error');
            return;
        }
        const content = this._genComparison(deals);
        this._showResult(content, '비교 분석');
    },

    // 결과 표시
    _showResult(content, title) {
        const modal = document.getElementById('reportModal');
        const body = modal.querySelector('.modal__body');
        const footer = modal.querySelector('.modal__footer');

        body.innerHTML = `
            <div style="background:var(--bg-primary); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:var(--space-lg); max-height:60vh; overflow-y:auto;">
                <pre style="white-space:pre-wrap; font-family:'Pretendard','Noto Sans KR',sans-serif; font-size:0.82rem; color:var(--text-primary); line-height:1.7; margin:0;">${content}</pre>
            </div>
        `;

        footer.innerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal('reportModal')">닫기</button>
            <button class="btn btn-secondary" onclick="Report.copyToClipboard()">📋 복사</button>
            <button class="btn btn-primary" onclick="Report.printReport()">🖨️ 인쇄</button>
        `;
    },

    // 클립보드 복사
    copyToClipboard() {
        const pre = document.querySelector('#reportModal pre');
        if (!pre) return;
        navigator.clipboard.writeText(pre.textContent).then(() => {
            UI.showToast('리포트가 클립보드에 복사되었습니다.', 'success');
        }).catch(() => {
            // fallback
            const range = document.createRange();
            range.selectNode(pre);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            UI.showToast('리포트가 복사되었습니다.', 'success');
        });
    },

    // 인쇄
    printReport() {
        const pre = document.querySelector('#reportModal pre');
        if (!pre) return;
        const printWin = window.open('', '_blank');
        printWin.document.write(`
            <html><head><title>M&A 딜 리포트</title>
            <style>
                body { font-family: 'Malgun Gothic', sans-serif; padding: 40px; font-size: 13px; line-height: 1.8; color: #111; }
                pre { white-space: pre-wrap; font-family: inherit; }
                h1 { font-size: 18px; margin-bottom: 20px; }
            </style>
            </head><body><pre>${pre.textContent}</pre></body></html>
        `);
        printWin.document.close();
        printWin.print();
    },

    // ---- 템플릿 생성 함수들 ----

    _genExecutive(deal) {
        const val = calcSimpleValuation(deal);
        const valSection = val.methods.length > 0
            ? val.methods.map(m => `  • ${m.name}: ${formatCurrency(m.value)} (${m.detail})`).join('\n') + `\n  ▶ 평균 추정가치: ${formatCurrency(val.avgValue)}`
            : '  (재무 데이터 부족)';

        const ddayText = deal.deadline ? `D-Day: ${formatDday(deal.deadline)} (${deal.deadline})` : '마감일 미설정';
        const tagsText = (deal.tags || []).map(t => t.name).join(', ') || '없음';

        return `━━━━━━━━━━━━━━━━━━━━━━━━━━
 📋  경영진 보고 — 딜 요약 리포트
━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 기업 개요
  회사명:    ${deal.companyName || '-'}
  업종:      ${deal.industry || '-'}
  소재지:    ${deal.location || '-'}
  설립연도:  ${deal.foundedYear || '-'}
  종업원 수: ${deal.employeeCount ? deal.employeeCount + '명' : '-'}
  상태:      ${deal.status}
  태그:      ${tagsText}
  ${ddayText}

■ 핵심 재무지표
  매출액:    ${formatCurrency(deal.revenue)}
  영업이익:  ${formatCurrency(deal.operatingProfit)}
  순이익:    ${formatCurrency(deal.netIncome)}
  총자산:    ${formatCurrency(deal.totalAssets)}
  부채비율:  ${formatPercent(deal.debtRatio)}

■ 딜 조건
  희망가격:   ${formatCurrency(deal.askingPrice)}
  매각지분:   ${deal.sharePercentage ? deal.sharePercentage + '%' : '-'}
  딜 구조:    ${deal.dealStructure || '-'}
  매각사유:   ${deal.saleReason || '-'}

■ 간이 밸류에이션
${valSection}

■ 핵심역량
  ${deal.coreCompetency || '-'}

■ 검토 의견
  ${deal.memo || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
작성일: ${new Date().toLocaleDateString('ko-KR')}
메가인포 경영자문 M&A 딜 관리 시스템`;
    },

    _genEmail(deal) {
        const val = calcSimpleValuation(deal);
        const avgVal = val.avgValue ? formatCurrency(val.avgValue) : '(산출 불가)';
        const tagsText = (deal.tags || []).map(t => t.name).join(', ');

        return `제목: [M&A 딜 소개] ${deal.companyName} — ${deal.industry}

안녕하세요,

아래 M&A 딜을 소개드립니다.

─────────────────────────

📌 기업 개요
• 회사명: ${deal.companyName}
• 업종: ${deal.industry} | 소재지: ${deal.location || '-'}
• 설립: ${deal.foundedYear || '-'} | 종업원: ${deal.employeeCount ? deal.employeeCount + '명' : '-'}
${tagsText ? `• 키워드: ${tagsText}` : ''}

💰 재무 요약
• 매출액: ${formatCurrency(deal.revenue)}
• 영업이익: ${formatCurrency(deal.operatingProfit)}
• 순이익: ${formatCurrency(deal.netIncome)}

📊 딜 조건
• 희망가격: ${formatCurrency(deal.askingPrice)}
• 추정가치: ${avgVal}
• 매각지분: ${deal.sharePercentage ? deal.sharePercentage + '%' : '-'}
• 딜 구조: ${deal.dealStructure || '-'}

💡 투자 포인트
${deal.coreCompetency || '(정보 미입력)'}

─────────────────────────

상세 내용은 별도 미팅을 통해 안내드리겠습니다.
관심 있으시면 회신 부탁드립니다.

감사합니다.
메가인포 경영자문`;
    },

    _genFull(deal) {
        const val = calcSimpleValuation(deal);
        const valSection = val.methods.length > 0
            ? val.methods.map(m => `  • ${m.name}: ${formatCurrency(m.value)}\n    └ ${m.detail}`).join('\n') + `\n\n  ▶ 평균 추정가치: ${formatCurrency(val.avgValue)}`
            : '  (재무 데이터 부족으로 산출 불가)';

        const timeline = (deal.timeline || []).map(t =>
            `  ${formatDate(t.date)}  ${t.content}`
        ).join('\n') || '  (기록 없음)';

        const attachments = (deal.attachments || []).map(a =>
            `  ${Attachments.getIcon(a.name)} ${a.name}${a.note ? ' — ' + a.note : ''}`
        ).join('\n') || '  (첨부파일 없음)';

        const tagsText = (deal.tags || []).map(t => `[${t.name}]`).join(' ') || '없음';
        const ddayText = deal.deadline ? `${formatDday(deal.deadline)} (${deal.deadline})` : '미설정';

        return `╔══════════════════════════════════╗
║  📑  전체 상세 보고서              ║
║  ${deal.companyName}
╚══════════════════════════════════╝

■ 상태: ${deal.status}  |  ${ddayText}
■ 태그: ${tagsText}
■ 등록일: ${formatDate(deal.createdAt)}  |  수정일: ${formatDate(deal.updatedAt)}

──── 🏢 기업 정보 ────
  회사명:    ${deal.companyName || '-'}
  업종:      ${deal.industry || '-'}
  소재지:    ${deal.location || '-'}
  설립연도:  ${deal.foundedYear || '-'}
  종업원 수: ${deal.employeeCount ? deal.employeeCount + '명' : '-'}

──── 💰 재무 정보 ────
  매출액:    ${formatCurrency(deal.revenue)}
  영업이익:  ${formatCurrency(deal.operatingProfit)}
  순이익:    ${formatCurrency(deal.netIncome)}
  총자산:    ${formatCurrency(deal.totalAssets)}
  부채비율:  ${formatPercent(deal.debtRatio)}

──── 📑 딜 조건 ────
  매각사유:   ${deal.saleReason || '-'}
  희망가격:   ${formatCurrency(deal.askingPrice)}
  매각지분율: ${deal.sharePercentage ? deal.sharePercentage + '%' : '-'}
  딜 구조:    ${deal.dealStructure || '-'}

──── 📐 간이 밸류에이션 ────
${valSection}

──── 💡 핵심역량 ────
  ${deal.coreCompetency || '-'}

──── 📝 판단 메모 ────
  ${deal.memo || '-'}

──── 📎 첨부파일 ────
${attachments}

──── 📅 타임라인 ────
${timeline}

──────────────────────────────────
작성일시: ${new Date().toLocaleString('ko-KR')}
메가인포 경영자문 M&A 딜 관리 시스템`;
    },

    _genComparison(deals) {
        const header = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚖️  M&A 딜 비교 분석표
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        const colWidth = 20;
        const labels = ['회사명', '업종', '매출액', '영업이익', '순이익', '총자산', '부채비율', '희망가격', '추정가치', '상태', '태그'];
        const pad = (str, w) => {
            const s = String(str || '-');
            return s.length >= w ? s.substring(0, w) : s + ' '.repeat(w - s.length);
        };

        // Build columns
        const cols = deals.map(d => {
            const val = calcSimpleValuation(d);
            return [
                d.companyName || '-',
                d.industry || '-',
                formatCurrency(d.revenue),
                formatCurrency(d.operatingProfit),
                formatCurrency(d.netIncome),
                formatCurrency(d.totalAssets),
                formatPercent(d.debtRatio),
                formatCurrency(d.askingPrice),
                val.avgValue ? formatCurrency(val.avgValue) : '-',
                d.status,
                (d.tags || []).map(t => t.name).join(',') || '-'
            ];
        });

        let table = '항목'.padEnd(12);
        deals.forEach(d => { table += pad(d.companyName, colWidth); });
        table += '\n' + '─'.repeat(12 + colWidth * deals.length) + '\n';

        labels.forEach((label, i) => {
            table += label.padEnd(12);
            cols.forEach(col => { table += pad(col[i], colWidth); });
            table += '\n';
        });

        return header + table + `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n작성일: ${new Date().toLocaleDateString('ko-KR')}\n메가인포 경영자문`;
    }
};
