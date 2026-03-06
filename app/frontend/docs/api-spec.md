# API Specification

> Lighthouse FE에서 사용하는 백엔드 API 엔드포인트 명세
>
> 엔드포인트 정의: `src/lib/axios.js` → `endpoints` 객체
> SWR 훅: `src/actions/monitoring.js`

## 1. 공통 사항

### Base URL
- `CONFIG.serverUrl` (`src/global-config.js`에서 설정)

### 인증
- 모든 요청에 `Authorization: Bearer <jwt_token>` 헤더 포함
- 토큰은 로그인 시 발급, `localStorage`에 `jwt_access_token` 키로 저장

### 에러 응답 처리
| HTTP 상태 | 처리 방식 |
|-----------|-----------|
| 401 | 세션 만료 → 토큰 삭제 → `/login` 리다이렉트 |
| 네트워크 에러 (응답 없음) | SERVER_DOWN_EVENT → 서버 점검 화면 |
| 기타 4xx/5xx | SWR `error` 상태 → 컴포넌트에서 에러 UI 표시 |

### SWR 글로벌 옵션
```javascript
{
  revalidateIfStale: true,      // 캐시가 stale이면 재검증
  revalidateOnFocus: false,     // 탭 전환 시 재검증 안 함
  revalidateOnReconnect: true,  // 네트워크 복구 시 재검증
  refreshInterval: 60000,       // 60초마다 자동 폴링
}
```

---

## 2. 인증 API

