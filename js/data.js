// ============================================================
// data.js — M&A 딜 데이터 모델, 상수, 샘플 데이터
// ============================================================

const DEAL_STATUS = {
    NEW: '신규',
    REVIEWING: '검토중',
    INTERESTED: '관심',
    MEETING: '미팅진행',
    COMPLETED: '완료',
    ON_HOLD: '보류'
};

const DEAL_STATUS_COLORS = {
    '신규': '#6c5ce7',
    '검토중': '#fdcb6e',
    '관심': '#00b894',
    '미팅진행': '#0984e3',
    '완료': '#00cec9',
    '보류': '#636e72'
};

const INDUSTRIES = [
    'IT/소프트웨어',
    '제조업',
    '유통/물류',
    '바이오/헬스케어',
    '식품/외식',
    '건설/부동산',
    '금융/보험',
    '에너지/환경',
    '서비스업',
    '교육',
    '미디어/엔터',
    '기타'
];

const DEAL_STRUCTURES = [
    '주식양수도',
    '영업양수도',
    '합병',
    '자산양수도',
    '경영권 인수',
    '지분 투자',
    '기타'
];

const REVENUE_RANGES = [
    { label: '전체', min: 0, max: Infinity },
    { label: '10억 미만', min: 0, max: 10 },
    { label: '10억~50억', min: 10, max: 50 },
    { label: '50억~100억', min: 50, max: 100 },
    { label: '100억~500억', min: 100, max: 500 },
    { label: '500억 이상', min: 500, max: Infinity }
];

// 업종별 EV/EBITDA 멀티플 (간이 밸류에이션용)
const INDUSTRY_MULTIPLES = {
    'IT/소프트웨어': { evEbitda: 15, psr: 3.5 },
    '제조업': { evEbitda: 7, psr: 0.8 },
    '유통/물류': { evEbitda: 8, psr: 0.6 },
    '바이오/헬스케어': { evEbitda: 20, psr: 5.0 },
    '식품/외식': { evEbitda: 10, psr: 1.2 },
    '건설/부동산': { evEbitda: 6, psr: 0.5 },
    '금융/보험': { evEbitda: 8, psr: 1.5 },
    '에너지/환경': { evEbitda: 9, psr: 1.0 },
    '서비스업': { evEbitda: 10, psr: 1.5 },
    '교육': { evEbitda: 12, psr: 2.0 },
    '미디어/엔터': { evEbitda: 12, psr: 2.5 },
    '기타': { evEbitda: 8, psr: 1.0 }
};

// 태그 프리셋 색상
const TAG_PRESETS = [
    { name: '고수익', color: '#10b981' },
    { name: '리스크높음', color: '#ef4444' },
    { name: '긴급검토', color: '#f59e0b' },
    { name: '우량기업', color: '#6366f1' },
    { name: '성장세', color: '#06b6d4' },
    { name: '매력적', color: '#ec4899' },
    { name: '2차미팅필요', color: '#8b5cf6' },
    { name: '실사진행중', color: '#14b8a6' },
    { name: '가격협상중', color: '#f97316' },
    { name: '보류대기', color: '#64748b' }
];

// 딜 데이터 모델 (새 딜 생성 시 기본값)
function createDeal(overrides = {}) {
    return {
        id: overrides.id || generateId(),
        // 기본 정보
        companyName: '',
        industry: '',
        location: '',
        foundedYear: '',
        employeeCount: '',
        // 재무 정보 (단위: 억원)
        revenue: '',
        operatingProfit: '',
        netIncome: '',
        totalAssets: '',
        debtRatio: '',
        // 딜 정보
        saleReason: '',
        askingPrice: '',
        sharePercentage: '',
        dealStructure: '',
        // 기타
        coreCompetency: '',
        memo: '',
        status: DEAL_STATUS.NEW,
        isFavorite: false,
        deadline: '',
        tags: [],          // [{ name: '고수익', color: '#10b981' }, ...]
        attachments: [],   // [{ name: 'IM자료.pdf', url: '', note: '', addedAt: '' }, ...]
        // 메모/타임라인
        timeline: [],
        // 메타
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides
    };
}

