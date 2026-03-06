# Lighthouse 알림 시스템 설계서

---

## 1. 개요

대시보드를 직접 확인하지 않아도 이상 상황을 감지하여 Slack으로 알림을 전송하는 시스템.
Spring Boot @Scheduled 기반으로 10분 주기로 ClickHouse를 조회하여 알림 조건을 판단한다.

---

## 2. 알림 규칙

### 2.1 에러율 급증

| 항목 | 값 |
|------|------|
| 판단 주기 | 10분 |
| 비교 구간 | 최근 10분 에러율 vs 직전 1시간 평균 에러율 |
| 트리거 조건 | 최근 10분 에러율이 직전 1시간 평균의 **3배 이상** |
| 최소 요청 수 | 최근 10분 요청이 **50건 이상**일 때만 판단 |
| 에러 기준 | http_status >= 400 |
| 쿨다운 | 10분 (동일 규칙 알림 재발송 방지) |
| 알림 레벨 | CRITICAL |

**판단 로직**:
```
최근 10분 요청 수 < 50 → 스킵 (데이터 부족)
직전 1시간 에러율 = 0% → 최근 10분 에러율 > 5%이면 트리거 (0 대비 N배 계산 불가하므로 절대값 폴백)
최근 10분 에러율 / 직전 1시간 에러율 >= 3.0 → 트리거
```

**ClickHouse 쿼리**:
```sql
-- 최근 10분 에러율
SELECT
    count(*) AS total,
    countIf(http_status >= 400) AS errors,
    errors / total AS error_rate
FROM app_logs
WHERE timestamp >= now() - INTERVAL 10 MINUTE

-- 직전 1시간 평균 에러율 (최근 10분 제외)
SELECT
    count(*) AS total,
    countIf(http_status >= 400) AS errors,
    errors / total AS error_rate
FROM app_logs
WHERE timestamp >= now() - INTERVAL 70 MINUTE
  AND timestamp < now() - INTERVAL 10 MINUTE
```

**Slack 메시지 예시**:
```
🚨 [CRITICAL] 에러율 급증 감지
서비스: theke-dicube-system
현재 에러율: 12.5% (최근 10분, 요청 320건 중 에러 40건)
평소 에러율: 3.2% (직전 1시간 평균)
배율: 3.9배
감지 시각: 2026-03-06 15:30:00 KST
```

---

### 2.2 응답 시간 급증

| 항목 | 값 |
|------|------|
| 판단 주기 | 10분 |
| 비교 구간 | 최근 10분 P95 응답 시간 |
| 트리거 조건 | P95 응답 시간 **3000ms 초과** |
| 최소 요청 수 | 최근 10분 요청이 **50건 이상**일 때만 판단 |
| 쿨다운 | 10분 |
| 알림 레벨 | WARNING |

**판단 로직**:
```
최근 10분 요청 수 < 50 → 스킵
최근 10분 P95 > 3000ms → 트리거
```

**ClickHouse 쿼리**:
```sql
SELECT
    count(*) AS total,
    quantile(0.95)(response_time_ms) AS p95,
    quantile(0.99)(response_time_ms) AS p99,
    avg(response_time_ms) AS avg_rt
FROM app_logs
WHERE timestamp >= now() - INTERVAL 10 MINUTE
```

**Slack 메시지 예시**:
```
⚠️ [WARNING] 응답 시간 급증 감지
서비스: theke-dicube-system
P95 응답 시간: 4,520ms (임계치: 3,000ms)
P99 응답 시간: 8,230ms
평균 응답 시간: 1,890ms
요청 수: 285건 (최근 10분)
감지 시각: 2026-03-06 15:30:00 KST
```

---

### 2.3 특정 API 연속 실패

| 항목 | 값 |
|------|------|
| 판단 주기 | 10분 |
| 트리거 조건 | 동일 엔드포인트(method + path)에서 최근 **5건이 연속으로 5xx** |
| 대상 | http_status >= 500인 로그가 존재하는 엔드포인트 |
| 쿨다운 | 10분 (동일 엔드포인트 기준) |
| 알림 레벨 | CRITICAL |

