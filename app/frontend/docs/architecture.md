# Architecture

> Lighthouse FE 프로젝트의 전체 구조와 설계 원칙을 정리한 문서

## 1. 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| UI 프레임워크 | React 19 | Vite 기반 |
| 컴포넌트 라이브러리 | MUI v7 | @mui/material, @mui/x-data-grid |
| 서버 상태 | SWR 2.x | 폴링(60s), revalidation |
| HTTP 클라이언트 | Axios | 인터셉터로 401/네트워크 에러 처리 |
| 스키마 검증 | zod | API 응답 검증용 (도입 예정) |
| UI 상태 | React hooks (useState) | Zustand 도입 예정 |
| 차트 | ApexCharts | 모니터링 대시보드 전용 |
| 날짜 | dayjs | 타임존: Asia/Seoul |
| 인증 | JWT | localStorage 기반 |
| 코드 품질 | ESLint + Prettier | 커밋 전 필수 실행 |

## 2. 디렉토리 구조

```
src/
├── actions/          # SWR 데이터 페칭 훅 (API 호출은 여기서만)
├── auth/             # 인증 시스템 (JWT 프로바이더, 가드, 컨텍스트)
├── components/       # 공용 UI 컴포넌트 (Minimals 템플릿 기반)
├── context/          # React Context (ServerHealthProvider 등)
├── hooks/            # 커스텀 훅 (useMonitoringTokens 등)
├── layouts/          # 레이아웃 셸 (dashboard, auth, main)
├── lib/              # Axios 인스턴스 (인터셉터 설정)
├── pages/            # 페이지 래퍼 (sections/*/view/ 를 import만 함)
├── routes/           # 라우트 정의
│   ├── paths.js      #   경로 상수
│   └── sections/     #   라우트 설정 (lazy loading)
├── sections/         # 기능별 UI 컴포넌트 (아래 상세)
├── theme/            # MUI 테마 커스터마이징
├── utils/            # 유틸리티 (format-number, format-time 등)
├── _mock/            # 개발용 목 데이터
└── global-config.js  # 전역 설정 (인증 방식, 서버 URL 등)
```

## 3. Lighthouse 고유 코드 vs Minimals 템플릿

### Lighthouse 고유 기능

프로젝트의 핵심 모니터링 기능. 직접 개발/유지보수 대상.

| 디렉토리 | 설명 |
|-----------|------|
| `src/sections/overview-v2/` | **메인 대시보드 (v2)** - 현재 활성. 디자인 토큰 기반 |
| `src/sections/monitoring/` | 대시보드 v1 (v2로 대체됨, 참고용으로 유지) |
| `src/sections/server-instances/` | 서버 인스턴스 목록/상세 |
| `src/actions/monitoring.js` | 모니터링 API SWR 훅 전체 |
| `src/context/server-health-context.jsx` | 서버 헬스 체크 + 장애 시 폴백 화면 |
| `src/hooks/use-monitoring-tokens.js` | 다크/라이트 모드 디자인 토큰 훅 |
| `src/sections/overview-v2/v2-tokens.js` | 모니터링 전용 디자인 토큰 정의 |

### Minimals 템플릿 기능 (현재 프로젝트에 포함)

템플릿에서 가져온 기능들. 필요에 따라 커스터마이징하거나 제거 대상.

- Chat, Calendar, Kanban, Mail
- Blog/Post, Invoice, Order
- User, Product, Job, Tour
- 기타 데모 페이지 (about, contact, pricing, faqs 등)

> 새 기능을 추가할 때 템플릿 코드를 참고하되, Lighthouse 고유 패턴(v2 디자인 토큰, SWR 훅 구조)을 따른다.

## 4. 데이터 흐름

```
[백엔드 API]
     │
     ▼
[src/lib/axios.js]         ← Axios 인스턴스 (인터셉터)
     │                        - 401 → 로그인 리다이렉트
     │                        - 네트워크 에러 → SERVER_DOWN_EVENT
     ▼
[src/actions/monitoring.js] ← SWR 훅 (useSWR)
     │                        - 60초 폴링
     │                        - revalidateOnFocus: false
     │                        - loading / error / validating 상태 반환
     ▼
[src/sections/*/view/]      ← 페이지 뷰 컴포넌트
     │                        - 훅 호출 → 데이터 수신
     │                        - 로딩/에러/빈 상태 처리
     ▼
[위젯 컴포넌트]              ← 차트, 테이블 등 개별 위젯
                               - props로 데이터 수신
                               - 데이터 변환 → 차트 렌더링
```

## 5. 인증 흐름

```
1. 로그인 → POST /api/auth/sign-in → JWT 토큰 수신
2. localStorage에 jwt_access_token 저장
3. Axios Authorization 헤더에 Bearer 토큰 설정
4. AuthGuard가 모든 dashboard 라우트를 보호
5. 토큰 만료(401) → Axios 인터셉터가 감지
   → localStorage 토큰 삭제
   → sessionStorage에 SESSION_EXPIRED_KEY 저장
   → /login 리다이렉트
```

**설정 위치:** `src/global-config.js` → `auth.method: 'jwt'`

## 6. 에러 처리 계층

| 계층 | 처리 방식 | 위치 |
|------|-----------|------|
| 네트워크 장애 | SERVER_DOWN_EVENT → ServerHealthProvider → 유지보수 화면 표시 + /api/health 15초 폴링 | `src/lib/axios.js`, `src/context/server-health-context.jsx` |
| 인증 만료 (401) | 토큰 삭제 → 로그인 리다이렉트 | `src/lib/axios.js` |
| API 에러 (4xx/5xx) | SWR error 상태 → 컴포넌트에서 에러 메시지 표시 | 각 `src/sections/` 컴포넌트 |
| 런타임 에러 | ErrorBoundary → 폴백 UI | `src/routes/components/error-boundary.jsx` |

## 7. 라우팅 구조

**경로 상수:** `src/routes/paths.js`

```
/dashboard              → OverviewV2DashboardView (메인 대시보드)
/dashboard/logs         → 로그 목록
/dashboard/logs/:id     → 로그 상세
/dashboard/server-instances     → 서버 인스턴스 목록
/dashboard/server-instances/:id → 서버 인스턴스 상세
```

모든 dashboard 하위 라우트는 `DashboardLayout` + `AuthGuard`로 감싸져 있으며, `lazy()`로 코드 스플리팅 된다.

## 8. 테마 시스템

```
src/theme/
├── create-theme.js       # 테마 팩토리
├── theme-provider.jsx    # ThemeProvider 래퍼
├── core/
│   ├── palette.js        # 색상 정의
│   ├── typography.js     # 폰트 설정
│   ├── shadows.js        # 그림자
│   └── components/       # 44개 MUI 컴포넌트 오버라이드
└── with-settings/        # 런타임 설정 (다크/라이트, RTL 등)
```

**모니터링 전용 디자인 토큰:** `src/sections/overview-v2/v2-tokens.js`
- 다크/라이트 모드별 색상 세트 (bg, border, text, accent, status, chart)
- `useMonitoringTokens()` 훅으로 접근

## 9. 주요 의존성

```
프로덕션:
  @mui/material, @mui/x-data-grid  → UI
  swr                               → 서버 상태
  axios                             → HTTP
  apexcharts, react-apexcharts      → 차트
  dayjs                             → 날짜
  zod                               → 스키마 검증 (도입 예정)
  i18next                           → 다국어 (템플릿 기능)
  react-router-dom                  → 라우팅

개발:
  vite                              → 빌드
  eslint + prettier                 → 코드 품질
```
