# Coding Conventions

> Lighthouse FE 프로젝트의 코딩 규칙과 패턴을 정리한 문서

## 1. 코드 포맷팅 (Prettier)

`prettier.config.mjs` 기준:

| 규칙 | 값 | 설명 |
|------|----|------|
| semi | `true` | 세미콜론 필수 |
| tabWidth | `2` | 인덴트 2칸 |
| endOfLine | `'lf'` | 줄바꿈 LF (Unix 방식) |
| printWidth | `100` | 한 줄 최대 100자 |
| singleQuote | `true` | 작은따옴표 사용 |
| trailingComma | `'es5'` | ES5 호환 위치에 후행 쉼표 |

**실행 명령어:**
```bash
npm run fm:check   # 포맷 검사
npm run fm:fix     # 자동 수정
npm run fix:all    # ESLint + Prettier 한번에 수정
```

## 2. ESLint 규칙 요약

`eslint.config.mjs` 기준. 플러그인: `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-import`, `eslint-plugin-perfectionist`, `eslint-plugin-unused-imports`

### 2.1 일반 JavaScript

| 규칙 | 수준 | 의미 |
|------|------|------|
| `no-shadow` | error | 외부 스코프 변수명 재선언 금지 |
| `no-bitwise` | error | 비트 연산자 사용 금지 |
| `consistent-return` | error | 함수 내 return 값 일관성 |
| `default-case` | error | switch문에 default 필수 (`// no default` 주석으로 예외 가능) |
| `default-case-last` | error | default는 switch 마지막에 |
| `no-constant-condition` | warn | 상수 조건식 경고 |
| `no-unused-vars` | warn | 미사용 변수 경고 (함수 인자는 허용: `args: 'none'`) |
| `object-shorthand` | warn | 객체 축약 표기 권장 (`{ name }` not `{ name: name }`) |
| `no-useless-rename` | warn | 불필요한 rename 금지 (`import { x as x }`) |
| `func-names` | warn | 익명 함수에 이름 부여 권장 |
| `arrow-body-style` | error | 화살표 함수 불필요한 중괄호 제거 (`as-needed`) |

### 2.2 React

| 규칙 | 수준 | 의미 |
|------|------|------|
| `react-hooks/*` | recommended | Hook 규칙 (deps 배열 등) 기본 적용 |
| `react/jsx-boolean-value` | error | `<Comp disabled />` (not `disabled={true}`) |
| `react/self-closing-comp` | error | 자식 없는 태그는 self-closing (`<Box />`) |
| `react/jsx-curly-brace-presence` | error | 불필요한 중괄호 제거 (`"text"` not `{"text"}`) |
| `react/jsx-no-useless-fragment` | warn | 불필요한 Fragment 경고 |
| `react/prop-types` | off | PropTypes 검사 비활성 |
| `react/react-in-jsx-scope` | off | React import 불필요 (React 17+) |

### 2.3 Import 관련

| 규칙 | 수준 | 의미 |
|------|------|------|
| `import/newline-after-import` | error | import 블록 뒤에 빈 줄 필수 |
| `unused-imports/no-unused-imports` | warn | 미사용 import 경고 |

### 2.4 Import 정렬 순서 (perfectionist)

**반드시 아래 그룹 순서로 import를 정렬한다.** 그룹 사이에는 빈 줄을 넣는다. 같은 그룹 내에서는 줄 길이 오름차순(asc) 정렬.

```javascript
// 1. style — CSS/스타일 파일
import './styles.css';

// 2. side-effect — 부수효과 import
import 'dayjs/locale/ko';

// 3. external/builtin — 외부 패키지
import { useMemo, useState } from 'react';

// 4. @mui/* — MUI 패키지
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

// 5. routes — 라우팅 관련
import { paths } from 'src/routes/paths';

// 6. hooks — 커스텀 훅
import { useBoolean } from 'src/hooks/use-boolean';

// 7. utils — 유틸리티
import { fNumber } from 'src/utils/format-number';

// 8. internal — 기타 src/ 내부 모듈
import { CONFIG } from 'src/global-config';

// 9. components — 공용 컴포넌트
import { Chart } from 'src/components/chart';

// 10. sections — 섹션 컴포넌트
import { SomeWidget } from 'src/sections/monitoring/some-widget';

// 11. auth — 인증 관련
import { useAuthContext } from 'src/auth/hooks';

// 12. relative — 상대 경로 import
import { localHelper } from './helper';
```