function generateId() {
    return 'deal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 금액 포맷 (억원)
function formatCurrency(value) {
    if (value === '' || value === null || value === undefined) return '-';
    const num = Number(value);
    if (isNaN(num)) return '-';
    return num.toLocaleString('ko-KR') + '억';
}

// 퍼센트 포맷
function formatPercent(value) {
    if (value === '' || value === null || value === undefined) return '-';
    const num = Number(value);
    if (isNaN(num)) return '-';
    return num.toFixed(1) + '%';
}

// 날짜 포맷
function formatDate(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
}

function formatDateTime(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return `${formatDate(isoString)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// D-Day 계산
function calcDday(deadlineStr) {
    if (!deadlineStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(deadlineStr);
    dl.setHours(0, 0, 0, 0);
    const diff = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
    return diff;
}

function formatDday(deadlineStr) {
    const d = calcDday(deadlineStr);
    if (d === null) return '';
    if (d === 0) return 'D-Day';
    if (d > 0) return `D-${d}`;
    return `D+${Math.abs(d)}`;
}

function getDdayClass(deadlineStr) {
    const d = calcDday(deadlineStr);
    if (d === null) return '';
    if (d < 0) return 'dday--overdue';
    if (d <= 3) return 'dday--urgent';
    if (d <= 7) return 'dday--soon';
    return 'dday--normal';
}

// 간이 밸류에이션 계산
function calcSimpleValuation(deal) {
    const result = { methods: [], avgValue: null };
    const mult = INDUSTRY_MULTIPLES[deal.industry] || INDUSTRY_MULTIPLES['기타'];
    const ebitda = Number(deal.operatingProfit);
    const revenue = Number(deal.revenue);
    const totalAssets = Number(deal.totalAssets);
    const debtRatio = Number(deal.debtRatio);

    // 1. EV/EBITDA
    if (!isNaN(ebitda) && ebitda > 0) {
        const ev = ebitda * mult.evEbitda;
        result.methods.push({
            name: 'EV/EBITDA',
            value: Math.round(ev * 10) / 10,
            detail: `영업이익 ${ebitda}억 × ${mult.evEbitda}배`,
            multiple: mult.evEbitda
        });
    }

    // 2. PSR (매출 기반)
    if (!isNaN(revenue) && revenue > 0) {
        const psrVal = revenue * mult.psr;
        result.methods.push({
            name: 'PSR (매출배수)',
            value: Math.round(psrVal * 10) / 10,
            detail: `매출 ${revenue}억 × ${mult.psr}배`,
            multiple: mult.psr
        });
    }

    // 3. 순자산가치 (간이)
    if (!isNaN(totalAssets) && totalAssets > 0 && !isNaN(debtRatio)) {
        const netAsset = totalAssets * (1 - debtRatio / 100);
        if (netAsset > 0) {
            result.methods.push({
                name: '순자산가치',
                value: Math.round(netAsset * 10) / 10,
                detail: `총자산 ${totalAssets}억 × (1 - 부채비율 ${debtRatio}%)`,
                multiple: null
            });
        }
    }

    // 평균
    if (result.methods.length > 0) {
        const sum = result.methods.reduce((s, m) => s + m.value, 0);
        result.avgValue = Math.round((sum / result.methods.length) * 10) / 10;
    }

    return result;
}

// ============================================================
// 샘플 데이터 5건
// ============================================================
const SAMPLE_DEALS = [
    createDeal({
        id: 'sample_001',
        companyName: '(주)테크솔루션',
        industry: 'IT/소프트웨어',
        location: '서울 강남구',
        foundedYear: '2015',
        employeeCount: '45',
        revenue: 82,
        operatingProfit: 12,
        netIncome: 9.5,
        totalAssets: 55,
        debtRatio: 38.2,
        saleReason: '대표이사 개인 사유 (해외 이민)',
        askingPrice: 120,
        sharePercentage: 100,
        dealStructure: '주식양수도',
        coreCompetency: 'AI 기반 자연어처리 핵심 기술 보유, 공공기관 납품 실적 다수',
        memo: '기술력 우수, 매출 성장세. 핵심 인력 이탈 리스크 확인 필요.',
        status: DEAL_STATUS.INTERESTED,
        isFavorite: true,
        deadline: '2026-02-20',
        tags: [{ name: '고수익', color: '#10b981' }, { name: '우량기업', color: '#6366f1' }],
        attachments: [
            { name: 'IM 자료', url: '', note: 'AI 기술 분석 포함', addedAt: '2026-01-20T14:30:00' },
            { name: '재무제표', url: '', note: '2025년 결산', addedAt: '2026-01-22T10:00:00' }
        ],
        timeline: [
            { date: '2026-01-15T10:00:00', content: '메가인포에서 딜 소개 수령' },
            { date: '2026-01-20T14:30:00', content: 'IM 자료 검토 완료 — 기술력 우수 판단' },
            { date: '2026-02-01T09:00:00', content: '관심 딜로 상향, 추가 자료 요청' }
        ],
        createdAt: '2026-01-15T10:00:00'
    }),
    createDeal({
        id: 'sample_002',
        companyName: '그린푸드 주식회사',
        industry: '식품/외식',
        location: '경기 성남시',
        foundedYear: '2010',
        employeeCount: '120',
        revenue: 350,
        operatingProfit: 28,
        netIncome: 20,
        totalAssets: 180,
        debtRatio: 52.1,
        saleReason: '사업 구조조정 (비핵심 사업부 매각)',
        askingPrice: 250,
        sharePercentage: 70,
        dealStructure: '영업양수도',
        coreCompetency: '건강식품 브랜드 인지도 높음, 온라인 D2C 채널 확보',
        memo: '브랜드 가치 있으나 부채비율 다소 높음.',
        status: DEAL_STATUS.MEETING,
        isFavorite: true,
        deadline: '2026-02-28',
        tags: [{ name: '성장세', color: '#06b6d4' }, { name: '리스크높음', color: '#ef4444' }],
        attachments: [
            { name: 'NDA 계약서', url: '', note: '양자간 체결 완료', addedAt: '2026-01-15T09:00:00' }
        ],
        timeline: [
            { date: '2026-01-10T09:00:00', content: '딜 소개 수령' },
            { date: '2026-01-18T11:00:00', content: '1차 미팅 실시 — 매각 조건 협의' },
            { date: '2026-02-05T15:00:00', content: '재무 실사 자료 수령' }
        ],
        createdAt: '2026-01-10T09:00:00'
    }),
    createDeal({
        id: 'sample_003',
        companyName: '메디컬이노베이션(주)',
        industry: '바이오/헬스케어',
        location: '대전 유성구',
        foundedYear: '2018',
        employeeCount: '22',
        revenue: 15,
        operatingProfit: -3,
        netIncome: -5,
        totalAssets: 40,
        debtRatio: 25.0,
        saleReason: '추가 자금 조달 필요 (시리즈B 실패)',
        askingPrice: 80,
        sharePercentage: 60,
        dealStructure: '지분 투자',
        coreCompetency: '신약 후보물질 2건 (임상 2상), 특허 5건 보유',
        memo: '고위험 고수익. 임상 결과에 따라 가치 급변 가능.',
        status: DEAL_STATUS.REVIEWING,
        timeline: [
            { date: '2026-02-01T10:00:00', content: '딜 소개 수령' },
            { date: '2026-02-08T14:00:00', content: 'IM 자료 검토 중' }
        ],
        createdAt: '2026-02-01T10:00:00'
    }),
    createDeal({
        id: 'sample_004',
        companyName: '대한정밀 주식회사',
        industry: '제조업',
        location: '인천 남동구',
        foundedYear: '2003',
        employeeCount: '85',
        revenue: 210,
        operatingProfit: 18,
        netIncome: 13,
        totalAssets: 150,
        debtRatio: 45.3,
        saleReason: '대표이사 은퇴 (후계자 부재)',
        askingPrice: 180,
        sharePercentage: 100,
        dealStructure: '경영권 인수',
        coreCompetency: '자동차 부품 정밀가공 전문, 현대/기아 1차 벤더',
        memo: '안정적 매출, 우량 거래처. 공장 부지 가치 포함 검토.',
        status: DEAL_STATUS.NEW,
        deadline: '2026-02-15',
        timeline: [
            { date: '2026-02-10T09:00:00', content: '딜 소개 수령' }
        ],
        createdAt: '2026-02-10T09:00:00'
    }),
    createDeal({
        id: 'sample_005',
        companyName: '에코로지스틱스(주)',
        industry: '유통/물류',
        location: '부산 해운대구',
        foundedYear: '2012',
        employeeCount: '65',
        revenue: 180,
        operatingProfit: 15,
        netIncome: 11,
        totalAssets: 95,
        debtRatio: 40.8,
        saleReason: '전략적 제휴 파트너 모색',
        askingPrice: 150,
        sharePercentage: 51,
        dealStructure: '주식양수도',
        coreCompetency: '친환경 물류 시스템, 부산항 인접 물류센터 3개 보유',
        memo: '물류 인프라 우수. ESG 관점 매력적.',
        status: DEAL_STATUS.ON_HOLD,
        timeline: [
            { date: '2026-01-05T09:00:00', content: '딜 소개 수령' },
            { date: '2026-01-12T16:00:00', content: '검토 결과 보류 판정 — 매각 조건 불일치' }
        ],
        createdAt: '2026-01-05T09:00:00'
    })
];
