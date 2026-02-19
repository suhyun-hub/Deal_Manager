// ============================================================
// notifications.js — 알림/리마인더 시스템
// ============================================================

const Notifications = {
    // 알림 확인 (앱 시작 시 호출)
    checkAll() {
        const deals = Storage.getAll();
        const alerts = [];

        deals.forEach(d => {
            // D-Day 마감 체크
            if (d.deadline) {
                const dday = calcDday(d.deadline);
                if (dday > 0) {
                    alerts.push({
                        type: 'overdue',
                        icon: '🚨',
                        title: `마감 초과 D+${dday}`,
                        text: `${d.companyName} — 마감일 ${d.deadline} 초과`,
                        dealId: d.id,
                        priority: 3
                    });
                } else if (dday >= -3 && dday <= 0) {
                    alerts.push({
                        type: 'urgent',
                        icon: '⚠️',
                        title: dday === 0 ? 'D-Day 오늘!' : `마감 ${Math.abs(dday)}일 전`,
                        text: `${d.companyName} — 마감일 ${d.deadline}`,
                        dealId: d.id,
                        priority: 2
                    });
                } else if (dday >= -7 && dday < -3) {
                    alerts.push({
                        type: 'soon',
                        icon: '📢',
                        title: `마감 ${Math.abs(dday)}일 전`,
                        text: `${d.companyName} — ${d.deadline}`,
                        dealId: d.id,
                        priority: 1
                    });
                }
            }

            // 오래 방치된 딜 (30일 이상 업데이트 없음, 완료/보류 제외)
            if (d.status !== '완료' && d.status !== '보류') {
                const lastUpdate = new Date(d.updatedAt || d.createdAt);
                const daysSince = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
                if (daysSince >= 30) {
                    alerts.push({
                        type: 'stale',
                        icon: '💤',
                        title: `${daysSince}일간 미업데이트`,
                        text: `${d.companyName} — 마지막 업데이트: ${formatDate(d.updatedAt || d.createdAt)}`,
                        dealId: d.id,
                        priority: 0
                    });
                }
            }
        });

        // 우선순위 정렬
        alerts.sort((a, b) => b.priority - a.priority);
        return alerts;
    },

    // 알림 패널 렌더링
    renderPanel() {
        const container = document.getElementById('notificationPanel');
        if (!container) return;

        const alerts = this.checkAll();
        const count = alerts.length;

        // 배지 업데이트
        const badge = document.getElementById('notifBadge');
        const bell = badge?.closest('.notif-bell');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
            // Bounce animation
            if (count > 0) {
                badge.classList.remove('bounce');
                void badge.offsetWidth; // reflow to restart animation
                badge.classList.add('bounce');
                if (bell) bell.classList.add('has-notif');
                setTimeout(() => badge.classList.remove('bounce'), 600);
            } else {
                if (bell) bell.classList.remove('has-notif');
            }
        }

        if (count === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:var(--space-xl); color:var(--text-muted);">
                    <div style="font-size:2rem; margin-bottom:var(--space-sm);">✨</div>
                    <div style="font-size:0.85rem;">확인할 알림이 없습니다</div>
                </div>
            `;
            return;
        }

        const typeColors = {
            overdue: '#ef4444',
            urgent: '#f59e0b',
            soon: '#06b6d4',
            stale: '#64748b'
        };

        container.innerHTML = `
            <div class="notif-list">
                ${alerts.map(a => `
                    <div class="notif-item notif-item--${a.type}" onclick="App.showDetail('${a.dealId}'); Notifications.closePanel();" style="cursor:pointer;">
                        <span class="notif-item__icon">${a.icon}</span>
                        <div class="notif-item__body">
                            <div class="notif-item__title" style="color:${typeColors[a.type] || 'var(--text-primary)'}">${a.title}</div>
                            <div class="notif-item__text">${a.text}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // 패널 토글
    togglePanel() {
        const overlay = document.getElementById('notifOverlay');
        if (!overlay) return;
        const isActive = overlay.classList.contains('active');
        if (isActive) {
            this.closePanel();
        } else {
            this.renderPanel();
            overlay.classList.add('active');
        }
    },

    closePanel() {
        const overlay = document.getElementById('notifOverlay');
        if (overlay) overlay.classList.remove('active');
    },

    // 시작 시 긴급 알림 토스트 표시
    showStartupAlerts() {
        const alerts = this.checkAll();
        const urgent = alerts.filter(a => a.priority >= 2);
        if (urgent.length > 0) {
            setTimeout(() => {
                UI.showToast(`🔔 ${urgent.length}건의 긴급 알림이 있습니다!`, 'error');
            }, 1500);
        }
    }
};
