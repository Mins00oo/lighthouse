# Troubleshooting

> 이슈 발생 시 원인과 해결법을 기록하는 문서
>
> 같은 문제를 반복해서 겪지 않도록, 해결할 때마다 이 문서에 추가한다.

---

## 사용 가이드

### 이슈 기록 템플릿

새 이슈를 해결했을 때 아래 형식으로 해당 카테고리에 추가한다:

```markdown
### 이슈 제목 (간결하게)
- **증상:** 사용자가 보는 현상
- **원인:** 근본 원인
- **해결:** 수정 내용
- **날짜:** YYYY-MM-DD
- **관련 파일:** 수정한 파일 경로
```

---

## 1. 개발 환경

### npm install 시 peer dependency 충돌
- **증상:** `npm install`에서 ERESOLVE 에러 발생
- **원인:** React 19와 일부 패키지의 peerDependency 버전 충돌
- **해결:** `npm install --legacy-peer-deps` 사용
- **관련 파일:** `package.json`

### Vite 개발 서버가 시작되지 않음
- **증상:** `npm run dev` 실행 시 포트 충돌 또는 시작 실패
- **원인:** 이미 해당 포트를 사용하는 프로세스 존재
- **해결:**
  - `netstat -ano | findstr :<포트번호>` → PID 확인 → `taskkill /PID <PID> /F`
  - 또는 `vite.config.js`에서 포트 변경

### ESLint 실행 시 import 순서 에러가 대량 발생
- **증상:** `npm run lint`에서 perfectionist/sort-imports 관련 에러 다수
- **원인:** import 그룹 순서 또는 그룹 간 빈 줄 규칙 위반
- **해결:** `npm run lint:fix`로 자동 수정. 자동 수정 안 되는 경우 `docs/conventions.md`의 import 순서 참고하여 수동 정리

---

## 2. 인증/세션

### 로그인 후 즉시 로그인 페이지로 돌아감
- **증상:** 로그인 성공 후 대시보드로 이동했다가 바로 로그인 화면으로 리다이렉트
- **원인 후보:**
  1. JWT 토큰이 localStorage에 저장되지 않음
  2. 토큰 만료 시간이 매우 짧게 설정됨
  3. Axios 인터셉터에서 401 감지 후 리다이렉트
