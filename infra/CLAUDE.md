# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

`infra/`는 Lighthouse 로그 모니터링 플랫폼의 로컬 개발 인프라를 Docker Compose로 구성한다.

## 실행 명령어

```bash
cd infra
cp .env.example .env          # 최초 1회: LOG_SOURCE_PATH 설정
# .env 파일에서 LOG_SOURCE_PATH를 실제 로그 디렉토리로 수정
docker compose up -d           # 전체 기동
docker compose down            # 전체 중지
docker compose down -v         # 전체 중지 + 볼륨 삭제 (데이터 초기화)
docker compose logs -f vector  # 특정 서비스 로그 확인
```

## 서비스 구성 및 기동 순서

Kafka가 healthcheck를 통과한 후에 ClickHouse와 Vector가 시작된다.

| 서비스 | 이미지 | 포트 | 역할 |
|--------|--------|------|------|
| kafka | apache/kafka:3.7.0 (KRaft) | 9092 | 로그 메시지 버퍼. Docker 내부에서만 접근 가능 (`kafka:9092`) |
| clickhouse | clickhouse-server:24.8 | 8123 (HTTP), 9000 (native) | 로그 저장 + Kafka Engine으로 직접 소비 |
| vector | timberio/vector:0.38.0-alpine | — | 파일 감시 → 파싱 → Kafka 전송 |
| oracle | gvenzl/oracle-free:latest | 1521 | 사용자/앱 메타데이터 (Kafka 무관, 독립 기동) |

## 환경변수 (.env)

`.env` 파일은 git에서 제외된다 (`.gitignore`에 등록). `.env.example`을 복사하여 사용한다.

| 변수 | 용도 | 기본값 (미설정 시) |
|------|------|--------------------|
| `LOG_SOURCE_PATH` | Vector가 감시할 호스트 로그 디렉토리 | `./../logs` |

## 데이터 파이프라인 (SDK → Vector → Kafka → ClickHouse)

```
대상 앱 (SDK 적용 필수)
  → SDK(LogstashEncoder): 구조화 JSON 로그 파일 출력 ($LOG_SOURCE_PATH/{service}/app.log)
  → Vector: JSON 파싱 → 필드 매핑 + env 메타데이터 부착
  → Kafka 토픽: logs.app
  → ClickHouse: app_logs_kafka (Kafka Engine) → mv_app_logs (MV) → app_logs (MergeTree)
```

- Kafka 토픽은 `logs.app` 하나만 사용한다 (기존 `logs.raw` 토픽은 제거됨).
- Java에 Kafka Consumer가 없다. ClickHouse가 Kafka Engine 테이블로 직접 소비한다.
- ClickHouse 테이블/뷰 스키마는 백엔드의 `resources/db/clickhouse/V*.sql` 마이그레이션으로 관리된다 (이 디렉토리가 아닌 `app/backend/` 소관).

## Vector 파싱 로직 (vector/vector.yaml)

SDK(LogstashEncoder)가 남긴 JSON 한 줄을 전제로 동작한다. 비정형 텍스트 로그는 처리하지 않는다 (JSON 파싱 실패 시 drop).

`enrich` transform이 하는 일:
1. JSON 파싱 후 필드명 매핑 (`logger_name`→`logger`, `thread_name`→`thread`, `@timestamp`→`timestamp`)
2. MDC 문자열을 정수로 변환 (`http_status`, `response_time_ms`)
3. `env` 메타데이터 부착 (환경변수 `ENV`에서 읽음, 기본값 `local`)

출력 필드: `timestamp`, `host`, `service`, `env`, `level`, `logger`, `thread`, `message`, `http_method`, `http_path`, `http_status`, `response_time_ms`, `exception_class`, `stack_trace`, `raw_event`

**SDK가 제공하는 필드 (Vector가 파싱만 함):**
- `@timestamp` → `timestamp`: 로그 발생 시각 (SDK LogstashEncoder가 생성)
- `host`: 대상 서버 hostname (SDK가 `InetAddress.getLocalHost().getHostName()`으로 자동 설정)
- `service`: 앱 이름 (SDK가 `spring.application.name` 또는 `lighthouse.logging.service-name`으로 결정)
- `level`, `logger_name`, `thread_name`, `message`, `stack_trace`: LogstashEncoder 표준 필드
- `http_method`, `http_path`, `http_status`, `response_time_ms`, `exception_class`: MDC 필드 (SDK HttpLoggingFilter가 설정)

**Vector가 부착하는 필드:**
- `env`: 환경변수 `ENV`에서 읽음

**`raw_event`**: SDK JSON 원문을 그대로 보존. 디버깅용으로 유지하나, 저장 용량이 거의 2배가 되므로 향후 제거 대상.

## ClickHouse 최종 오브젝트

마이그레이션 V1~V4 적용 후 남아야 하는 오브젝트:

| 오브젝트 | 타입 | 용도 |
|----------|------|------|
| `schema_migrations` | Table (MergeTree) | 마이그레이션 이력 추적 |
| `app_logs` | Table (MergeTree) | 정규화된 로그 최종 저장소 |
| `app_logs_kafka` | Table (Kafka Engine) | `logs.app` 토픽에서 소비 |
| `mv_app_logs` | Materialized View | `app_logs_kafka` → `app_logs` 자동 적재 (`parseDateTimeBestEffort`로 ISO 8601 → DateTime64 변환) |

기존 `logs_raw`, `logs_raw_kafka`, `mv_logs_raw`는 V3에서 DROP됨.
기존 `ingest_time`/`ingest_time_utc` 컬럼은 V4에서 `timestamp`로 통합됨.

## 변경 시 주의사항

- **Vector 출력 필드를 변경하면** ClickHouse Kafka Engine 테이블 컬럼과 반드시 동기화해야 한다. 새 마이그레이션 SQL을 추가할 것.
- **Kafka 토픽명(`logs.app`)을 변경하면** ClickHouse Kafka Engine 설정도 함께 수정해야 한다.
- `docker-compose.yml`의 인증 정보(ClickHouse: `lighthouse/chpass`, Oracle: `lighthouse/lighthousepass`)는 백엔드 `application.yml`의 기본값과 일치해야 한다.
- **이미 적용된 마이그레이션(V1~V4)은 수정 금지.** 변경이 필요하면 새 버전(V5~)을 추가한다.
