// ============================================================
// print.js — 인쇄용 보고서 생성
// ============================================================

const PrintReport = {
    // 단일 딜 인쇄
    printDeal(dealId) {
        const deal = Storage.getById(dealId);
        if (!deal) {
            UI.showToast('딜 정보를 찾을 수 없습니다.', 'error');
            return;
        }

        UI.closeAllModals();

        const reportEl = document.getElementById('printReport');
        reportEl.innerHTML = this.generateDealReport(deal);
        reportEl.style.display = 'block';

        setTimeout(() => {
            window.print();
            setTimeout(() => {
                reportEl.style.display = 'none';
            }, 500);
        }, 300);
    },

    // 전체 목록 인쇄
    printAll() {
        const deals = Storage.getAll();
        if (deals.length === 0) {
            UI.showToast('인쇄할 딜이 없습니다.', 'error');
            return;
        }

        const reportEl = document.getElementById('printReport');
        reportEl.innerHTML = this.generateListReport(deals);
        reportEl.style.display = 'block';

        setTimeout(() => {
            window.print();
            setTimeout(() => {
                reportEl.style.display = 'none';
            }, 500);
        }, 300);
    },

    generateDealReport(deal) {
        return `
            <div class="print-report__header">
                <h1>M&A 딜 상세 보고서</h1>
                <p>출력일: ${formatDate(new Date().toISOString())}</p>
            </div>

            <h2 style="margin-bottom:12px; font-size:14pt;">${deal.companyName}</h2>

            <table>
                <tr><th colspan="4" style="text-align:center; background:#e0e0e0;">기본 정보</th></tr>
                <tr>
                    <th>업종</th><td>${deal.industry || '-'}</td>
                    <th>소재지</th><td>${deal.location || '-'}</td>
                </tr>
                <tr>
                    <th>설립연도</th><td>${deal.foundedYear || '-'}</td>
                    <th>종업원 수</th><td>${deal.employeeCount ? deal.employeeCount + '명' : '-'}</td>
                </tr>
            </table>

            <table>
                <tr><th colspan="4" style="text-align:center; background:#e0e0e0;">재무 정보</th></tr>
                <tr>
                    <th>매출액</th><td>${formatCurrency(deal.revenue)}</td>
                    <th>영업이익</th><td>${formatCurrency(deal.operatingProfit)}</td>
                </tr>
                <tr>
                    <th>순이익</th><td>${formatCurrency(deal.netIncome)}</td>
                    <th>총자산</th><td>${formatCurrency(deal.totalAssets)}</td>
                </tr>
                <tr>
                    <th>부채비율</th><td>${formatPercent(deal.debtRatio)}</td>
                    <td colspan="2"></td>
                </tr>
            </table>

            <table>
                <tr><th colspan="4" style="text-align:center; background:#e0e0e0;">딜 정보</th></tr>
                <tr>
                    <th>희망가격</th><td>${formatCurrency(deal.askingPrice)}</td>
                    <th>매각지분율</th><td>${deal.sharePercentage ? deal.sharePercentage + '%' : '-'}</td>
                </tr>
                <tr>
                    <th>딜 구조</th><td>${deal.dealStructure || '-'}</td>
                    <th>상태</th><td>${deal.status}</td>
                </tr>
                <tr>
                    <th>매각사유</th><td colspan="3">${deal.saleReason || '-'}</td>
                </tr>
            </table>

            <table>
                <tr><th colspan="2" style="text-align:center; background:#e0e0e0;">핵심역량 & 메모</th></tr>
                <tr>
                    <th style="width:100px;">핵심역량</th>
                    <td>${deal.coreCompetency || '-'}</td>
                </tr>
                <tr>
                    <th>판단 메모</th>
                    <td>${deal.memo || '-'}</td>
                </tr>
            </table>

            ${deal.timeline && deal.timeline.length > 0 ? `
                <table>
                    <tr><th colspan="2" style="text-align:center; background:#e0e0e0;">진행 타임라인</th></tr>
                    <tr><th style="width:140px;">일시</th><th>내용</th></tr>
                    ${deal.timeline.map(t => `
                        <tr><td>${formatDateTime(t.date)}</td><td>${t.content}</td></tr>
                    `).join('')}
                </table>
            ` : ''}
        `;
    },

    generateListReport(deals) {
        return `
            <div class="print-report__header">
                <h1>M&A 딜 목록 보고서</h1>
                <p>출력일: ${formatDate(new Date().toISOString())} | 총 ${deals.length}건</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>회사명</th>
                        <th>업종</th>
                        <th>매출액</th>
                        <th>영업이익</th>
                        <th>희망가격</th>
                        <th>지분율</th>
                        <th>상태</th>
                        <th>등록일</th>
                    </tr>
                </thead>
                <tbody>
                    ${deals.map((d, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${d.companyName || '-'}</td>
                            <td>${d.industry || '-'}</td>
                            <td style="text-align:right;">${formatCurrency(d.revenue)}</td>
                            <td style="text-align:right;">${formatCurrency(d.operatingProfit)}</td>
                            <td style="text-align:right;">${formatCurrency(d.askingPrice)}</td>
                            <td style="text-align:center;">${d.sharePercentage ? d.sharePercentage + '%' : '-'}</td>
                            <td>${d.status}</td>
                            <td>${formatDate(d.createdAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
};
