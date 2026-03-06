# Lighthouse 모니터링 시스템 — 화면 및 백엔드 요구사항 정의서

## 2. 백엔드 요구사항 (Backend API)

### 2.1 공통 규약

- Base URL: /api/v1
- 응답 포맷: JSON
- 시간 파라미터: ISO 8601 형식 (예: 2026-03-06T15:00:00+09:00)
- 에러 응답: { "code": "ERROR_CODE", "message": "설명" }
- ClickHouse 타임존: UTC 저장, 쿼리 시 toTimezone(timestamp, 'Asia/Seoul') 변환

---

### 2.2 API 목록

#### API-01. 대시보드 요약 카드

```
GET /api/v1/dashboard/summary
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | datetime | Y | 조회 시작 시간 |
| to | datetime | Y | 조회 끝 시간 |
| service | string | N | 서비스명 (미입력 시 전체) |

응답:
```json
{
  "totalRequests": 2040,
  "errorCount": 114,
  "avgResponseTime": 485.3
}
```

ClickHouse 쿼리 포인트:
- app_logs 테이블에서 시간 범위 내 COUNT(*), COUNT(http_status >= 400), AVG(response_time_ms)

---

#### API-02. 시계열 집계 (요청량 + 응답시간)

```
GET /api/v1/dashboard/timeseries
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | datetime | Y | 조회 시작 시간 |
| to | datetime | Y | 조회 끝 시간 |
| interval | string | Y | 집계 간격 (10m / 30m / 1h) |
| service | string | N | 서비스명 |

응답:
```json
{
  "buckets": [
    {
      "time": "2026-03-06T15:00:00+09:00",
      "requestCount": 390,
      "p95ResponseTime": 1245.0,
      "p99ResponseTime": 3450.0
    }
  ]
}
```

ClickHouse 쿼리 포인트:
- toStartOfInterval(timestamp, INTERVAL ...) 기준 GROUP BY
- COUNT(*), quantile(0.95)(response_time_ms), quantile(0.99)(response_time_ms)

---

#### API-03. 응답 느린 TOP API

```
GET /api/v1/dashboard/slow-apis
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | datetime | Y | 조회 시작 시간 |
| to | datetime | Y | 조회 끝 시간 |
| limit | int | N | 조회 건수 (기본값: 10) |
| service | string | N | 서비스명 |

응답:
```json
{
  "apis": [
    {
      "httpMethod": "POST",
      "httpPath": "/api/payments",
      "p95ResponseTime": 8900.0,
      "avgResponseTime": 5670.0,
      "requestCount": 45
    }
  ]
}
```

ClickHouse 쿼리 포인트:
- http_method, http_path 기준 GROUP BY
- quantile(0.95)(response_time_ms) DESC 정렬, LIMIT

---

#### API-04. 최근 에러 로그 목록

```
GET /api/v1/dashboard/recent-errors
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | datetime | Y | 조회 시작 시간 |
| to | datetime | Y | 조회 끝 시간 |
| limit | int | N | 조회 건수 (기본값: 20) |
| service | string | N | 서비스명 |

응답:
```json
{
  "errors": [
    {
      "id": "abc123",
      "timestamp": "2026-03-06T15:23:45.123+09:00",
      "level": "ERROR",
      "httpMethod": "POST",
      "httpPath": "/api/orders",
      "httpStatus": 500,
      "exceptionClass": "java.lang.NullPointerException",
      "responseTimeMs": 1245
    }
  ]
}
```

ClickHouse 쿼리 포인트:
- WHERE http_status >= 400, ORDER BY timestamp DESC, LIMIT

---

#### API-05. 로그 목록 조회