**실행 명령어:**
```bash
npm run lint       # ESLint 검사
npm run lint:fix   # 자동 수정
```

## 3. 파일/디렉토리 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | kebab-case | `monitoring-widget-summary.jsx` |
| 뷰 파일 | kebab-case + `-view` 접미사 | `monitoring-dashboard-view.jsx` |
| 훅 파일 | kebab-case + `use-` 접두사 | `use-monitoring-tokens.js` |
| 유틸 파일 | kebab-case | `format-number.js` |
| SWR 액션 파일 | kebab-case (도메인명) | `monitoring.js` |
| 디렉토리 | kebab-case | `server-instances/`, `overview-v2/` |
| 컴포넌트 export | PascalCase | `export function MonitoringWidgetSummary()` |
| 훅 export | camelCase + `use` 접두사 | `export function useMonitoringTokens()` |

## 4. 컴포넌트 구조 패턴

### 4.1 페이지 뷰 (src/sections/*/view/)

```jsx
// src/sections/[feature]/view/[feature]-[name]-view.jsx

import { useState } from 'react';

import Grid from '@mui/material/Grid';

import { DashboardContent } from 'src/layouts/dashboard';

import { useGetSomeData } from 'src/actions/monitoring';

import { SomeWidget } from '../some-widget';

export function FeatureNameView() {
  // 1. 상태/훅 선언
  const [filter, setFilter] = useState('default');
  const { data, dataLoading, dataError } = useGetSomeData(filter);

  // 2. 렌더링
  return (
    <DashboardContent>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SomeWidget
            data={data}
            loading={dataLoading}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
```

### 4.2 위젯 컴포넌트

```jsx
// src/sections/[feature]/[feature]-[widget-name].jsx

import { useMemo } from 'react';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { Chart } from 'src/components/chart';

export function FeatureWidgetName({ title, data, loading, ...other }) {
  // 1. 데이터 변환 (useMemo)
  const chartData = useMemo(() => transformData(data), [data]);

  // 2. 로딩 상태
  if (loading) return <Skeleton />;

  // 3. 빈 상태
  if (!data?.length) return <EmptyContent />;

  // 4. 렌더링
  return (
    <Card {...other}>
      <CardHeader title={title} />
      <Chart options={chartOptions} series={chartData} />
    </Card>
  );
}
```

### 4.3 페이지 래퍼 (src/pages/)

```jsx
// src/pages/dashboard/[page-name].jsx
// 얇은 래퍼 — 뷰 컴포넌트를 import만 한다

import { Helmet } from 'react-helmet-async';

import { FeatureNameView } from 'src/sections/feature/view';

export default function Page() {
  return (
    <>
      <Helmet><title>페이지 제목</title></Helmet>
      <FeatureNameView />
    </>
  );
}
```

## 5. 상태 관리 규칙

| 상태 종류 | 도구 | 위치 |
|-----------|------|------|
| 서버 데이터 (API 응답) | SWR | `src/actions/` |
| UI 상태 (필터, 토글, 모달) | React useState/useReducer | 해당 컴포넌트 |
| 전역 UI 상태 (레이아웃, 위젯 배치) | Zustand (도입 예정) | `src/store/` |
| 인증 상태 | React Context | `src/auth/` |
| 테마/설정 | React Context | `src/components/settings/` |

**금지 사항:**
- 컴포넌트에서 axios 직접 호출 금지 → 반드시 `src/actions/`의 SWR 훅 사용
- Zustand에 서버 데이터 저장 금지 → SWR 캐시와 중복/불일치 발생

