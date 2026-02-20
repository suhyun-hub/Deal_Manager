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
    'IT 소프트웨어',           // 1  it_software
    '교육서비스/학원',         // 2  education
    '도매업',                 // 3  wholesale
    '금융/보험/무역',         // 4  finance ⚠️
    '간호/의료/의약',         // 5  healthcare
    '외식/식품',              // 6  food_dining
    '제조업',                 // 7  manufacturing
    '소매업',                 // 8  retail
    '주택/부동산/임대',       // 9  real_estate ⚠️
    '물류/운송',              // 10 logistics
    '여행/숙박/레저',         // 11 travel_leisure
    '프랜차이즈',             // 12 franchise
    '인재파견/아웃소싱',       // 13 staffing
    '사무/문구/도서',         // 14 office_supplies
    '패션/의류',              // 15 fashion
    '무역/유통',              // 16 trade_distribution
    '농업/축산',              // 17 agriculture
    '인쇄/출판/광고',         // 18 media_publishing
    '가전/전자',              // 19 electronics
    '자동차/화물',            // 20 automotive
    '건설/설비/기계',         // 21 construction_machinery
    '건축/토목',              // 22 civil_engineering ⚠️
    '오락/스포츠',            // 23 entertainment
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

// 지역 분류 (9개 권역 — 광역시 포함)
const REGIONS = [
    { label: '서울', keywords: ['서울'] },
    { label: '인천', keywords: ['인천'] },
    { label: '경기', keywords: ['경기', '수원', '성남', '고양', '용인', '안양', '안산', '화성', '평택', '시흥', '파주', '김포', '광명', '군포', '의왕', '하남', '오산', '이천', '양주', '구리', '남양주', '의정부', '동두천', '과천', '포천', '여주', '연천', '양평', '광주시', '가평'] },
    { label: '부산', keywords: ['부산'] },
    { label: '강원', keywords: ['강원', '춘천', '원주', '강릉', '속초', '동해', '태백', '삼척'] },
    { label: '충청', keywords: ['충청', '충북', '충남', '대전', '세종', '청주', '천안', '아산', '공주', '논산', '서산', '당진', '보령', '제천', '충주', '음성', '진천', '옥천', '괴산', '단양'] },
    { label: '전라', keywords: ['전라', '전북', '전남', '광주광역', '광주시', '전주', '익산', '군산', '목포', '여수', '순천', '나주', '정읍', '남원', '김제', '완주', '무안', '해남', '광양'] },
    { label: '경상', keywords: ['경상', '경북', '경남', '대구', '울산', '포항', '경주', '구미', '김천', '안동', '영주', '상주', '문경', '영천', '칠곡', '창원', '김해', '양산', '진주', '거제', '통영', '사천', '밀양', '함안', '거창', '합천'] },
    { label: '제주', keywords: ['제주', '서귀포'] }
];

