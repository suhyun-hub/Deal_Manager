// Card Swipe Actions for mobile
const Swipe = {
    threshold: 80,

    init() {
        // Only init on touch devices
        if (!('ontouchstart' in window)) return;
        document.addEventListener('touchstart', this._onTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this._onTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this._onTouchEnd.bind(this));
    },

    _getCard(el) {
        return el.closest('.deal-card');
    },

    _onTouchStart(e) {
        const card = this._getCard(e.target);
        if (!card) return;

        this._card = card;
        this._startX = e.touches[0].clientX;
        this._startY = e.touches[0].clientY;
        this._deltaX = 0;
        this._swiping = false;
    },

    _onTouchMove(e) {
        if (!this._card) return;

        const dx = e.touches[0].clientX - this._startX;
        const dy = e.touches[0].clientY - this._startY;

        // If vertical scroll is dominant, cancel swipe
        if (!this._swiping && Math.abs(dy) > Math.abs(dx)) {
            this._card = null;
            return;
        }

        if (Math.abs(dx) > 10) {
            this._swiping = true;
            e.preventDefault();
        }

        if (!this._swiping) return;

        this._deltaX = dx;
        const clampedDx = Math.max(-150, Math.min(150, dx));
        this._card.style.transform = `translateX(${clampedDx}px)`;
        this._card.style.transition = 'none';

        // Show swipe background indicators
        const wrap = this._card.closest('.deal-card-swipe-wrap');
        if (wrap) {
            wrap.classList.add('swiping');
            const editBg = wrap.querySelector('.swipe-bg--edit');
            const deleteBg = wrap.querySelector('.swipe-bg--delete');
            if (editBg) editBg.style.opacity = dx > 30 ? Math.min(dx / this.threshold, 1) : 0;
            if (deleteBg) deleteBg.style.opacity = dx < -30 ? Math.min(-dx / this.threshold, 1) : 0;
        }
    },

    _onTouchEnd() {
        if (!this._card) return;

        const card = this._card;
        const dx = this._deltaX;
        const wrap = card.closest('.deal-card-swipe-wrap');

        // Reset styles
        card.style.transition = 'transform 0.3s ease';
        card.style.transform = '';

        if (wrap) {
            wrap.classList.remove('swiping');
            const editBg = wrap.querySelector('.swipe-bg--edit');
            const deleteBg = wrap.querySelector('.swipe-bg--delete');
            if (editBg) editBg.style.opacity = '';
            if (deleteBg) deleteBg.style.opacity = '';
        }

        // Trigger action if threshold reached
        if (dx > this.threshold) {
            // Swipe right → edit
            const dealId = card.dataset.dealId;
            if (dealId && typeof App !== 'undefined') {
                setTimeout(() => App.showEditForm(dealId), 200);
            }
        } else if (dx < -this.threshold) {
            // Swipe left → delete
            const dealId = card.dataset.dealId;
            if (dealId && typeof App !== 'undefined') {
                const companyName = card.querySelector('.deal-card__company')?.textContent || '이 딜';
                if (confirm(`${companyName}을(를) 삭제하시겠습니까?`)) {
                    App.deleteDeal(dealId);
                }
            }
        }

        this._card = null;
        this._swiping = false;
        this._deltaX = 0;
    }
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => Swipe.init());
