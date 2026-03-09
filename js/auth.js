// ============================================================
// auth.js — 비밀번호 기반 접근 제어
// ============================================================

const Auth = {
    // SHA-256 해시 생성 (Web Crypto API)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    // Firestore에서 저장된 비밀번호 해시 가져오기
    async getStoredHash() {
        try {
            const doc = await db.collection('config').doc('auth').get();
            if (doc.exists && doc.data().passwordHash) {
                return doc.data().passwordHash;
            }
        } catch (e) {
            console.error('Auth config read error:', e);
        }
        return null;
    },

    // 비밀번호 설정 (최초 1회)
    async setPassword(password) {
        const hash = await this.hashPassword(password);
        await db.collection('config').doc('auth').set({ passwordHash: hash });
        sessionStorage.setItem('deal_manager_auth', 'true');
    },

    // 비밀번호 검증
    async verifyPassword(password) {
        const inputHash = await this.hashPassword(password);
        const storedHash = await this.getStoredHash();
        if (inputHash === storedHash) {
            sessionStorage.setItem('deal_manager_auth', 'true');
            return true;
        }
        return false;
    },

    // 로그아웃
    logout() {
        sessionStorage.removeItem('deal_manager_auth');
        this.showLoginScreen();
    },

    // UI 전환
    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appMain').style.display = 'none';
    },

    showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appMain').style.display = '';
    },

    // 최초 비밀번호 설정 모드
    showSetupMode() {
        document.getElementById('loginSetupMsg').style.display = 'block';
        document.getElementById('loginConfirmWrap').style.display = 'block';
        document.getElementById('loginBtn').textContent = '비밀번호 설정';
        document.getElementById('loginSubtitle').textContent = '최초 접속입니다. 팀 공용 비밀번호를 설정해주세요.';
    },

    // 로그인 모드
    showLoginMode() {
        document.getElementById('loginSetupMsg').style.display = 'none';
        document.getElementById('loginConfirmWrap').style.display = 'none';
        document.getElementById('loginBtn').textContent = '로그인';
        document.getElementById('loginSubtitle').textContent = '접속 비밀번호를 입력하세요';
    },

    // 에러 메시지 표시
    showError(msg) {
        const el = document.getElementById('loginError');
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 3000);
    },

    // 로그인/설정 처리
    async handleSubmit() {
        const password = document.getElementById('loginPassword').value;
        const confirmEl = document.getElementById('loginPasswordConfirm');
        const isSetup = document.getElementById('loginConfirmWrap').style.display !== 'none';

        if (!password || password.length < 4) {
            this.showError('비밀번호를 4자 이상 입력해주세요.');
            return;
        }

        const btn = document.getElementById('loginBtn');
        btn.disabled = true;
        btn.textContent = '확인 중...';

        try {
            if (isSetup) {
                // 비밀번호 설정 모드
                if (password !== confirmEl.value) {
                    this.showError('비밀번호가 일치하지 않습니다.');
                    btn.disabled = false;
                    btn.textContent = '비밀번호 설정';
                    return;
                }
                await this.setPassword(password);
                await this.startApp();
            } else {
                // 로그인 모드
                const ok = await this.verifyPassword(password);
                if (ok) {
                    await this.startApp();
                } else {
                    this.showError('비밀번호가 올바르지 않습니다.');
                    btn.disabled = false;
                    btn.textContent = '로그인';
                    document.getElementById('loginPassword').value = '';
                    document.getElementById('loginPassword').focus();
                }
            }
        } catch (e) {
            console.error('Auth error:', e);
            this.showError('인증 중 오류가 발생했습니다. 네트워크를 확인해주세요.');
            btn.disabled = false;
            btn.textContent = isSetup ? '비밀번호 설정' : '로그인';
        }
    },

    // 앱 시작 (인증 성공 후)
    async startApp() {
        this.showApp();
        await Storage.init();
        App.init();
    },

    // 초기화
    async init() {
        // 이미 인증된 세션인지 확인
        if (sessionStorage.getItem('deal_manager_auth') === 'true') {
            await this.startApp();
            return;
        }

        // 비밀번호 설정 여부 확인
        const storedHash = await this.getStoredHash();
        if (!storedHash) {
            this.showSetupMode();
        } else {
            this.showLoginMode();
        }
        this.showLoginScreen();

        // 폼 이벤트 바인딩
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Enter 키
        document.getElementById('loginPassword').focus();
    }
};