**판단 로직**:
```
1. 최근 30분 내 5xx가 1건 이상 발생한 엔드포인트 목록 조회
2. 각 엔드포인트별로 최근 5건의 로그를 시간 역순 조회
3. 5건 모두 http_status >= 500이면 트리거
4. 5건 중 정상 응답(200 등)이 하나라도 있으면 스킵
```

**ClickHouse 쿼리**:
```sql
-- 1단계: 최근 30분 내 5xx 발생 엔드포인트 식별
SELECT DISTINCT http_method, http_path
FROM app_logs
WHERE timestamp >= now() - INTERVAL 30 MINUTE
  AND http_status >= 500

-- 2단계: 해당 엔드포인트의 최근 5건 조회 (엔드포인트별 반복)
SELECT http_status
FROM app_logs
WHERE timestamp >= now() - INTERVAL 30 MINUTE
  AND http_method = {method}
  AND http_path = {path}
ORDER BY timestamp DESC
LIMIT 5
```

**Slack 메시지 예시**:
```
🚨 [CRITICAL] API 연속 실패 감지
서비스: theke-dicube-system
엔드포인트: POST /api/payments
연속 실패: 5건 (전부 5xx)
최근 에러:
  - 500 java.net.ConnectException (15:28:45)
  - 502 java.net.ConnectException (15:27:12)
  - 500 java.net.ConnectException (15:25:33)
  - 503 ResourceAccessException (15:24:01)
  - 500 java.net.ConnectException (15:22:18)
감지 시각: 2026-03-06 15:30:00 KST
```

---

## 3. 쿨다운 관리

### 3.1 쿨다운 저장소

- 인메모리 ConcurrentHashMap으로 관리
- 키: 규칙 유형 + 대상 (예: `ERROR_RATE:theke-dicube-system`, `API_FAILURE:POST:/api/payments`)
- 값: 마지막 알림 발송 시각
- 서버 재시작 시 쿨다운 초기화 (허용 가능한 수준)

### 3.2 쿨다운 로직

```
알림 조건 충족 시:
  1. 쿨다운 맵에서 해당 키의 마지막 발송 시각 조회
  2. 현재 시각 - 마지막 발송 시각 < 10분 → 알림 스킵
  3. 현재 시각 - 마지막 발송 시각 >= 10분 → 알림 발송 + 쿨다운 맵 갱신
```

### 3.3 복구 알림

- 이전 주기에서 알림이 발송된 규칙이 현재 주기에서 정상으로 돌아오면 복구 알림 발송
- 복구 알림은 쿨다운 적용하지 않음 (1회만 발송)

**복구 Slack 메시지 예시**:
```
✅ [RESOLVED] 에러율 정상 복귀
서비스: theke-dicube-system
현재 에러율: 2.1% (정상 범위)
장애 지속 시간: 약 20분 (15:10 ~ 15:30)
복구 시각: 2026-03-06 15:30:00 KST
```

---

## 4. Slack 연동

### 4.1 Webhook 설정

- Slack Incoming Webhook URL을 application.yml에서 관리
- 채널, 아이콘 등은 Webhook 설정에서 지정

```yaml
lighthouse:
  alert:
    enabled: true
    slack:
      webhook-url: https://hooks.slack.com/services/T.../B.../xxx
      channel: "#lighthouse-alerts"
    check-interval-ms: 600000  # 10분
    cooldown-ms: 600000        # 10분
    rules:
      error-rate:
        enabled: true
        threshold-multiplier: 3.0
        min-request-count: 50
        fallback-absolute-rate: 0.05
      response-time:
        enabled: true
        p95-threshold-ms: 3000
        min-request-count: 50
      api-failure:
        enabled: true
        consecutive-count: 5
```

### 4.2 메시지 포맷

- Slack Block Kit 활용하여 구조화된 메시지 전송
- 알림 레벨별 이모지: 🚨 CRITICAL, ⚠️ WARNING, ✅ RESOLVED
- 대시보드 링크 포함: 해당 시간대로 바로 이동할 수 있는 URL

