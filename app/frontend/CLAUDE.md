# CLAUDE.md (Project Instructions)

## 0. Project Snapshot
- 제품/도메인: 애플리케이션명은 Lighthouse / 모니터링 시스템 도메인
- 목표: 애플리케이션 모니터링 화면 제공. 핵심은 사용자가 대시보드를 커스텀할 수 있도록 구축
- 주요 스택: JavaScript, React, MUI, Zustand, Axios, SWR, zod
- Claude의 주 업무: 신규 화면 개발 및 수정, 버그 수정, 리팩토링, 테스트 추가, 문서화

## 1. Repository Map
- src/sections/ — 기능별 UI 컴포넌트 (각 기능의 view/ 하위 폴더에 메인 페이지 뷰 포함)
- src/pages/ — src/sections/*/view/ 를 import하는 얇은 페이지 래퍼
- src/routes/ — 라우트 정의 (paths.js에 경로 상수, sections/에 라우트 설정)
- src/actions/ — SWR 데이터 페칭 훅 (예: overview.js에 대시보드 데이터)
- src/schemas/ — zod 스키마(요청/응답), 파서/정규화 로직 (도메인별 파일 분리 권장)
- src/lib/axios.js — 인터셉터가 설정된 Axios 인스턴스 (401 리다이렉트, 서버 다운 감지)
- src/components/ — Minimals 템플릿의 재사용 가능한 UI 컴포넌트
- src/layouts/ — 레이아웃 셸 (dashboard, auth, main)
- src/auth/ — 다중 프로바이더 지원 인증 시스템 (JWT 활성, src/global-config.js에서 설정)
- src/_mock/ — 개발용 Mock/데모 데이터
- src/context/ — React Context (예: ServerHealthProvider 서버 헬스 모니터링)
- src/theme/ — MUI 테마 커스터마이징
- docs/ — 아키텍처/가이드

## 2. Non-Negotiables (절대 규칙)

### 2.1 코드 스타일/품질
- ESLint/Prettier 규칙을 항상 통과시킨다.
  - 작업 마무리 시 반드시 npm run lint 를 수행하여 오류/경고가 없음을 확인한다.
- 작업 마무리 시 반드시 npm run build 를 수행하여 빌드 성공을 확인한다.
  - lint는 정적 분석만 수행하므로 존재하지 않는 export, 모듈 resolve 실패 등 런타임 오류를 잡지 못한다.
  - 빌드 검증은 이러한 문제를 사전에 차단하는 필수 단계이다.
  - 특히 외부 패키지 추가/업데이트, import 경로 변경, 새 파일 생성 후에는 반드시 빌드를 확인한다.
- 기존 패턴/유틸 우선 재사용. 유사 기능 중복 구현 금지.
- 로직/상태가 복잡해질수록 작은 단위(훅/유틸)로 분리하고 책임을 명확히 한다.

### 2.2 사용자 노출 메시지는 한국어
- **모든** 사용자 대면 텍스트(유효성 검증 메시지, 에러 메시지, 버튼 레이블, 안내 문구 등)는 한국어로 작성한다.
- zod 스키마의 message, Alert/Toast 텍스트, placeholder, 빈 상태 안내 등 포함.
- console.log/error 등 개발자용 로그는 영어 허용.
- 기술 용어(API, Dashboard 등)는 원문 그대로 사용 가능하나, 문장은 한국어로 구성한다.

### 2.3 아이콘 사용 규칙
- 아이콘은 Iconify(`@iconify/react`)를 사용하며, `<Iconify icon="prefix:name" />` 형태로 사용한다.
- 외부 API 호출 없이 오프라인으로 렌더링하기 위해 `src/components/iconify/icon-sets.js`에 SVG body가 등록된 아이콘만 사용한다.
- 새 아이콘이 필요할 때: `icon-sets.js`에 이미 등록된 아이콘을 우선 사용하고, 없으면 Iconify API에서 SVG body를 가져와 `icon-sets.js`에 먼저 등록한 뒤 사용한다.
- 미등록 아이콘을 그대로 사용하면 온라인 로드로 인한 깜빡임(flickering)이 발생하므로 금지한다.

### 2.4 그리드/목록 UI 규칙
- 데이터 목록(테이블 형태)은 MUI `<DataGrid>` (`@mui/x-data-grid`)를 최우선으로 사용한다.
- 수동으로 `<Table>`, `<Box>` 반복을 이용한 테이블 구현을 금지한다.
- 컬럼에는 반드시 `width` 또는 `minWidth`를 지정하여 긴 값이 인접 컬럼에 영향을 주지 않도록 한다.
- 숫자/단위 값은 적절한 포맷터를 적용한다 (예: ms → `fDuration()` 으로 초/분 자동 변환).

### 2.5 UI / 디자인 시스템

- 디자인 토큰/기존 컴포넌트 우선 사용.
- 임의 색상/간격/그림자/애니메이션을 추가하지 않는다(요구가 있을 때만).
- 모니터링 시스템에 걸맞는 UX 중심 설계를 우선한다.
  - 불필요하게 튀거나 과한 디자인은 지양
  - 비주얼보다 가독성/정보 구조/조작 효율을 우선
  - 여러 지표를 한 화면에서 보기 때문에 정보 밀도 + 명확한 계층 + 빠른 스캔을 목표로 한다
- 접근성 기본 준수(semantic element, aria 최소 규칙, 키보드 포커스 흐름).

### 2.6 상태관리/데이터
- 서버 상태는 SWR(src/actions/)로만 관리한다.
  - 컴포넌트에서 axios 직접 호출 금지(예외 필요 시 근거를 주석/문서로 남긴다).
  - Zustand에 서버 데이터 저장 금지(캐시 중복/불일치 방지).
- Zustand는 UI 상태 중심(필터, 패널 열림, 대시보드 레이아웃/위젯 배치, 임시 선택 상태 등).
- API 요청/응답 스키마는 zod로 정의한다.
  - axios 응답은 src/actions/에서 zod safeParse로 검증/정규화 후 UI에 전달한다.
  - 스키마 검증 실패는 표준 에러 흐름으로 연결한다(아래 에러 처리 규칙).
- 로딩/에러/빈 상태를 반드시 구현한다.
  - 로딩: skeleton/spinner 등 명시적 표시
  - 빈 값: 데이터 없음 상태를 사용자가 이해할 수 있게 표시(가능하면 원인/조건 포함)
  - 에러: 재시도(가능한 경우)와 사용자 메시지 제공

### 2.7 에러 처리(전역 vs 화면)
- 401: axios 인터셉터에서 인증 리다이렉트(기존 동작 유지)
- 네트워크 다운/서버 장애: 전역 안내(토스트 또는 배너) + 필요 시 폴백 화면 제공
- 화면 단위 4xx/유효성 문제: 해당 화면에서 사용자 친화 메시지로 처리
- 예기치 못한 런타임 오류: ErrorBoundary로 폴백 UI 제공(가능하면 복구/재시도 경로 포함)

## 3. Local Commands
- npm install (설치)
- npm run dev (개발 서버 실행)
- npm run lint (필수 — 정적 분석)
- npm run build (필수 — 빌드 검증. 모듈 resolve, export 유효성 등 lint가 잡지 못하는 오류 검출)
- (존재한다면) npm run test 수행 권장

## 4. 커밋 컨벤션
- 아래 형식을 지킨다.
  <type>(<scope>): <subject>

  <body>

- type 목록
  - feat: 새로운 기능 추가
  - fix: 버그 수정
  - docs: 문서 수정
  - style: 코드 포맷팅 (코드 변경 없음)
  - refactor: 리팩토링
  - test: 테스트 코드 추가/수정
  - chore: 빌드 업무, 패키지 매니저 설정 등
- body: 상세 설명 (72자 이내 줄바꿈)
- **이 세션은 프론트엔드 전용이다.** 커밋 요청 시 `app/frontend/` 하위 변경사항만 작업 단위별로 커밋한다. 백엔드(`app/backend/`) 등 다른 하위 프로젝트의 변경사항은 포함하지 않는다.

## 5. Playbooks

### 5.1 버그 수정
1) 재현 단계/환경 정리
2) 원인 위치 특정(로그/스택/네트워크)
3) 최소 수정으로 해결
4) 테스트 추가/수정(가능하면 회귀 방지)
5) 관련 화면/흐름 회귀 확인 + lint 확인

### 5.2 UI 변경
- 디자인 시스템에서 기존 컴포넌트/토큰 확인 후 적용
- 반응형/접근성 체크 포함(키보드 포커스/aria/semantic)
- 정보 구조(계층, 간격, 대비)와 스캔 효율을 우선한다

### 5.3 리팩토링
- 범위 최소화, 동작 동일성 유지(기능 변경과 리팩토링은 분리)
- 복잡도 감소가 목표(책임 분리, 중복 제거, 테스트 가능성 향상)
- 필요 시 테스트/스냅샷/스토리북으로 안전장치 추가

### 5.4 API 연동 (SWR + Axios + zod)
- zod 스키마부터 정의(요청/응답)
- src/actions/에서만 데이터 패칭
- SWR key/파라미터 규칙을 지켜 중복/충돌을 방지
- 응답은 zod safeParse로 검증 후 정규화하여 반환
- 로딩/에러/빈 상태 UI 규칙대로 구현
- 네트워크 케이스(지연/실패)와 재시도 UX 확인

### 5.5 대시보드 위젯 추가/수정
- 위젯 규격 정의: 입력(필터/기간/대상) / 출력(지표/차트) / 빈 상태 / 에러 상태
- 성능 고려: 불필요 리렌더 방지(메모이제이션), polling/refresh 규칙(기본값/최대 빈도)
- 레이아웃 저장/복구/권한(읽기/편집) 흐름 확인
- 기존 대시보드와 호환성(설정/저장 데이터 마이그레이션 필요 여부) 검토

### 5.6 차트/지표 UI
- 단위/포맷: %, ms, bytes 변환, 천단위/소수점 자리수 규칙
- 시간 범위/타임존 기준 명확화(표시/쿼리 기준이 다르면 문서로 고정)
- 데이터 많을 때 성능: 메모이제이션, 가상화, 필요 시 샘플링/요약
- 상호작용 UX: 툴팁/범례/필터와의 연결(예상 동작 명확히)

## 6. Output Expectations (Claude 응답 형식)
- 먼저 3~6줄 요약: 무엇을/어디를/왜 바꿨는지
- 그 다음 체크리스트: 리스크, 테스트 방법, 다음 단계
- 확실하지 않은 내용은 추측하지 말고 근거/가정을 명시한다.

## 7. 템플릿 잔존 코드 정리 (Minimals Template Cleanup)
- 이 프로젝트는 Minimals 템플릿 기반으로 시작되었으며, **모니터링과 무관한 템플릿 잔존 코드가 아직 정리되지 않은 상태**이다.
- 아래 섹션/페이지들은 Lighthouse 서비스와 무관하므로, 관련 작업 시 참조하거나 의존하지 않는다:
  - ecommerce, analytics, banking, booking, course, file (overview 대시보드들)
  - product, invoice, job, tour, blog/post (CRUD 모듈)
  - checkout, chat, mail, calendar, kanban, file-manager (앱 기능)
  - order (주문 관리)
  - auth-demo, components (데모/쇼케이스)
  - main 사이트 페이지 (pricing, payment, about, contact 등)
- 신규 기능 개발 시 이들 템플릿 코드를 재사용/참조하지 않는다. Lighthouse 고유 섹션(`overview/`, `server-instances/`, `logs/`, `user/`)만 활용한다.
- 향후 정리 작업 시 위 목록을 기준으로 삭제한다.

## 8. Deep Docs
- 아키텍처: docs/architecture.md
- 디자인 시스템: docs/design-system.md
- 코딩 컨벤션: docs/conventions.md