// 업종별 EV/EBITDA 멀티플 (간이 밸류에이션용)
// 출처: EV/EBITDA 업종별 멀티플 가이드 (23개 업종 분류체계, 검증일 2026-01-29)
// evEbitda = Avg(x) 기준, min/max는 참고용
const INDUSTRY_MULTIPLES = {
    'IT 소프트웨어': { evEbitda: 12.0, min: 7.0, max: 18.0, note: 'SaaS/플랫폼 vs SI/용역 구분 필요' },
    '교육서비스/학원': { evEbitda: 6.0, min: 4.0, max: 8.0 },
    '도매업': { evEbitda: 4.5, min: 3.0, max: 6.0 },
    '금융/보험/무역': { evEbitda: 8.0, min: 6.0, max: 11.0, note: '⚠️ EBITDA 부적합. P/B, P/E 사용 권장' },
    '간호/의료/의약': { evEbitda: 10.0, min: 7.0, max: 14.0, note: '바이오/신약개발은 EBITDA 부적합' },
    '외식/식품': { evEbitda: 6.5, min: 5.0, max: 9.0, note: '시장 평균 6~7x. 성장기업 한정 9x+' },
    '제조업': { evEbitda: 6.0, min: 4.0, max: 9.0, note: '글로벌 평균 10x+' },
    '소매업': { evEbitda: 5.0, min: 3.0, max: 7.0 },
    '주택/부동산/임대': { evEbitda: 9.0, min: 6.0, max: 13.0, note: '⚠️ Cap Rate, NAV 병행 필수' },
    '물류/운송': { evEbitda: 6.0, min: 4.0, max: 8.0 },
    '여행/숙박/레저': { evEbitda: 4.0, min: 2.0, max: 6.0, note: '계절성/경기민감도 높음' },
    '프랜차이즈': { evEbitda: 7.0, min: 5.0, max: 10.0, note: '시장 평균 6~7x' },
    '인재파견/아웃소싱': { evEbitda: 5.0, min: 3.0, max: 7.0 },
    '사무/문구/도서': { evEbitda: 4.5, min: 3.0, max: 6.0 },
    '패션/의류': { evEbitda: 6.0, min: 4.0, max: 10.0, note: '순수 의류 5~8x, 화장품 포함 시 10x+' },
    '무역/유통': { evEbitda: 5.0, min: 3.0, max: 7.0 },
    '농업/축산': { evEbitda: 5.0, min: 3.0, max: 7.0 },
    '인쇄/출판/광고': { evEbitda: 5.0, min: 3.0, max: 8.0 },
    '가전/전자': { evEbitda: 5.0, min: 3.0, max: 8.0, note: '반도체는 별도 평가' },
    '자동차/화물': { evEbitda: 5.0, min: 3.0, max: 7.0 },
    '건설/설비/기계': { evEbitda: 5.0, min: 3.0, max: 7.0 },
    '건축/토목': { evEbitda: 4.0, min: 2.0, max: 6.0, note: '⚠️ 미청구공사, 우발부채 DD 필수' },
    '오락/스포츠': { evEbitda: 6.0, min: 3.0, max: 12.0, note: 'IP/콘텐츠 보유 시 상단, 일반 시설 4~6x' },
    '기타': { evEbitda: 5.0, min: 3.0, max: 7.0 }
};

// 업종별 벤치마크 (상대평가 기준)
const INDUSTRY_BENCHMARKS = {
    'IT 소프트웨어': { avgRevenue: 80, avgOpm: 12, avgDebtRatio: 35, avgRevGrowth: 20 },
    '교육서비스/학원': { avgRevenue: 60, avgOpm: 12, avgDebtRatio: 35, avgRevGrowth: 10 },
    '도매업': { avgRevenue: 300, avgOpm: 4, avgDebtRatio: 55, avgRevGrowth: 5 },
    '금융/보험/무역': { avgRevenue: 200, avgOpm: 15, avgDebtRatio: 80, avgRevGrowth: 6 },
    '간호/의료/의약': { avgRevenue: 50, avgOpm: -5, avgDebtRatio: 30, avgRevGrowth: 25 },
    '외식/식품': { avgRevenue: 150, avgOpm: 8, avgDebtRatio: 45, avgRevGrowth: 8 },
    '제조업': { avgRevenue: 200, avgOpm: 7, avgDebtRatio: 50, avgRevGrowth: 5 },
    '소매업': { avgRevenue: 180, avgOpm: 5, avgDebtRatio: 50, avgRevGrowth: 6 },
    '주택/부동산/임대': { avgRevenue: 150, avgOpm: 10, avgDebtRatio: 65, avgRevGrowth: 5 },
    '물류/운송': { avgRevenue: 250, avgOpm: 5, avgDebtRatio: 55, avgRevGrowth: 7 },
    '여행/숙박/레저': { avgRevenue: 80, avgOpm: 6, avgDebtRatio: 50, avgRevGrowth: 10 },
    '프랜차이즈': { avgRevenue: 120, avgOpm: 10, avgDebtRatio: 40, avgRevGrowth: 12 },
    '인재파견/아웃소싱': { avgRevenue: 100, avgOpm: 8, avgDebtRatio: 40, avgRevGrowth: 8 },
    '사무/문구/도서': { avgRevenue: 80, avgOpm: 5, avgDebtRatio: 45, avgRevGrowth: 3 },
    '패션/의류': { avgRevenue: 100, avgOpm: 8, avgDebtRatio: 45, avgRevGrowth: 8 },
    '무역/유통': { avgRevenue: 200, avgOpm: 4, avgDebtRatio: 55, avgRevGrowth: 6 },
    '농업/축산': { avgRevenue: 120, avgOpm: 6, avgDebtRatio: 50, avgRevGrowth: 4 },
    '인쇄/출판/광고': { avgRevenue: 70, avgOpm: 8, avgDebtRatio: 40, avgRevGrowth: 5 },
    '가전/전자': { avgRevenue: 250, avgOpm: 7, avgDebtRatio: 45, avgRevGrowth: 8 },
    '자동차/화물': { avgRevenue: 300, avgOpm: 5, avgDebtRatio: 55, avgRevGrowth: 4 },
    '건설/설비/기계': { avgRevenue: 250, avgOpm: 6, avgDebtRatio: 60, avgRevGrowth: 4 },
    '건축/토목': { avgRevenue: 300, avgOpm: 5, avgDebtRatio: 70, avgRevGrowth: 3 },
    '오락/스포츠': { avgRevenue: 70, avgOpm: 10, avgDebtRatio: 40, avgRevGrowth: 12 },
    '기타': { avgRevenue: 100, avgOpm: 8, avgDebtRatio: 50, avgRevGrowth: 7 }
};

