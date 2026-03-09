// ============================================================
// ui.js — UI 렌더링 모듈
// ============================================================

const UI = {
    // ---- Dashboard ----
    renderDashboard(deals) {
        const statsContainer = document.getElementById('dashboardStats');
        const donutContainer = document.getElementById('donutChart');
        const activityContainer = document.getElementById('activityFeed');

        // 상태별 카운트
        const total = deals.length;
        const statusCounts = {};
        Object.values(DEAL_STATUS).forEach(s => statusCounts[s] = 0);
        deals.forEach(d => { if (statusCounts[d.status] !== undefined) statusCounts[d.status]++; });

        // 총 매출, 평균 희망가격
        const totalRevenue = deals.reduce((sum, d) => sum + (Number(d.revenue) || 0), 0);
        const avgPrice = deals.length > 0
            ? Math.round(deals.reduce((sum, d) => sum + (Number(d.askingPrice) || 0), 0) / deals.length)
            : 0;

        const statCards = [
            { icon: '📋', value: total, label: '전체 딜', filter: '', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
            { icon: '🆕', value: statusCounts['신규'], label: '신규', filter: '신규', gradient: 'linear-gradient(135deg, #a78bfa, #6366f1)' },
            { icon: '🔍', value: statusCounts['검토중'], label: '검토중', filter: '검토중', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
            { icon: '⭐', value: statusCounts['관심'], label: '관심', filter: '관심', gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
            { icon: '🤝', value: statusCounts['미팅진행'], label: '미팅진행', filter: '미팅진행', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
            { icon: '✅', value: statusCounts['완료'], label: '완료', filter: '완료', gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)' },
            { icon: '⏸️', value: statusCounts['보류'], label: '보류', filter: '보류', gradient: 'linear-gradient(135deg, #94a3b8, #64748b)' }
        ];

        statsContainer.innerHTML = statCards.map(s => `
            <div class="stat-card" style="--stat-gradient: ${s.gradient}; cursor:pointer;" 
                 onclick="App.filterByStatus('${s.filter}')" title="${s.label} 딜 보기">
                <div class="stat-card__icon-wrap" style="background: ${s.gradient}">
                    ${s.icon}
                </div>
                <div class="stat-card__info">
                    <div class="stat-card__value" data-count-target="${s.value}">0</div>
                    <div class="stat-card__label">${s.label}</div>
                </div>
            </div>
        `).join('');

        // Count-up animation
        this._animateCountUp();

        // ---- Donut Chart ----
        this._renderDonutChart(deals, donutContainer, total);

        // ---- Activity Feed ----
        this._renderActivityFeed(deals, activityContainer);

        // ---- Analytics ----
        Analytics.renderMonthlyTrend(deals, document.getElementById('analyticsMonthly'));
        Analytics.renderSuccessRate(deals, document.getElementById('analyticsSuccessRate'));
        Analytics.renderIndustryAvgPrice(deals, document.getElementById('analyticsIndustryPrice'));
        Analytics.renderRegionDistribution(deals, document.getElementById('analyticsRegion'));

        // ---- Notification badge ----
        Notifications.renderPanel();
    },

    // Count-up animation
    _animateCountUp() {
        const els = document.querySelectorAll('[data-count-target]');
        els.forEach(el => {
            const target = parseInt(el.dataset.countTarget) || 0;
            if (target === 0) { el.textContent = '0'; return; }
            const duration = 800;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);
                el.textContent = current.toLocaleString('ko-KR');
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target.toLocaleString('ko-KR');
                    el.classList.add('count-up-done');
                }
            }
            requestAnimationFrame(update);
        });
    },

    // Donut chart (SVG)
    _renderDonutChart(deals, container, total) {
        const industryCounts = {};
        deals.forEach(d => {
            if (d.industry) {
                industryCounts[d.industry] = (industryCounts[d.industry] || 0) + 1;
            }
        });

        const sorted = Object.entries(industryCounts).sort((a, b) => b[1] - a[1]);

        if (sorted.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center;">등록된 딜이 없습니다.</p>';
            return;
        }

        // Donut colors
        const donutColors = [
            '#6366f1', '#06b6d4', '#10b981', '#f59e0b',
            '#ef4444', '#a78bfa', '#ec4899', '#14b8a6',
            '#f97316', '#8b5cf6', '#64748b', '#22d3ee'
        ];

        const radius = 62;
        const circumference = 2 * Math.PI * radius;
        let cumulativeOffset = 0;

        const circles = sorted.map(([industry, count], i) => {
            const pct = count / total;
            const dashLen = pct * circumference;
            const gapLen = circumference - dashLen;
            const offset = -cumulativeOffset;
            cumulativeOffset += dashLen;
            const color = donutColors[i % donutColors.length];

            return `<circle cx="90" cy="90" r="${radius}"
                stroke="${color}" 
                stroke-dasharray="0 ${circumference}" 
                stroke-dashoffset="${offset}"
                data-dash-target="${dashLen} ${gapLen}"
                data-dash-offset="${offset}"
                style="opacity: 0.85;"
            />`;
        });

        const legend = sorted.map(([industry, count], i) => {
            const color = donutColors[i % donutColors.length];
            const pct = ((count / total) * 100).toFixed(0);
            return `
                <div class="donut-legend__item">
                    <div class="donut-legend__color" style="background:${color}"></div>
                    <span class="donut-legend__label">${industry}</span>
                    <span class="donut-legend__count">${count} <span style="color:var(--text-muted);font-weight:400;font-size:0.7rem;">(${pct}%)</span></span>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="donut-chart-wrap">
                <div class="donut-chart">
                    <svg viewBox="0 0 180 180">
                        ${circles.join('')}
                    </svg>
                    <div class="donut-chart__center">
                        <div class="donut-chart__center-value" data-count-target="${total}">0</div>
                        <div class="donut-chart__center-label">전체 딜</div>
                    </div>
                </div>
                <div class="donut-legend">
                    ${legend}
                </div>
            </div>
        `;

        // Animate donut segments
        requestAnimationFrame(() => {
            setTimeout(() => {
                container.querySelectorAll('circle[data-dash-target]').forEach(circle => {
                    const target = circle.dataset.dashTarget;
                    circle.setAttribute('stroke-dasharray', target);
                });
                // Count-up center number
                const centerVal = container.querySelector('[data-count-target]');
                if (centerVal) {
                    const target = parseInt(centerVal.dataset.countTarget) || 0;
                    const duration = 800;
                    const start = performance.now();
                    function tick(now) {
                        const p = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - p, 3);
                        centerVal.textContent = Math.round(eased * target);
                        if (p < 1) requestAnimationFrame(tick);
                        else centerVal.textContent = target;
                    }
                    requestAnimationFrame(tick);
                }
            }, 100);
        });
    },

    // Activity feed
    _renderActivityFeed(deals, container) {
        // Collect all activities from all deals
        const activities = [];

        deals.forEach(d => {
            // Deal registration
            activities.push({
                type: 'new',
                icon: '📥',
                text: `<strong>${d.companyName}</strong> 딜 등록`,
                date: d.createdAt
            });

            // Timeline entries
            if (d.timeline && d.timeline.length > 0) {
                d.timeline.forEach(t => {
                    activities.push({
                        type: 'update',
                        icon: '📝',
                        text: `<strong>${d.companyName}</strong> — ${t.content}`,
                        date: t.date
                    });
                });
            }

            // Status change (use updatedAt if different from createdAt)
            if (d.updatedAt && d.updatedAt !== d.createdAt) {
                activities.push({
                    type: 'status',
                    icon: '🔄',
                    text: `<strong>${d.companyName}</strong> 정보 업데이트`,
                    date: d.updatedAt
                });
            }
        });

        // Sort newest first, take top 10
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const top = activities.slice(0, 10);

        if (top.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center;">최근 활동이 없습니다.</p>';
            return;
        }

        const iconClass = { new: 'new', update: 'update', status: 'status' };

        container.innerHTML = `
            <div class="activity-feed">
                ${top.map(a => `
                    <div class="activity-item">
                        <div class="activity-item__icon activity-item__icon--${iconClass[a.type] || 'new'}">
                            ${a.icon}
                        </div>
                        <div class="activity-item__body">
                            <div class="activity-item__title">${a.text}</div>
                            <div class="activity-item__time">${formatDateTime(a.date)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ---- Deal List ----
    renderDealList(deals, selectedIds = []) {
        const container = document.getElementById('dealGrid');
        const countEl = document.getElementById('dealCount');

        if (countEl) countEl.textContent = `${deals.length}건`;

        if (deals.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state__icon">📭</div>
                    <div class="empty-state__text">조건에 맞는 딜이 없습니다</div>
                </div>
            `;
            return;
        }

        // Favorites first
        const sorted = [...deals].sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return 0;
        });

        container.innerHTML = sorted.map((deal, i) => {
            const isChecked = selectedIds.includes(deal.id);
            const favClass = deal.isFavorite ? 'active' : '';
            const favCardClass = deal.isFavorite ? 'is-favorite' : '';
            const ddayHtml = deal.deadline ? `<span class="dday-badge ${getDdayClass(deal.deadline)}">⏰ ${formatDday(deal.deadline)}</span>` : '';

            return `
                <div class="deal-card-swipe-wrap">
                    <div class="swipe-bg swipe-bg--edit">✏️ 편집</div>
                    <div class="swipe-bg swipe-bg--delete">🗑️ 삭제</div>
                    <div class="deal-card ${favCardClass}" data-deal-id="${deal.id}" style="animation-delay: ${i * 0.05}s">
                        <div class="deal-card__checkbox" onclick="event.stopPropagation()">
                            <button class="favorite-btn ${favClass}" onclick="event.stopPropagation(); App.toggleFavorite('${deal.id}')" title="즐겨찾기">⭐</button>
                            <input type="checkbox" 
                                data-compare-id="${deal.id}" 
                                ${isChecked ? 'checked' : ''}
                                onchange="App.toggleCompare('${deal.id}', this.checked)"
                                data-tooltip="비교 선택">
                        </div>
                        <div class="deal-card__header">
                            <div>
                                <div class="deal-card__company">${deal.companyName || '미입력'}</div>
                                <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                                    <span class="deal-card__industry">${deal.industry || '미분류'}</span>
                                    ${ddayHtml}
                                </div>
                            </div>
                        </div>
                        <div class="deal-card__financials">
                            <div class="deal-card__metric">
                                <div class="deal-card__metric-value">${formatCurrency(deal.revenue)}</div>
                                <div class="deal-card__metric-label">매출액</div>
                            </div>
                            <div class="deal-card__metric">
                                <div class="deal-card__metric-value">${formatCurrency(deal.operatingProfit)}</div>
                                <div class="deal-card__metric-label">영업이익</div>
                            </div>
                            <div class="deal-card__metric">
                                <div class="deal-card__metric-value">${formatCurrency(deal.askingPrice)}</div>
                                <div class="deal-card__metric-label">희망가격</div>
                            </div>
                        </div>
                        <div class="deal-card__footer">
                            <span class="deal-card__location">📍 ${deal.location || '-'}</span>
                            <span class="badge badge--${deal.status}">${deal.status}</span>
                        </div>
                        <div class="deal-card__footer" style="margin-top: var(--space-sm);">
                            <span class="deal-card__date">등록: ${formatDate(deal.createdAt)}</span>
                            ${Attachments.renderCardCount(deal.attachments)}
                        </div>
                        ${Tags.renderCardTags(deal.tags)}
                    </div>
                </div>
            `;
        }).join('');

        // card click → detail
        container.querySelectorAll('.deal-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.deal-card__checkbox')) return;
                const id = card.dataset.dealId;
                App.showDetail(id);
            });
        });
    },

    // ---- Deal Detail Modal ----
    renderDetail(deal) {
        const modal = document.getElementById('detailModal');
        const body = modal.querySelector('.modal__body');

        const ddayHtml = deal.deadline ? `<span class="dday-badge ${getDdayClass(deal.deadline)}" style="font-size:0.8rem; padding:5px 14px;">⏰ ${formatDday(deal.deadline)} (${deal.deadline})</span>` : '';
        const favBtnClass = deal.isFavorite ? 'active' : '';

        body.innerHTML = `
            <div style="display:flex; align-items:center; gap: var(--space-md); margin-bottom: var(--space-lg); flex-wrap:wrap;">
                <button class="favorite-btn ${favBtnClass}" onclick="App.toggleFavorite('${deal.id}'); App.showDetail('${deal.id}');" title="즐겨찾기" style="font-size:1.4rem;">⭐</button>
                <span class="badge badge--${deal.status}" style="font-size:0.85rem; padding:6px 16px;">${deal.status}</span>
                ${ddayHtml}
                <span style="color:var(--text-muted); font-size:0.85rem; margin-left:auto;">등록일: ${formatDate(deal.createdAt)} | 수정일: ${formatDate(deal.updatedAt)}</span>
            </div>

            <!-- 메가인포 담당 정보 -->
            ${(deal.megainfoDept || deal.megainfoContact) ? `
            <div class="detail-section">
                <div class="detail-section__title">📌 메가인포 담당</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-item__label">담당부서</div>
                        <div class="detail-item__value">${deal.megainfoDept || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">담당자</div>
                        <div class="detail-item__value">${deal.megainfoContact || '-'}</div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- 기본 정보 -->
            <div class="detail-section">
                <div class="detail-section__title">🏢 기본 정보</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-item__label">회사명</div>
                        <div class="detail-item__value">${deal.companyName || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">업종</div>
                        <div class="detail-item__value">${deal.industry || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">소재지</div>
                        <div class="detail-item__value">${deal.location || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">설립연도</div>
                        <div class="detail-item__value">${deal.foundedYear || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">종업원 수</div>
                        <div class="detail-item__value">${deal.employeeCount ? deal.employeeCount + '명' : '-'}</div>
                    </div>
                </div>
            </div>

            <!-- 재무 정보 -->
            <div class="detail-section">
                <div class="detail-section__title">💰 재무 정보</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-item__label">매출액</div>
                        <div class="detail-item__value">${formatCurrency(deal.revenue)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">영업이익</div>
                        <div class="detail-item__value">${formatCurrency(deal.operatingProfit)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">순이익</div>
                        <div class="detail-item__value">${formatCurrency(deal.netIncome)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">총자산</div>
                        <div class="detail-item__value">${formatCurrency(deal.totalAssets)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">부채비율</div>
                        <div class="detail-item__value">${formatPercent(deal.debtRatio)}</div>
                    </div>
                </div>
            </div>

            <!-- 딜 정보 -->
            <div class="detail-section">
                <div class="detail-section__title">📑 딜 정보</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-item__label">매각사유</div>
                        <div class="detail-item__value">${deal.saleReason || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">희망가격</div>
                        <div class="detail-item__value">${formatCurrency(deal.askingPrice)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">매각지분율</div>
                        <div class="detail-item__value">${deal.sharePercentage ? deal.sharePercentage + '%' : '-'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item__label">딜 구조</div>
                        <div class="detail-item__value">${deal.dealStructure || '-'}</div>
                    </div>
                </div>
            </div>

            <!-- 핵심역량 & 메모 -->
            <div class="detail-section">
                <div class="detail-section__title">💡 핵심역량 & 메모</div>
                <div class="detail-grid">
                    <div class="detail-item detail-item--full">
                        <div class="detail-item__label">핵심역량</div>
                        <div class="detail-item__value">${deal.coreCompetency || '-'}</div>
                    </div>
                    <div class="detail-item detail-item--full">
                        <div class="detail-item__label">판단 메모</div>
                        <div class="detail-item__value">${deal.memo || '-'}</div>
                    </div>
                </div>
            </div>

            <!-- 태그 관리 -->
            <div class="detail-section">
                <div class="detail-section__title">🏷️ 태그 / 라벨</div>
                <div id="detailTags"></div>
            </div>

            <!-- 타임라인 -->
            <div class="detail-section">
                <div class="detail-section__title">📅 진행 타임라인</div>
                <div id="detailTimeline"></div>
            </div>

            <!-- 첨부파일 -->
            <div class="detail-section">
                <div class="detail-section__title">📎 첨부파일 / 문서 관리</div>
                <div id="detailAttachments"></div>
            </div>

            <!-- 간이 밸류에이션 -->
            <div id="detailValuation"></div>
        `;

        // 타임라인 렌더링
        Timeline.render(deal);

        // 태그 렌더링
        const tagsEl = document.getElementById('detailTags');
        if (tagsEl) tagsEl.innerHTML = Tags.renderTagList(deal.id, deal.tags);

        // 첨부파일 렌더링
        const attachEl = document.getElementById('detailAttachments');
        if (attachEl) attachEl.innerHTML = Attachments.renderList(deal.id, deal.attachments);

        // 간이 밸류에이션 렌더링
        this._renderValuation(deal);

        // 모달 footer 버튼
        const footer = modal.querySelector('.modal__footer');
        footer.innerHTML = `
            <button class="btn btn-secondary" onclick="Report.showTemplateSelector('${deal.id}')">📝 리포트</button>
            <button class="btn btn-secondary" onclick="PrintReport.printDeal('${deal.id}')">🖨️ 인쇄</button>
            <button class="btn btn-secondary" onclick="App.showEditForm('${deal.id}')">✏️ 수정</button>
            <button class="btn btn-danger" onclick="App.deleteDeal('${deal.id}')">🗑️ 삭제</button>
        `;

        this.openModal('detailModal');
    },

    // ---- Deal Form (새 딜 등록 / 수정) ----
    renderForm(deal = null) {
        const modal = document.getElementById('formModal');
        const title = modal.querySelector('.modal__header h2');
        const body = modal.querySelector('.modal__body');

        const isEdit = deal !== null;
        title.textContent = isEdit ? '딜 수정' : '새 딜 등록';

        const d = deal || createDeal();

        const industryOptions = INDUSTRIES.map(ind =>
            `<option value="${ind}" ${d.industry === ind ? 'selected' : ''}>${ind}</option>`
        ).join('');

        const statusOptions = Object.values(DEAL_STATUS).map(s =>
            `<option value="${s}" ${d.status === s ? 'selected' : ''}>${s}</option>`
        ).join('');

        const structureOptions = DEAL_STRUCTURES.map(ds =>
            `<option value="${ds}" ${d.dealStructure === ds ? 'selected' : ''}>${ds}</option>`
        ).join('');

        body.innerHTML = `
            <form id="dealForm" class="form-grid">
                <input type="hidden" name="id" value="${d.id}">
                <input type="hidden" name="isEdit" value="${isEdit}">

                <div class="form-section-title">📌 메가인포 담당</div>

                <div class="form-group">
                    <label>담당부서 <span class="required">*</span></label>
                    <input type="text" name="megainfoDept" class="form-input" value="${d.megainfoDept || ''}" placeholder="예: 투자은행본부" required>
                </div>
                <div class="form-group">
                    <label>담당자 <span class="required">*</span></label>
                    <input type="text" name="megainfoContact" class="form-input" value="${d.megainfoContact || ''}" placeholder="예: 홍길동 팀장" required>
                </div>

                <div class="form-section-title">🏢 기본 정보</div>

                <div class="form-group">
                    <label>회사명 <span class="required">*</span></label>
                    <input type="text" name="companyName" class="form-input" value="${d.companyName}" placeholder="회사명 입력" required>
                </div>
                <div class="form-group">
                    <label>업종 <span class="required">*</span></label>
                    <select name="industry" class="form-select" required>
                        <option value="">업종 선택</option>
                        ${industryOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>소재지</label>
                    <input type="text" name="location" class="form-input" value="${d.location}" placeholder="예: 서울 강남구">
                </div>
                <div class="form-group">
                    <label>설립연도</label>
                    <input type="number" name="foundedYear" class="form-input" value="${d.foundedYear}" placeholder="예: 2015" min="1900" max="2030">
                </div>
                <div class="form-group">
                    <label>종업원 수</label>
                    <input type="number" name="employeeCount" class="form-input" value="${d.employeeCount}" placeholder="예: 50" min="0">
                </div>
                <div class="form-group">
                    <label>상태</label>
                    <select name="status" class="form-select">
                        ${statusOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>검토 마감일</label>
                    <input type="date" name="deadline" class="form-input" value="${d.deadline || ''}">
                </div>

                <div class="form-section-title">💰 재무 정보 (단위: 억원)</div>

                <div class="form-group">
                    <label>매출액 <span class="required">*</span></label>
                    <input type="number" name="revenue" class="form-input" value="${d.revenue}" placeholder="억원" step="0.1" required>
                </div>
                <div class="form-group">
                    <label>영업이익 <span class="required">*</span></label>
                    <input type="number" name="operatingProfit" class="form-input" value="${d.operatingProfit}" placeholder="억원" step="0.1" required>
                </div>
                <div class="form-group">
                    <label>순이익 <span class="required">*</span></label>
                    <input type="number" name="netIncome" class="form-input" value="${d.netIncome}" placeholder="억원" step="0.1" required>
                </div>
                <div class="form-group">
                    <label>총자산 <span class="required">*</span></label>
                    <input type="number" name="totalAssets" class="form-input" value="${d.totalAssets}" placeholder="억원" step="0.1" required>
                </div>
                <div class="form-group">
                    <label>부채비율 (%) <span class="required">*</span></label>
                    <input type="number" name="debtRatio" class="form-input" value="${d.debtRatio}" placeholder="%" step="0.1" min="0" required>
                </div>

                <div class="form-section-title">📑 딜 정보</div>

                <div class="form-group form-group--full">
                    <label>매각사유</label>
                    <input type="text" name="saleReason" class="form-input" value="${d.saleReason}" placeholder="매각 사유 입력">
                </div>
                <div class="form-group">
                    <label>희망가격 (억원)</label>
                    <input type="number" name="askingPrice" class="form-input" value="${d.askingPrice}" placeholder="억원" step="0.1">
                </div>
                <div class="form-group">
                    <label>매각지분율 (%)</label>
                    <input type="number" name="sharePercentage" class="form-input" value="${d.sharePercentage}" placeholder="%" step="1" min="0" max="100">
                </div>
                <div class="form-group">
                    <label>딜 구조</label>
                    <select name="dealStructure" class="form-select">
                        <option value="">딜 구조 선택</option>
                        ${structureOptions}
                    </select>
                </div>

                <div class="form-section-title">💡 기타</div>

                <div class="form-group form-group--full">
                    <label>핵심역량</label>
                    <textarea name="coreCompetency" class="form-textarea" placeholder="핵심 기술, 특허, 주요 고객 등">${d.coreCompetency}</textarea>
                </div>
                <div class="form-group form-group--full">
                    <label>판단 메모</label>
                    <textarea name="memo" class="form-textarea" placeholder="내부 검토 의견">${d.memo}</textarea>
                </div>
            </form>
        `;

        const footer = modal.querySelector('.modal__footer');
        footer.innerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal('formModal')">취소</button>
            <button class="btn btn-primary" onclick="App.saveDeal()">💾 ${isEdit ? '수정 저장' : '등록'}</button>
        `;

        this.openModal('formModal');
    },

    // ---- Modal Helpers ----
    openModal(id) {
        document.getElementById(id).classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal(id) {
        document.getElementById(id).classList.remove('active');
        document.body.style.overflow = '';
    },

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
    },

    // ---- Toast Notifications ----
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ---- Valuation Section in Detail ----
    _renderValuation(deal) {
        const container = document.getElementById('detailValuation');
        if (!container) return;

        const val = calcSimpleValuation(deal);
        if (val.methods.length === 0) {
            container.innerHTML = `
                <div class="valuation-section" style="opacity:0.6;">
                    <div class="valuation-header">
                        <span class="valuation-header__title">📐 간이 밸류에이션</span>
                    </div>
                    <p style="color:var(--text-muted); font-size:0.85rem; text-align:center;">재무 데이터가 부족하여 밸류에이션을 산출할 수 없습니다.</p>
                </div>
            `;
            return;
        }

        const askingPrice = Number(deal.askingPrice) || 0;
        let gaugeHtml = '';

        if (askingPrice > 0 && val.avgValue) {
            const ratio = (askingPrice / val.avgValue) * 100;
            const gaugePct = Math.min(ratio, 200);
            const gaugeWidth = (gaugePct / 200) * 100;
            let gaugeClass, verdictText, verdictColor;

            if (ratio <= 80) {
                gaugeClass = 'val-gauge__fill--cheap';
                verdictText = '💚 희망가격이 추정가치 대비 저렴 (할인율 ' + (100 - ratio).toFixed(0) + '%)';
                verdictColor = 'var(--accent-success)';
            } else if (ratio <= 120) {
                gaugeClass = 'val-gauge__fill--fair';
                verdictText = '💙 희망가격이 추정가치와 유사 (' + ratio.toFixed(0) + '%)';
                verdictColor = 'var(--accent-secondary)';
            } else {
                gaugeClass = 'val-gauge__fill--expensive';
                verdictText = '🔶 희망가격이 추정가치 대비 높음 (프리미엄 ' + (ratio - 100).toFixed(0) + '%)';
                verdictColor = 'var(--accent-warning)';
            }

            gaugeHtml = `
                <div class="val-gauge">
                    <div class="val-gauge__fill ${gaugeClass}" style="width: ${gaugeWidth}%"></div>
                </div>
                <div class="val-gauge__labels">
                    <span>0</span>
                    <span>추정가치 ${formatCurrency(val.avgValue)}</span>
                    <span>희망가 ${formatCurrency(askingPrice)}</span>
                </div>
                <div class="val-gauge__verdict" style="color:${verdictColor}">${verdictText}</div>
            `;
        }

        container.innerHTML = `
            <div class="valuation-section">
                <div class="valuation-header">
                    <span class="valuation-header__title">📐 간이 밸류에이션</span>
                    ${val.avgValue ? `
                        <div class="valuation-avg">
                            <span class="valuation-avg__value">${formatCurrency(val.avgValue)}</span>
                            <span class="valuation-avg__label">평균 추정가치</span>
                        </div>
                    ` : ''}
                </div>
                <div class="valuation-methods">
                    ${val.methods.map(m => `
                        <div class="val-method">
                            <div class="val-method__name">${m.name}</div>
                            <div class="val-method__value">${formatCurrency(m.value)}</div>
                            <div class="val-method__detail">${m.detail}</div>
                        </div>
                    `).join('')}
                </div>
                ${gaugeHtml}
            </div>
        `;
    },

    // ---- Filter selects init ----
    initFilters() {
        const industryFilter = document.getElementById('filterIndustry');
        const statusFilter = document.getElementById('filterStatus');

        industryFilter.innerHTML = '<option value="">전체 업종</option>' +
            INDUSTRIES.map(i => `<option value="${i}">${i}</option>`).join('');

        statusFilter.innerHTML = '<option value="">전체 상태</option>' +
            Object.values(DEAL_STATUS).map(s => `<option value="${s}">${s}</option>`).join('');
    }
};
