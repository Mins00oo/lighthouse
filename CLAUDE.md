# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 프로젝트 맥락과 규칙을 제공합니다.

## 프로젝트 개요

Lighthouse는 **애플리케이션 로그 모니터링 플랫폼**이다. 분산 애플리케이션들의 로그를 실시간 수집하여 ClickHouse에 저장하고, 커스터마이저블 대시보드 UI로 시각화·검색·분석 기능을 제공한다. 모니터링 대상 앱의 로그 포맷 변경을 강제하지 않으며, 구조화 JSON과 일반 텍스트 로그를 모두 처리한다.

**모노레포** 구조로 다음 하위 프로젝트를 포함한다:

| 하위 프로젝트 | 경로 | 기술 스택 |
|-------------|------|----------|
| 백엔드 API | `app/backend/` | Spring Boot 4.0.3, Java 17, MyBatis, ClickHouse JDBC, JWT |
| 프론트엔드 UI | `app/frontend/` | React 19, MUI 7, Vite, SWR, Zustand, zod |
| SDK | `sdk/` | Spring Boot Starter (lighthouse-spring-boot-starter 1.0.0) |
| 인프라 | `infra/` | Docker Compose (Kafka, ClickHouse, Vector, Oracle) |

각 하위 프로젝트에 별도 `CLAUDE.md`가 있다. **변경 작업 전 해당 하위 프로젝트의 CLAUDE.md를 반드시 읽는다.**

## 데이터 파이프라인 아키텍처

```
대상 앱들 (SDK 적용 여부 무관)
  → 로그 파일 (/var/log/apps/*/app.log)
  → Vector (파일 감시 → 멀티라인 집계 → JSON/regex 파싱 → 필드 정규화)
  → Kafka (토픽: logs.raw, logs.app)
  → ClickHouse (Kafka Engine 테이블 + Materialized View 자동 적재)
  → Spring Boot 백엔드 (JdbcTemplate으로 ClickHouse 읽기 전용 조회)
  → React 프론트엔드 (SWR 폴링 + WebSocket STOMP)
```

**핵심 설계 결정:** Java에 Kafka Consumer가 없다. ClickHouse의 Kafka Engine 테이블이 Materialized View를 통해 Kafka 토픽에서 직접 소비·적재한다. 백엔드는 ClickHouse를 읽기 전용으로만 조회한다.

## 이중 DB 설계

- **Oracle** — 사용자 계정(`lh_user`)과 애플리케이션 레지스트리(`lh_application`)의 원장(Source of Truth). MyBatis로 접근. Flyway 마이그레이션(`resources/db/migration/`).
- **ClickHouse** — 로그 저장(`app_logs`, `logs_raw`) 및 실시간 분석. `@Qualifier("clickHouseJdbcTemplate")` JdbcTemplate으로 접근. 커스텀 `ClickHouseMigrationRunner`로 마이그레이션(`resources/db/clickhouse/`).

**크로스 DB 트랜잭션 금지.** Oracle 쓰기와 ClickHouse 조회를 하나의 트랜잭션 경계 안에 섞지 않는다.

## 인프라 (docker-compose)

```bash
cd infra
docker compose up -d    # Kafka, ClickHouse, Vector, Oracle 기동
```

| 서비스 | 포트 | 용도 |
|--------|------|------|
| Kafka (KRaft) | 9092 | 로그 메시지 버퍼 |
| ClickHouse | 8123 (HTTP), 9000 (native) | 로그 저장 + 분석 엔진 |
| Vector | — | 파일 → 파싱 → Kafka 전송 에이전트 |
| Oracle | 1521 | 사용자/앱 메타데이터 |

## 빌드 & 실행 명령어

### 백엔드 (`app/backend/`)
```bash
./gradlew build          # 빌드 + 테스트
./gradlew bootRun        # 애플리케이션 실행
./gradlew test           # 전체 테스트
./gradlew test --tests "com.app.lighthouse.SomeTest"           # 특정 테스트 클래스
./gradlew test --tests "com.app.lighthouse.SomeTest.methodName" # 특정 테스트 메서드
./gradlew clean build    # 클린 빌드
```

### 프론트엔드 (`app/frontend/`)
```bash
npm install              # 의존성 설치
npm run dev              # 개발 서버 (Vite)
npm run build            # 프로덕션 빌드 (필수 검증 단계)
npm run lint             # ESLint (필수 검증 단계)
npm run lint:fix         # 린트 자동 수정
npm run fm:fix           # Prettier 포맷팅
```

### SDK (`sdk/lighthouse-sdk/`)
```bash
./gradlew build                # 빌드
./gradlew publishToMavenLocal  # mavenLocal에 퍼블리시
```
대상 앱에서 추가: `implementation 'com.lighthouse:lighthouse-spring-boot-starter:1.0.0'`

## 로그 수집: 두 가지 경로

Vector의 `parse_and_enrich` transform이 두 경로를 모두 처리한다:

1. **경로 1 (JSON — 권장):** 앱이 구조화 JSON을 출력 (SDK 또는 logstash-logback-encoder 사용). 모든 필드 채워짐: level, logger, http_method, http_path, http_status, response_time_ms, exception_class, stack_trace.
2. **경로 2 (텍스트):** 앱의 기존 로그 포맷 유지. Vector가 regex 파싱 시도 (Spring Boot 기본 포맷 → 일반 레벨 추출). HTTP 필드는 메시지에 패턴이 있을 때만 추출.

두 경로 모두 동일한 `app_logs` ClickHouse 테이블에 적재된다. 누락 필드는 빈 문자열 또는 0으로 기본값 저장.

## 구현 현황

| 기능 | 상태 |
|------|------|
| 로그 수집 파이프라인 (Vector → Kafka → ClickHouse) | 완료 |
| 대시보드 API (summary, log-volume, server-status 등) | 완료 |
| 로그 검색 API | 완료 |
| 애플리케이션 자동 발견 (5분 스케줄러) | 완료 |
| JWT 인증 (로그인/리프레시) | 완료 |
| 커스텀 대시보드 UI (드래그&드롭 위젯) | 완료 |
| 고정 모니터링 대시보드 | 완료 |
| WebSocket 실시간 푸시 (트리거 로직) | 미구현 |
| 알림 규칙/알림 시스템 | 미구현 (향후 예정) |
| 프론트엔드 템플릿 잔존 코드 정리 (Minimals) | 미정리 |

## 커밋 컨벤션

```
<type>(<scope>): <subject>

<body>
```

type 목록: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 주요 환경변수

| 변수 | 기본값 | 용도 |
|------|--------|------|
| `ORACLE_HOST/PORT/SID` | `localhost:1521/FREEPDB1` | Oracle 접속 |
| `ORACLE_USERNAME/PASSWORD` | `lighthouse/lighthousepass` | Oracle 인증 |
| `CLICKHOUSE_HOST/PORT` | `localhost:8123` | ClickHouse 접속 |
| `CLICKHOUSE_USERNAME/PASSWORD` | `lighthouse/chpass` | ClickHouse 인증 |
| `JWT_SECRET` | 하드코딩된 개발용 값 | JWT 서명 키 |
| `INIT_ADMIN_ENABLED` | `true` | 부팅 시 관리자 계정 생성 여부 |
| `CORS_ORIGINS` | `localhost:3000,localhost:3030` | 허용 CORS 출처 |