## 6. SWR 훅 작성 패턴

```javascript
// src/actions/[domain].js

import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';

const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 60000,
};

export function useGetSomething(param1, param2) {
  const url = param1
    ? `${endpoints.dashboard.something}?param1=${param1}&param2=${param2}`
    : null;  // null → SWR가 요청하지 않음

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      something: data?.data ?? [],
      somethingLoading: isLoading,
      somethingError: error,
      somethingValidating: isValidating,
    }),
    [data, isLoading, error, isValidating]
  );

  return memoizedValue;
}
```

## 7. 로딩/에러/빈 상태 처리

모든 데이터 의존 컴포넌트에서 3가지 상태를 반드시 처리한다:

```jsx
// 로딩
if (loading) return <Skeleton variant="rectangular" height={200} />;

// 에러
if (error) return <Alert severity="error">데이터를 불러오지 못했습니다.</Alert>;

// 빈 상태
if (!data?.length) return <EmptyContent title="데이터가 없습니다" />;

// 정상 렌더링
return <ActualContent data={data} />;
```

## 8. 숫자/날짜 포맷

### 숫자 (`src/utils/format-number.js`)

| 함수 | 용도 | 예시 |
|------|------|------|
| `fNumber(value)` | 일반 숫자 | `1,234.56` |
| `fPercent(value)` | 퍼센트 | `85.5%` |
| `fShortenNumber(value)` | 축약 | `1.2k`, `3.4m` |
| `fData(value)` | 바이트 변환 | `1.5 Gb` |

### 날짜 (`src/utils/format-time.js`)

**타임존: `Asia/Seoul` (고정)**

| 함수 | 용도 | 포맷 |
|------|------|------|
| `fDateTime(date)` | 날짜+시간 | `2026-03-03 14:30:00` |
| `fDate(date)` | 날짜만 | `2026-03-03` |
| `fTime(date)` | 시간만 | `14:30:00` |
| `fToNow(date)` | 상대시간 | `2시간 전` |

## 9. 커밋 컨벤션

```
<type>(<scope>): <subject>

<body>
```

| type | 설명 |
|------|------|
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| docs | 문서 수정 |
| style | 코드 포맷팅 (동작 변경 없음) |
| refactor | 리팩토링 |
| test | 테스트 추가/수정 |
| chore | 빌드/패키지 설정 변경 |

**예시:**
```
feat(dashboard): 서버 인스턴스 상세 화면 추가

서버 인스턴스 상세 페이지와 리소스 메트릭 위젯 구현
- CPU/메모리/디스크 사용률 차트
- 인스턴스 기본 정보 패널
```

## 10. 자주 틀리는 패턴과 올바른 패턴

### 화살표 함수 바디 (arrow-body-style: as-needed)

```javascript
// BAD
const getName = () => { return user.name; };
const items = list.map((item) => { return item.id; });

// GOOD
const getName = () => user.name;
const items = list.map((item) => item.id);
```

### JSX boolean 값 (react/jsx-boolean-value)

```jsx
// BAD
<Button disabled={true} />
<Input readOnly={false} />

// GOOD
<Button disabled />
// readOnly={false}는 prop 자체를 제거
```

### self-closing (react/self-closing-comp)

```jsx
// BAD
<Box></Box>
<CustomComponent></CustomComponent>

// GOOD
<Box />
<CustomComponent />
```

### 불필요한 중괄호 (react/jsx-curly-brace-presence)

```jsx
// BAD
<Typography variant={"h6"}>{"제목"}</Typography>

// GOOD
<Typography variant="h6">제목</Typography>
```

### 객체 축약 (object-shorthand)

```javascript
// BAD
const config = { name: name, value: value };

// GOOD
const config = { name, value };
```

### 변수 셰도잉 (no-shadow)

```javascript
// BAD
const value = 'outer';
function process(items) {
  const value = 'inner';  // error: 외부 value를 가림
}

// GOOD
const value = 'outer';
function process(items) {
  const innerValue = 'inner';
}
```