```
GET /api/v1/logs
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from | datetime | Y | 조회 시작 시간 |
| to | datetime | Y | 조회 끝 시간 |
| level | string | N | 로그 레벨 필터 (쉼표 구분: ERROR,WARN) |
| status | string | N | HTTP 상태 코드 필터 (2xx, 4xx, 5xx 또는 개별 코드) |
| method | string | N | HTTP 메서드 필터 (쉼표 구분: GET,POST) |
| path | string | N | 엔드포인트 부분 일치 검색 |
| minResponseTime | int | N | 최소 응답 시간 (ms) |
| maxResponseTime | int | N | 최대 응답 시간 (ms) |
| sort | string | N | 정렬 기준 (기본값: timestamp) |
| order | string | N | 정렬 방향 (asc / desc, 기본값: desc) |
| page | int | N | 페이지 번호 (기본값: 1) |
| size | int | N | 페이지 크기 (기본값: 50, 최대: 200) |
| service | string | N | 서비스명 |

응답:
```json
{
  "content": [
    {
      "id": "abc123",
      "timestamp": "2026-03-06T15:23:45.123+09:00",
      "level": "ERROR",
      "httpMethod": "POST",
      "httpPath": "/api/orders",
      "httpStatus": 500,
      "responseTimeMs": 1245,
      "clientIp": "192.168.1.100",
      "exceptionClass": "java.lang.NullPointerException",
      "service": "theke-dicube-system",
      "host": "301NZZA063221"
    }
  ],
  "page": 1,
  "size": 50,
  "totalElements": 2040,
  "totalPages": 41
}
```

ClickHouse 쿼리 포인트:
- 동적 WHERE 조건 조합
- path 필터: WHERE http_path LIKE '%/api/orders%'
- status 필터: 2xx → http_status >= 200 AND http_status < 300
- ORDER BY + LIMIT + OFFSET 페이지네이션
- 총 건수는 별도 COUNT 쿼리 (또는 ClickHouse의 count() OVER())

---

#### API-06. 로그 상세 조회

```
GET /api/v1/logs/{id}
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| id | string | Y | 로그 고유 식별자 |

응답:
```json
{
  "id": "abc123",
  "timestamp": "2026-03-06T15:23:45.123+09:00",
  "level": "ERROR",
  "loggerName": "lighthouse_access",
  "threadName": "http-nio-38080-exec-5",
  "message": "POST /api/orders 500 1245ms",
  "service": "theke-dicube-system",
  "host": "301NZZA063221",
  "httpMethod": "POST",
  "httpPath": "/api/orders",
  "httpStatus": 500,
  "responseTimeMs": 1245,
  "clientIp": "192.168.1.100",
  "exceptionClass": "java.lang.NullPointerException",
  "stackTrace": "java.lang.NullPointerException: Cannot invoke method...\n\tat com.theke.dicube.service.OrderService.createOrder..."
}
```

ClickHouse 쿼리 포인트:
- 로그 고유 식별자(id) 설계 필요: timestamp + service + thread_name + rowNumberInBlock() 조합 또는 generateUUIDv4() 활용

---

### 2.3 백엔드 구현 고려사항

#### 2.3.1 ClickHouse 쿼리 성능

- 모든 쿼리에 시간 범위(timestamp) 조건 필수 → 파티션 프루닝 활용
- 로그 목록 LIKE 검색은 시간 범위가 좁을수록 성능 향상
- 큰 시간 범위 조회 시 Materialized View 집계 테이블 활용 (2차)

#### 2.3.2 타임존 처리

- ClickHouse 저장: UTC
- API 응답: KST(+09:00) 변환
- 쿼리 시: 프론트에서 받은 KST 파라미터를 UTC로 변환 후 쿼리

#### 2.3.3 로그 고유 식별자

- ClickHouse app_logs 테이블에 id 컬럼 필요
- 방안 1: SDK에서 UUID 생성하여 로그에 포함
- 방안 2: ClickHouse INSERT 시 generateUUIDv4() 사용
- 방안 2가 SDK 수정 없이 가능하므로 권장

#### 2.3.4 캐싱 전략 (2차)

- 대시보드 요약/시계열 API: Redis 캐싱 (TTL 30초~1분)
- 과거 시간대 데이터: 긴 TTL (변하지 않으므로)
- 현재 시간대 포함 데이터: 짧은 TTL
- 캐시 키: API 경로 + 파라미터 해시

#### 2.3.5 에러 처리

- ClickHouse 연결 실패 시 503 응답
- 잘못된 파라미터 시 400 응답 + 상세 메시지
- 시간 범위가 너무 넓을 경우 (예: 30일 이상) 제한 또는 경고

---

### 2.4 API 우선순위

| 순서 | API | 사유 |
|------|-----|------|
| 1 | API-02 시계열 집계 | 대시보드 핵심 차트 |
| 2 | API-01 요약 카드 | 대시보드 상단 |
| 3 | API-05 로그 목록 | 로그 조회 페이지 핵심 |
| 4 | API-03 느린 API | 대시보드 테이블 |
| 5 | API-04 최근 에러 | 대시보드 테이블 |
| 6 | API-06 로그 상세 | 로그 drill-down |
