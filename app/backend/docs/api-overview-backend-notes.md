# Dashboard (Overview) API 백엔드 구현 노트

> 프론트엔드 명세(`app/frontend/docs/api-overview-dashboard.md`) 기준 구현 상태 정리.
> 기존 Dashboard API를 교체하여 `/api/dashboard/*` 경로를 그대로 사용.

---

## 구현 완료 API

| # | Method | URL | 설명 |
|---|--------|-----|------|
| 1 | GET | `/api/dashboard/summary` | 요약 지표 (요청 수, 에러 건수, 평균 응답 시간) |
| 2 | GET | `/api/dashboard/request-volume` | 시간대별 요청량 |
| 3 | GET | `/api/dashboard/response-time` | 시간대별 P95/P99 응답 시간 |
| 4 | GET | `/api/dashboard/slow-apis` | 응답 느린 TOP API |
| 5 | GET | `/api/dashboard/error-logs` | 최근 HTTP 에러 로그 (4xx/5xx) |

모든 API는 JWT 인증 필요 (`/api/**` → authenticated).

---

## 프론트 명세와 차이점

### 1. 응답 envelope

프론트 명세는 `{ "data": ... }` 형태를 기대하지만, 실제 응답은 `ApiResponse<T>` 래퍼:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-03-06T14:00:00"
}
```

`data` 안의 구조는 명세와 동일하므로 프론트에서 `response.data.data` 또는 인터셉터로 `data`를 꺼내 쓰면 됨.

### 2. 시간 형식

| 항목 | 프론트 명세 | 백엔드 실제 |
|------|-----------|------------|
| 요청 파라미터 | KST ISO-8601 (`+09:00`) | `LocalDateTime` ISO 파싱 (오프셋 없음 또는 있음 모두 수용) |
| 응답 시간 필드 | KST ISO-8601 문자열 | `LocalDateTime` (JSON 직렬화 시 `"2026-03-06T14:00:00"`) |

- 요청: 프론트에서 `2026-03-06T14:00:00+09:00` 형태로 보내면 Spring이 파싱.
  백엔드 내부에서 KST→UTC 변환 후 ClickHouse 조회, 응답은 KST로 변환하여 반환.
- 응답: ISO-8601 오프셋(`+09:00`)은 포함되지 않음. 프론트에서 KST로 간주하면 됨.

### 3. error-logs의 `id` 필드

- ClickHouse `app_logs` 테이블에 고유 ID 컬럼이 없음.
- 현재 구현: **UUID를 매 조회마다 랜덤 생성**하여 반환 (리스트 렌더링용 key로만 사용 가능).
- 동일 요청을 다시 호출하면 다른 ID가 나옴. 특정 로그를 ID로 재조회하는 용도로는 사용 불가.
- 안정적 ID가 필요하면 ClickHouse 테이블에 `id` 컬럼(UUID) 추가 필요.

### 4. error-logs의 `traceId` 필드

- ClickHouse `app_logs` 테이블에 `trace_id` 컬럼이 **존재하지 않음**.
- 현재 구현: 항상 `null` 반환 (`@JsonInclude(NON_NULL)`이므로 JSON에서 생략됨).
- 분산 추적 ID를 지원하려면:
  1. SDK에서 traceId를 로그에 포함
  2. Vector 파싱 설정에 traceId 필드 매핑 추가
  3. ClickHouse `app_logs` 테이블에 `trace_id String DEFAULT ''` 컬럼 추가 (새 마이그레이션)

### 5. error-logs의 에러 기준

| 항목 | 프론트 명세 | 백엔드 구현 |
|------|-----------|------------|
| 에러 정의 | HTTP 4xx + 5xx | `http_status >= 400` |
| 비 HTTP 에러 | 미언급 | 포함 안 됨 (http_status가 0이면 제외) |

로그 레벨 기반 에러(ERROR/FATAL)와 HTTP 상태 기반 에러는 다른 집합임. 이 API는 HTTP 상태 기반만 반환.

### 6. summary의 errorCount 기준

프론트 명세: "HTTP 4xx + 5xx 응답 건수" → 백엔드도 `http_status >= 400`으로 구현.

---

## 파일 목록

```
domain/dashboard/
├── controller/DashboardController.java
├── service/DashboardService.java
└── dto/
    ├── OverviewSummaryDto.java
    ├── RequestVolumeDto.java
    ├── ResponseTimeDto.java
    ├── SlowApiDto.java
    └── ErrorLogDto.java

domain/log/repository/
├── LogRepository.java          ← 메서드 5개 추가
└── row/
    ├── RequestVolumeRow.java    ← 신규
    ├── ResponseTimeRow.java     ← 신규
    └── ErrorLogRow.java         ← 신규
```