// 스코어링 가중치 기본값 (사용자 커스터마이징 가능, 합계 100)
const SCORE_WEIGHTS_DEFAULT = {
    revenue: 25,       // 매출 규모
    profitability: 25, // 수익성
    stability: 25,     // 재무 안정성
    priceGap: 25       // 가격 적정성
};

// localStorage에서 사용자 가중치 로드 / 저장
function getScoreWeights() {
    try {
        const saved = localStorage.getItem('deal_score_weights');
        if (saved) {
            const parsed = JSON.parse(saved);
            const sum = Object.values(parsed).reduce((a, b) => a + b, 0);
            if (sum === 100) return parsed;
        }
    } catch (e) { }
    return { ...SCORE_WEIGHTS_DEFAULT };
}

function saveScoreWeights(weights) {
    localStorage.setItem('deal_score_weights', JSON.stringify(weights));
}

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

    // 2. 순자산가치 (간이)
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
        industry: 'IT 소프트웨어',
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
        industry: '외식/식품',
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
        industry: '간호/의료/의약',
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
        industry: '물류/운송',
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

// ============================================================
// 딜 스코어링 (업종별 상대평가 + 커스텀 가중치)
// ============================================================
function calcDealScore(deal) {
    const weights = getScoreWeights();
    const bench = INDUSTRY_BENCHMARKS[deal.industry] || INDUSTRY_BENCHMARKS['기타'];
    const details = [];

    const rev = Number(deal.revenue) || 0;
    const op = Number(deal.operatingProfit) || 0;
    const ni = Number(deal.netIncome) || 0;
    const debt = Number(deal.debtRatio) || 0;
    const ask = Number(deal.askingPrice) || 0;
    const opm = rev > 0 ? (op / rev * 100) : 0;

    // ── 상대평가 점수 산출 함수 (0~100 정규화 후 가중치 적용) ──
    function relScore(actual, benchmark, higherIsBetter) {
        if (benchmark === 0) return 50;
        const ratio = actual / benchmark;
        let raw;
        if (higherIsBetter) {
            // 벤치마크 대비 비율 → 0.5배=30, 1.0배=60, 1.5배=80, 2.0배+=95
            if (ratio <= 0) raw = 5;
            else if (ratio < 0.3) raw = 15;
            else if (ratio < 0.5) raw = 30;
            else if (ratio < 0.8) raw = 45;
            else if (ratio < 1.0) raw = 60;
            else if (ratio < 1.3) raw = 75;
            else if (ratio < 1.5) raw = 85;
            else raw = 95;
        } else {
            // 부채비율 등 낮을수록 좋은 항목 (역수)
            if (ratio <= 0.3) raw = 95;
            else if (ratio < 0.5) raw = 85;
            else if (ratio < 0.8) raw = 70;
            else if (ratio < 1.0) raw = 60;
            else if (ratio < 1.3) raw = 45;
            else if (ratio < 1.5) raw = 30;
            else raw = 15;
        }
        return raw;
    }

    // 1. 매출 규모 (업종 평균 대비)
    let revRaw = rev > 0 ? relScore(rev, bench.avgRevenue, true) : 0;
    let revScore = Math.round(revRaw * weights.revenue / 100);
    const revVsBench = bench.avgRevenue > 0 ? ((rev / bench.avgRevenue - 1) * 100).toFixed(0) : '-';
    details.push({
        name: '매출 규모',
        score: revScore,
        max: weights.revenue,
        note: rev > 0 ? `${rev}억 (업종평균 ${bench.avgRevenue}억 대비 ${revVsBench > 0 ? '+' : ''}${revVsBench}%)` : '데이터 없음',
        raw: revRaw
    });

    // 2. 수익성 (업종 평균 영업이익률 대비)
    let profitRaw;
    let profitNote;
    if (rev > 0 && op !== 0) {
        if (bench.avgOpm < 0) {
            // 바이오 등 업종 평균이 적자인 경우
            if (opm > 0) { profitRaw = 90; profitNote = `영업이익률 ${opm.toFixed(1)}% (업종평균 적자 대비 흑자)`; }
            else if (opm > bench.avgOpm) { profitRaw = 60; profitNote = `영업이익률 ${opm.toFixed(1)}% (업종평균 ${bench.avgOpm}% 대비 양호)`; }
            else { profitRaw = 30; profitNote = `영업이익률 ${opm.toFixed(1)}% (업종평균 ${bench.avgOpm}% 이하)`; }
        } else {
            profitRaw = relScore(opm, bench.avgOpm, true);
            const opmVsBench = ((opm / bench.avgOpm - 1) * 100).toFixed(0);
            profitNote = `영업이익률 ${opm.toFixed(1)}% (업종평균 ${bench.avgOpm}% 대비 ${opmVsBench > 0 ? '+' : ''}${opmVsBench}%)`;
        }
    } else if (op < 0) {
        profitRaw = bench.avgOpm < 0 ? 40 : 5;
        profitNote = `영업적자 ${op}억 ${bench.avgOpm < 0 ? '(업종 특성상 일반적)' : ''}`;
    } else {
        profitRaw = 0;
        profitNote = '데이터 없음';
    }
    let profitScore = Math.round(profitRaw * weights.profitability / 100);
    details.push({ name: '수익성', score: profitScore, max: weights.profitability, note: profitNote, raw: profitRaw });

    // 3. 재무 안정성 (업종 평균 부채비율 대비)
    let debtRaw, debtNote;
    if (debt > 0) {
        debtRaw = relScore(debt, bench.avgDebtRatio, false);
        const debtVsBench = ((debt / bench.avgDebtRatio - 1) * 100).toFixed(0);
        debtNote = `부채비율 ${debt.toFixed(1)}% (업종평균 ${bench.avgDebtRatio}% 대비 ${debtVsBench > 0 ? '+' : ''}${debtVsBench}%)`;
    } else {
        debtRaw = 50; // 데이터 없으면 중립
        debtNote = '데이터 없음';
    }
    let debtScore = Math.round(debtRaw * weights.stability / 100);
    details.push({ name: '재무 안정성', score: debtScore, max: weights.stability, note: debtNote, raw: debtRaw });

    // 4. 가격 적정성 (간이밸류 대비 희망가)
    let priceRaw, priceNote;
    const val = calcSimpleValuation(deal);
    if (val.avgValue && ask > 0) {
        const gap = (ask - val.avgValue) / val.avgValue * 100;
        // 저평가일수록 높은 점수
        if (gap <= -20) { priceRaw = 95; }
        else if (gap <= -10) { priceRaw = 85; }
        else if (gap <= 0) { priceRaw = 75; }
        else if (gap <= 10) { priceRaw = 65; }
        else if (gap <= 20) { priceRaw = 50; }
        else if (gap <= 35) { priceRaw = 35; }
        else if (gap <= 50) { priceRaw = 20; }
        else { priceRaw = 10; }
        priceNote = `희망가 vs 추정가 ${gap > 0 ? '+' : ''}${gap.toFixed(1)}%`;
    } else {
        priceRaw = 50;
        priceNote = '데이터 부족';
    }
    let priceScore = Math.round(priceRaw * weights.priceGap / 100);
    details.push({ name: '가격 적정성', score: priceScore, max: weights.priceGap, note: priceNote, raw: priceRaw });

    // 총점 및 등급
    const total = details.reduce((a, d) => a + d.score, 0);
    let grade, gradeColor, gradeLabel;
    if (total >= 80) { grade = 'A'; gradeColor = '#10b981'; gradeLabel = '매력적'; }
    else if (total >= 65) { grade = 'B'; gradeColor = '#0ea5e9'; gradeLabel = '양호'; }
    else if (total >= 50) { grade = 'C'; gradeColor = '#f59e0b'; gradeLabel = '보통'; }
    else { grade = 'D'; gradeColor = '#ef4444'; gradeLabel = '주의'; }

    return { total, grade, gradeColor, gradeLabel, details, weights, benchmark: bench };
}