### POST `/api/auth/login`
로그인

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "string (JWT)"
}
```

### POST `/api/auth/refresh`
토큰 갱신

### POST `/api/auth/sign-up`
회원가입

---

## 3. 헬스 체크 API

### GET `/api/health`
서버 상태 확인. ServerHealthProvider가 장애 감지 후 15초 간격으로 폴링.

**Response:** 200 OK이면 정상

---

## 4. 대시보드 API

### GET `/api/dashboard/summary`
대시보드 상단 요약 지표

**SWR 훅:** `useGetDashboardSummary(from, to)`

**Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | string (ISO 8601) | Y | 조회 시작 시간 |
| to | string (ISO 8601) | Y | 조회 종료 시간 |

**Response:**
```json
{
  "data": {
    "totalLogs": 0,
    "errorRate": 0.0,
    "avgResponseTime": 0,
    "activeServers": 0
    // ... 기타 요약 지표
  }
}
```

**훅 반환값:** `{ summary, summaryLoading, summaryError, summaryValidating }`

---

### GET `/api/dashboard/server-status`
서버 인스턴스 상태 목록

**SWR 훅:** `useGetServerStatus(recentMinutes)`

**Parameters:**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| recentMinutes | number | N | 30 | 최근 N분 기준 상태 조회 |

**Response:**
```json
{
  "data": [
    {
      "serverId": "string",
      "serverName": "string",
      "status": "UP | DOWN | WARN",
      "cpu": 0.0,
      "memory": 0.0,
      "lastHeartbeat": "ISO 8601"
    }
  ]
}
```

**훅 반환값:** `{ servers, serversLoading, serversError, serversValidating }`

---

### GET `/api/dashboard/log-volume`
시간대별 로그 발생량 (영역 차트용)

**SWR 훅:** `useGetLogVolume(from, to)`

**Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | string (ISO 8601) | Y | 조회 시작 시간 |
| to | string (ISO 8601) | Y | 조회 종료 시간 |

**Response:**
```json
{
  "data": {
    "points": [
      {
        "time": "ISO 8601",
        "infoCount": 0,
        "warnCount": 0,
        "errorCount": 0
      }
    ]
  }
}
```

**훅 반환값:** `{ logVolume, logVolumeLoading, logVolumeError, logVolumeValidating }`

**차트 변환:** `points[]` → categories(시간 배열) + series(INFO/WARN/ERROR 각 배열) → 스택형 영역 차트

---

### GET `/api/dashboard/log-level-distribution`
로그 레벨별 분포 (도넛 차트용)

**SWR 훅:** `useGetLogLevelDist(from, to)`

**Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | string (ISO 8601) | Y | 조회 시작 시간 |
| to | string (ISO 8601) | Y | 조회 종료 시간 |

**Response:**
```json
{
  "data": {
    "distribution": [
      { "level": "INFO", "count": 0 },
      { "level": "WARN", "count": 0 },
      { "level": "ERROR", "count": 0 },
      { "level": "FATAL", "count": 0 }
    ]
  }
}
```

**훅 반환값:** `{ logLevelDist, logLevelDistLoading, logLevelDistError, logLevelDistValidating }`

---

### GET `/api/dashboard/error-trend`
에러 발생 추이 (라인 차트용)

**SWR 훅:** `useGetErrorTrend(from, to)`

**Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | string (ISO 8601) | Y | 조회 시작 시간 |
| to | string (ISO 8601) | Y | 조회 종료 시간 |

**Response:**
```json
{
  "data": {
    "points": [
      {
        "time": "ISO 8601",
        "errorCount": 0,
        "fatalCount": 0
      }
    ]
  }
}
```

**훅 반환값:** `{ errorTrend, errorTrendLoading, errorTrendError, errorTrendValidating }`

**차트 변환:** `points[]` → categories(시간) + series(ERROR/FATAL) → 라인 차트

---

### GET `/api/dashboard/api-ranking`
API 호출 순위 (테이블)

**SWR 훅:** `useGetApiRanking(from, to)`

**Parameters:**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| from | string (ISO 8601) | Y | - | 조회 시작 시간 |
| to | string (ISO 8601) | Y | - | 조회 종료 시간 |
| limit | number | N | 10 | 상위 N개 |

**Response:**
```json
{
  "data": {
    "rankings": [
      {
        "endpoint": "string",
        "method": "GET | POST | PUT | DELETE",
        "count": 0,
        "avgResponseTime": 0,
        "errorRate": 0.0
      }
    ]
  }
}
```

**훅 반환값:** `{ apiRanking, apiRankingLoading, apiRankingError, apiRankingValidating }`

---

### GET `/api/dashboard/recent-errors`
최근 에러 목록 (테이블)

**SWR 훅:** `useGetRecentErrors(from, to)`

**Parameters:**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| from | string (ISO 8601) | Y | - | 조회 시작 시간 |
| to | string (ISO 8601) | Y | - | 조회 종료 시간 |
| limit | number | N | 50 | 최대 N개 |

**Response:**
```json
{
  "data": {
    "groups": [
      {
        "errorType": "string",
        "message": "string",
        "count": 0,
        "lastOccurrence": "ISO 8601",
        "serverName": "string"
      }
    ]
  }
}
```

**훅 반환값:** `{ recentErrors, recentErrorsLoading, recentErrorsError, recentErrorsValidating }`

---

## 5. 템플릿 API (Minimals)

현재 프로젝트에 엔드포인트가 정의되어 있으나, Lighthouse 핵심 기능이 아닌 템플릿 기능용.

| 엔드포인트 | 용도 | 비고 |
|------------|------|------|
| `/api/chat` | 채팅 | 템플릿 |
| `/api/kanban` | 칸반 보드 | 템플릿 |
| `/api/calendar` | 캘린더 | 템플릿 |
| `/api/mail/*` | 메일 | 템플릿 |
| `/api/post/*` | 블로그/게시글 | 템플릿 |
| `/api/product/*` | 상품 | 템플릿 |

---

## 6. 시간 범위 프리셋

대시보드 API의 `from`/`to` 파라미터에 사용되는 기본 프리셋:

| 프리셋 | from 계산 |
|--------|-----------|
| 최근 15분 | `now - 15m` |
| 최근 1시간 (기본값) | `now - 1h` |
| 최근 6시간 | `now - 6h` |
| 최근 24시간 | `now - 24h` |
| 최근 7일 | `now - 7d` |
| 최근 30일 | `now - 30d` |
| 사용자 지정 | DateTimePicker로 직접 선택 |

---

## 7. 새 API 추가 시 체크리스트

1. `src/lib/axios.js` → `endpoints` 객체에 엔드포인트 경로 추가
2. `src/actions/[domain].js` → SWR 훅 작성 (기존 패턴 참고)
3. (향후) `src/schemas/[domain].js` → zod 스키마 정의, safeParse 적용
4. 이 문서(`docs/api-spec.md`)에 엔드포인트 명세 추가
5. 컴포넌트에서 로딩/에러/빈 상태 처리 확인