- **디버깅:**
  1. 개발자 도구 > Application > localStorage에서 `jwt_access_token` 확인
  2. Network 탭에서 401 응답이 오는 요청 확인
  3. 토큰 디코딩하여 `exp` 클레임 확인 (https://jwt.io)
- **관련 파일:** `src/auth/context/jwt/auth-provider.jsx`, `src/lib/axios.js`

### 세션 만료 후 이전 페이지로 복귀 안 됨
- **증상:** 세션 만료 → 재로그인 후 대시보드 루트로만 이동
- **원인:** 세션 만료 시 이전 경로를 저장하지 않음
- **해결:** sessionStorage에 만료 시점의 경로를 저장하고 로그인 후 복원하는 로직 필요
- **관련 파일:** `src/lib/axios.js` (401 처리 부분)

---

## 3. API/네트워크

### 서버 점검 화면이 표시되고 복구되지 않음
- **증상:** "서비스 점검 중" 화면이 계속 표시됨
- **원인:** ServerHealthProvider가 `/api/health` 폴링 중이나 서버가 응답하지 않음
- **디버깅:**
  1. 백엔드 서버가 실제로 동작 중인지 확인
  2. `CONFIG.serverUrl`이 올바른지 확인 (`src/global-config.js`)
  3. CORS 설정 확인
  4. Network 탭에서 health 요청 상태 확인
- **관련 파일:** `src/context/server-health-context.jsx` (15초 폴링)

### SWR 데이터가 갱신되지 않음
- **증상:** 대시보드 데이터가 오래된 상태로 유지
- **원인 후보:**
  1. SWR key가 동일하여 캐시된 데이터 반환
  2. `refreshInterval`이 동작하지 않음
  3. 시간 범위 파라미터가 변경되지 않음
- **디버깅:**
  1. React DevTools에서 SWR 훅의 key 값 확인
  2. Network 탭에서 주기적 요청이 발생하는지 확인
  3. `from`/`to` 파라미터가 실제로 변경되는지 확인
- **관련 파일:** `src/actions/monitoring.js`

### API 응답 구조가 변경되어 차트가 빈 화면으로 표시
- **증상:** 차트 위젯이 데이터 없음 상태로 표시되지만, Network 탭에서 응답은 정상
- **원인:** 백엔드 응답 구조가 변경되었으나 프론트엔드의 데이터 접근 경로가 맞지 않음
- **디버깅:**
  1. Network 탭에서 실제 응답 JSON 구조 확인
  2. SWR 훅의 데이터 접근 경로 확인 (예: `data?.data?.points`)
  3. (향후) zod 스키마 검증 로그 확인
- **해결:** SWR 훅의 데이터 접근 경로를 실제 응답에 맞게 수정
- **관련 파일:** `src/actions/monitoring.js`, `docs/api-spec.md`

---

## 4. UI/렌더링

### 차트가 렌더링되지 않거나 크기가 0
- **증상:** 차트 영역이 비어있거나 높이 0으로 표시
- **원인 후보:**
  1. 차트 컨테이너의 크기가 확정되기 전에 렌더링
  2. ApexCharts 옵션의 height/width 미설정
  3. 데이터가 빈 배열
- **디버깅:**
  1. 개발자 도구에서 차트 컨테이너 DOM 크기 확인
  2. props로 전달되는 데이터 확인
  3. Chart 컴포넌트의 height prop 확인

### 다크 모드에서 텍스트/배경 색상이 보이지 않음
- **증상:** 다크 모드 전환 시 일부 요소가 안 보이거나 대비가 낮음
- **원인:** 하드코딩된 색상 사용 (디자인 토큰 미사용)
- **해결:** `useMonitoringTokens()` 훅에서 토큰 가져와 사용
- **관련 파일:** `src/hooks/use-monitoring-tokens.js`, `src/sections/overview-v2/v2-tokens.js`

### DataGrid 테이블이 깨져서 표시
- **증상:** MUI DataGrid 컬럼이 겹치거나 스크롤이 비정상
- **원인 후보:**
  1. 컬럼 width 합이 컨테이너보다 큼
  2. `flex` 속성과 `width` 속성 혼용
  3. 컨테이너에 고정 높이 미설정
- **해결:** DataGrid를 감싸는 Box에 `height` 지정, 컬럼에 `flex: 1` 사용

---

## 5. 빌드/배포

### 빌드 시 메모리 부족 (JavaScript heap out of memory)
- **증상:** `npm run build`에서 메모리 초과 에러
- **해결:** Node 메모리 한도 증가
  ```bash
  export NODE_OPTIONS="--max-old-space-size=4096"
  npm run build
  ```

### 빌드 결과물에서 라우팅이 동작하지 않음
- **증상:** SPA 배포 후 새로고침 시 404
- **원인:** 서버가 SPA fallback 설정이 안 됨 (모든 경로 → index.html)
- **해결:** 웹 서버(nginx/Apache)에 SPA fallback 규칙 추가

---

## 6. 이슈 기록 (시간순)

> 실제 발생한 이슈를 아래에 날짜순으로 기록한다.
> 위 카테고리에 해당하는 유형이면 해당 섹션에도 추가한다.

<!--
### 예시: 대시보드 로딩 시 빈 화면 발생
- **증상:** 대시보드 진입 시 모든 위젯이 빈 상태로 표시
- **원인:** TimeRangePicker 초기값이 null이어서 SWR 훅에 from/to가 전달되지 않음
- **해결:** TimeRangePicker 기본값을 "최근 1시간"으로 설정
- **날짜:** 2026-03-03
- **관련 파일:** src/sections/overview-v2/v2-time-range-picker.jsx
-->
