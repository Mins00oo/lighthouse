# Overview Dashboard API 명세

> Overview 대시보드에서 사용하는 백엔드 API 목록.
> 모든 API는 JWT 인증 필요 (`Authorization: Bearer <token>`).
> 시간 파라미터는 KST ISO-8601 문자열 (`2026-03-06T14:00:00+09:00`).

## 백엔드 구현 참고사항

> 상세: `app/backend/docs/api-overview-backend-notes.md`

- **응답 envelope**: `{ "success": true, "data": ..., "timestamp": "..." }` — 프론트에서 `response.data.data`로 접근
- **응답 시간 형식**: 오프셋 없는 `LocalDateTime` (`"2026-03-06T14:00:00"`) — 프론트에서 KST로 간주
- **error-logs `id`**: 매 조회마다 랜덤 UUID 생성 (리스트 key 전용, 재조회 불가)
- **error-logs `traceId`**: 현재 항상 null (ClickHouse 테이블에 컬럼 미존재) → UI에서 null이면 숨김 처리
- **에러 기준**: `http_status >= 400` (로그 레벨 기반이 아닌 HTTP 상태 기반)

---

## 1. 요약 지표 (Summary)

| 항목 | 값 |
|------|-----|
| **URL** | `GET /api/overview/summary` |
| **설명** | 선택 기간 내 총 요청 수, 에러 건수, 평균 응답 시간 |

### Request

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `from` | string | O | 조회 시작 시간 (KST ISO-8601) |
| `to` | string | O | 조회 끝 시간 (KST ISO-8601) |

```
GET /api/overview/summary?from=2026-03-06T13:00:00%2B09:00&to=2026-03-06T14:00:00%2B09:00
```

### Response