// ============================================================
// 리스크 플래그 (자동 위험 감지)
// ============================================================
function calcRiskFlags(deal) {
    const flags = [];
    const rev = Number(deal.revenue) || 0;
    const op = Number(deal.operatingProfit) || 0;
    const ni = Number(deal.netIncome) || 0;
    const debt = Number(deal.debtRatio) || 0;
    const ask = Number(deal.askingPrice) || 0;

    // 1. 영업적자
    if (op < 0) {
        flags.push({ level: 'high', icon: '🔴', label: '영업적자', detail: `영업이익 ${op}억 — 수익모델 검증 필요` });
    }

    // 2. 순손실 (영업이익은 흑자인데 순이익 적자)
    if (ni < 0 && op >= 0) {
        flags.push({ level: 'mid', icon: '🟡', label: '순손실', detail: `영업흑자이나 순이익 ${ni}억 — 영업외비용/이자비용 확인` });
    }

    // 3. 높은 부채비율
    if (debt > 100) {
        flags.push({ level: 'high', icon: '🔴', label: '과다 부채', detail: `부채비율 ${debt.toFixed(1)}% — 재무구조 개선 필요` });
    } else if (debt > 70) {
        flags.push({ level: 'mid', icon: '🟡', label: '부채비율 주의', detail: `부채비율 ${debt.toFixed(1)}% — 업종 평균 대비 확인 필요` });
    }

    // 4. 고평가 위험 (희망가 vs 추정가 30% 초과)
    const val = calcSimpleValuation(deal);
    if (val.avgValue && ask > 0) {
        const gap = (ask - val.avgValue) / val.avgValue * 100;
        if (gap > 50) {
            flags.push({ level: 'high', icon: '🔴', label: '고평가 위험', detail: `희망가격이 추정가치 대비 +${gap.toFixed(0)}% — 가격 협상 필수` });
        } else if (gap > 30) {
            flags.push({ level: 'mid', icon: '🟡', label: '가격 괴리', detail: `희망가격이 추정가치 대비 +${gap.toFixed(0)}% — 근거 확인 필요` });
        }
    }

    // 5. 낮은 영업이익률
    if (rev > 0 && op > 0) {
        const opm = op / rev * 100;
        if (opm < 3) {
            flags.push({ level: 'mid', icon: '🟡', label: '저수익', detail: `영업이익률 ${opm.toFixed(1)}% — 원가구조 점검 필요` });
        }
    }

    // 6. 마감일 임박
    const dday = calcDday(deal.deadline);
    if (dday !== null && dday >= 0 && dday <= 3) {
        flags.push({ level: 'high', icon: '🔴', label: '마감 임박', detail: `D-${dday} — 즉시 의사결정 필요` });
    } else if (dday !== null && dday < 0) {
        flags.push({ level: 'mid', icon: '🟡', label: '마감 초과', detail: `D+${Math.abs(dday)} — 딜 유효성 확인 필요` });
    }

    // 7. 데이터 부족
    const missing = [];
    if (!rev) missing.push('매출액');
    if (op === 0 && !deal.operatingProfit && deal.operatingProfit !== 0) missing.push('영업이익');
    if (!deal.totalAssets) missing.push('총자산');
    if (!deal.debtRatio && deal.debtRatio !== 0) missing.push('부채비율');
    if (missing.length >= 2) {
        flags.push({ level: 'low', icon: '⚪', label: '데이터 부족', detail: `미입력 항목: ${missing.join(', ')}` });
    }

    return flags;
}