---

## 5. 아키텍처

### 5.1 컴포넌트 구조

```
AlertScheduler (@Scheduled, 10분 주기)
  ├── ErrorRateAlertRule
  │     ├── ClickHouse 쿼리 실행
  │     ├── 조건 판단
  │     └── 결과 반환
  ├── ResponseTimeAlertRule
  │     ├── ClickHouse 쿼리 실행
  │     ├── 조건 판단
  │     └── 결과 반환
  ├── ApiFailureAlertRule
  │     ├── ClickHouse 쿼리 실행
  │     ├── 조건 판단
  │     └── 결과 반환
  ├── CooldownManager
  │     ├── 쿨다운 여부 확인
  │     └── 쿨다운 갱신
  └── SlackNotifier
        ├── 메시지 포맷팅
        └── Webhook 호출
```

### 5.2 클래스 설계

| 클래스 | 역할 |
|--------|------|
| AlertScheduler | @Scheduled로 10분 주기 실행, 각 Rule 호출 및 결과 처리 |
| AlertRule (인터페이스) | evaluate() → AlertResult 반환 |
| ErrorRateAlertRule | 에러율 급증 판단 로직 |
| ResponseTimeAlertRule | 응답 시간 급증 판단 로직 |
| ApiFailureAlertRule | API 연속 실패 판단 로직 |
| AlertResult | 알림 필요 여부, 레벨, 메시지 데이터 담는 VO |
| CooldownManager | 쿨다운 맵 관리, 발송 가능 여부 판단 |
| SlackNotifier | Slack Webhook 호출, Block Kit 메시지 생성 |
| AlertProperties | application.yml 바인딩 (@ConfigurationProperties) |

### 5.3 확장성

- AlertRule 인터페이스를 구현하면 새로운 알림 규칙 추가 가능
- 예: DLQ 적재량 알림, 파이프라인 지연 알림 등
- 알림 채널도 SlackNotifier 외에 EmailNotifier, WebhookNotifier 등 확장 가능

---

## 6. 알림 이력 저장 (선택)

- 발송된 알림을 ClickHouse 또는 RDB에 이력으로 저장
- 대시보드에서 알림 이력을 조회할 수 있는 화면 (2차)
- 저장 필드: 규칙 유형, 알림 레벨, 트리거 값, 발송 시각, 복구 시각

---

## 7. 구현 순서

| 순서 | 작업 | 설명 |
|------|------|------|
| 1 | AlertProperties | application.yml 설정 바인딩 |
| 2 | SlackNotifier | Slack Webhook 호출 + 메시지 포맷팅 |
| 3 | CooldownManager | 인메모리 쿨다운 관리 |
| 4 | AlertRule 인터페이스 | evaluate() 메서드 정의 |
| 5 | ErrorRateAlertRule | 에러율 급증 판단 + ClickHouse 쿼리 |
| 6 | ResponseTimeAlertRule | 응답 시간 급증 판단 + ClickHouse 쿼리 |
| 7 | ApiFailureAlertRule | API 연속 실패 판단 + ClickHouse 쿼리 |
| 8 | AlertScheduler | @Scheduled로 전체 흐름 조립 |
| 9 | 복구 알림 로직 | 이전 주기 상태 비교하여 복구 감지 |
| 10 | 테스트 | 더미 데이터로 각 규칙 트리거 확인 |

---

## 8. 검증 방법

- 에러율 급증: 더미 데이터로 특정 시간대에 에러를 집중 생성 → 알림 수신 확인
- 응답 시간: 더미 데이터에 response_time_ms 3000ms 이상 다수 생성 → 알림 수신 확인
- API 연속 실패: 특정 엔드포인트에 5xx 5건 연속 생성 → 알림 수신 확인
- 쿨다운: 조건 지속 시 10분 내 재발송 안 되는지 확인
- 복구: 조건 해소 후 복구 알림 수신 확인