```json
{
  "data": {
    "totalRequests": 128450,
    "errorCount": 1327,
    "avgResponseTimeMs": 245.3
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `totalRequests` | number | 총 HTTP 요청 수 |
| `errorCount` | number | HTTP 4xx + 5xx 응답 건수 |
| `avgResponseTimeMs` | number | 전체 요청 평균 응답 시간 (ms) |

---

## 2. 시간대별 요청량 (Request Volume)

| 항목 | 값 |
|------|-----|
| **URL** | `GET /api/overview/request-volume` |
| **설명** | 시간 구간별 요청 수 (bar chart 용) |

### Request

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `from` | string | O | 조회 시작 시간 |
| `to` | string | O | 조회 끝 시간 |
| `intervalMin` | number | O | 집계 간격 (분). 10 \| 30 \| 60 |

```
GET /api/overview/request-volume?from=...&to=...&intervalMin=10
```

### Response

```json
{
  "data": [
    {
      "time": "2026-03-06T13:00:00+09:00",
      "requestCount": 2345
    },
    {
      "time": "2026-03-06T13:10:00+09:00",
      "requestCount": 3120
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `time` | string | 구간 시작 시간 (KST ISO-8601) |
| `requestCount` | number | 해당 구간 요청 수 |

---

## 3. 시간대별 응답 시간 (Response Time P95/P99)

| 항목 | 값 |
|------|-----|
| **URL** | `GET /api/overview/response-time` |
| **설명** | 시간 구간별 P95, P99 응답 시간 (line chart 용) |

### Request

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `from` | string | O | 조회 시작 시간 |
| `to` | string | O | 조회 끝 시간 |
| `intervalMin` | number | O | 집계 간격 (분). 10 \| 30 \| 60 |

```
GET /api/overview/response-time?from=...&to=...&intervalMin=10
```

### Response

```json
{
  "data": [
    {
      "time": "2026-03-06T13:00:00+09:00",
      "p95Ms": 320,
      "p99Ms": 780
    },
    {
      "time": "2026-03-06T13:10:00+09:00",
      "p95Ms": 290,
      "p99Ms": 650
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `time` | string | 구간 시작 시간 |
| `p95Ms` | number | P95 응답 시간 (ms) |
| `p99Ms` | number | P99 응답 시간 (ms) |

---

## 4. 응답 느린 TOP API (Slow API Ranking)

| 항목 | 값 |
|------|-----|
| **URL** | `GET /api/overview/slow-apis` |
| **설명** | P95 응답 시간 기준 내림차순 상위 API 목록 |

### Request

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `from` | string | O | 조회 시작 시간 |
| `to` | string | O | 조회 끝 시간 |
| `limit` | number | X | 결과 수 제한 (기본값: 10) |

```
GET /api/overview/slow-apis?from=...&to=...&limit=10
```

### Response

```json
{
  "data": [
    {
      "rank": 1,
      "httpMethod": "POST",
      "httpPath": "/api/reports/generate",
      "p95Ms": 3420,
      "avgMs": 1850,
      "requestCount": 342
    },
    {
      "rank": 2,
      "httpMethod": "GET",
      "httpPath": "/api/dashboard/analytics",
      "p95Ms": 2870,
      "avgMs": 1230,
      "requestCount": 1205
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `rank` | number | 순위 (1부터 시작) |
| `httpMethod` | string | HTTP 메서드 (GET, POST, PUT, DELETE 등) |
| `httpPath` | string | 엔드포인트 경로 |
| `p95Ms` | number | P95 응답 시간 (ms) |
| `avgMs` | number | 평균 응답 시간 (ms) |
| `requestCount` | number | 요청 횟수 |

---

## 5. 최근 에러 로그 (Recent Error Logs)

| 항목 | 값 |
|------|-----|
| **URL** | `GET /api/overview/error-logs` |
| **설명** | HTTP 4xx/5xx 응답 로그를 최신순으로 조회 |

### Request

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `from` | string | O | 조회 시작 시간 |
| `to` | string | O | 조회 끝 시간 |
| `limit` | number | X | 결과 수 제한 (기본값: 20) |

```
GET /api/overview/error-logs?from=...&to=...&limit=20
```

### Response

```json
{
  "data": [
    {
      "id": "err-001",
      "timestamp": "2026-03-06T13:58:00+09:00",
      "httpMethod": "POST",
      "httpPath": "/api/reports/generate",
      "httpStatus": 500,
      "serviceName": "report-service",
      "message": "java.lang.OutOfMemoryError: Java heap space",
      "traceId": "abc-123-def-456"
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 로그 고유 ID |
| `timestamp` | string | 발생 시간 (KST ISO-8601) |
| `httpMethod` | string | HTTP 메서드 |
| `httpPath` | string | 요청 경로 |
| `httpStatus` | number | HTTP 상태 코드 (4xx/5xx) |
| `serviceName` | string | 서비스(애플리케이션) 이름 |
| `message` | string | 에러 메시지 (Exception 포함) |
| `traceId` | string | 분산 추적 ID (nullable) |

---

## API 요약 테이블

| # | Method | URL | 설명 |
|---|--------|-----|------|
| 1 | GET | `/api/overview/summary` | 요약 지표 (요청 수, 에러 건수, 평균 응답 시간) |
| 2 | GET | `/api/overview/request-volume` | 시간대별 요청량 |
| 3 | GET | `/api/overview/response-time` | 시간대별 P95/P99 응답 시간 |
| 4 | GET | `/api/overview/slow-apis` | 응답 느린 TOP API |
| 5 | GET | `/api/overview/error-logs` | 최근 에러 로그 |

### 공통 사항

- **인증**: 모든 요청에 `Authorization: Bearer <JWT>` 헤더 필요
- **응답 envelope**: `{ "data": ... }` 형태
- **에러 응답**: `{ "error": { "code": "...", "message": "..." } }`
- **시간 형식**: KST ISO-8601 (`2026-03-06T14:00:00+09:00`)
- **intervalMin 허용값**: `10`, `30`, `60` (분)

### ClickHouse 쿼리 참고

모든 API는 `app_logs` 테이블에서 조회하며, 필터 조건:
- `timestamp BETWEEN {from} AND {to}`
- 에러 로그: `http_status >= 400`
- 응답 시간 계산: `quantile(0.95)(response_time_ms)`, `quantile(0.99)(response_time_ms)`
- 시간 집계: `toStartOfInterval(timestamp, INTERVAL {intervalMin} MINUTE)`
