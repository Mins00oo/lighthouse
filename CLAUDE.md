# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 프로젝트 맥락과 규칙을 제공합니다.

## 프로젝트 개요

Lighthouse는 **애플리케이션 로그 모니터링 플랫폼**이다. 분산 애플리케이션들의 로그를 실시간 수집하여 ClickHouse에 저장하고, 커스터마이저블 대시보드 UI로 시각화·검색·분석 기능을 제공한다.

**모노레포** 구조로 다음 하위 프로젝트를 포함한다:

| 하위 프로젝트 | 경로 | 기술 스택 |
|-------------|------|----------|
| 백엔드 API | `app/backend/` | Spring Boot 4.0.3, Java 17, MyBatis, ClickHouse JDBC, JWT |
| 프론트엔드 UI | `app/frontend/` | React 19, MUI 7, Vite, SWR, Zustand, zod |
| SDK | `sdk/java/` | Spring Boot Starter (lighthouse-spring-boot-starter 1.0.0) |
| 인프라 | `infra/` | Docker Compose (Kafka, ClickHouse, Vector, Oracle) |

각 하위 프로젝트에 별도 `CLAUDE.md`가 있다. **변경 작업 전 해당 하위 프로젝트의 CLAUDE.md를 반드시 읽는다.**

## 데이터 파이프라인 아키텍처

```
대상 앱 (SDK 적용 필수)
  → SDK(LogstashEncoder): 구조화 JSON 로그 파일 출력 ({log.dir}/{service}/app.log)
  → Vector (파일 감시 → JSON 파싱 → 필드 매핑 + env 부착)
  → Kafka (토픽: logs.app)
  → ClickHouse (Kafka Engine 테이블 + Materialized View 자동 적재)
  → Spring Boot 백엔드 (JdbcTemplate으로 ClickHouse 읽기 전용 조회)
  → React 프론트엔드 (SWR 폴링 + WebSocket STOMP)
```

**핵심 설계 결정:** Java에 Kafka Consumer가 없다. ClickHouse의 Kafka Engine 테이블이 Materialized View를 통해 Kafka 토픽에서 직접 소비·적재한다. 백엔드는 ClickHouse를 읽기 전용으로만 조회한다.

## 이중 DB 설계

- **Oracle** — 사용자 계정(`lh_user`)과 애플리케이션 레지스트리(`lh_application`)의 원장(Source of Truth). MyBatis로 접근. Flyway 마이그레이션(`resources/db/migration/`).
- **ClickHouse** — 로그 저장(`app_logs`) 및 실시간 분석. `@Qualifier("clickHouseJdbcTemplate")` JdbcTemplate으로 접근. 커스텀 `ClickHouseMigrationRunner`로 마이그레이션(`resources/db/clickhouse/`).

**크로스 DB 트랜잭션 금지.** Oracle 쓰기와 ClickHouse 조회를 하나의 트랜잭션 경계 안에 섞지 않는다.

## 인프라 (docker-compose)

```bash
cd infra
cp .env.example .env    # 최초 1회: LOG_SOURCE_PATH 설정
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

### SDK (`sdk/java/`)
```bash
cd sdk/java
cp src/main/resources/sdk.properties.example src/main/resources/sdk.properties  # 최초 1회
# sdk.properties에서 log.dir 등 환경별 값 설정
./gradlew build                # 빌드
./gradlew publishToMavenLocal  # mavenLocal에 퍼블리시
```
대상 앱 `build.gradle`에 추가:
```groovy
repositories {
    mavenLocal()    // SDK 로컬 배포용
    mavenCentral()
}
dependencies {
    implementation 'com.lighthouse:lighthouse-spring-boot-starter:1.0.0'
}
```

## 로그 수집

모니터링 대상 앱은 반드시 **Lighthouse SDK**(lighthouse-spring-boot-starter)를 적용해야 한다. SDK의 LogstashEncoder가 구조화 JSON을 한 줄씩 파일로 남기고, Vector가 이를 파싱하여 Kafka로 전송한다. 비정형 텍스트 로그는 처리하지 않는다 (JSON 파싱 실패 시 drop).

**로그 경로 동기화:** SDK의 `sdk.properties`에서 설정한 `log.dir`과 인프라 `.env`의 `LOG_SOURCE_PATH`가 동일한 디렉토리를 가리켜야 한다.

## 구현 현황

| 기능 | 상태 |
|------|------|
| 로그 수집 파이프라인 (SDK → Vector → Kafka → ClickHouse) | 완료 |
| 대시보드 API (summary, log-volume, server-status 등) | 완료 |
| 로그 검색 API | 완료 |
| 애플리케이션 자동 발견 (5분 스케줄러) | 완료 |
| JWT 인증 (로그인/리프레시) | 완료 |
| 커스텀 대시보드 UI (드래그&드롭 위젯) | 완료 |
| 고정 모니터링 대시보드 | 완료 |
| WebSocket 실시간 푸시 (트리거 로직) | 미구현 |
| Slack 알림 시스템 (에러율/응답시간/API실패) | 완료 |
| 알림 이력 저장/조회 API | 미구현 (향후 예정) |
| 프론트엔드 템플릿 잔존 코드 정리 (Minimals) | 미정리 |

## 커밋 컨벤션

```
<type>(<scope>): <subject>

<body>
```

type 목록: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**커밋 범위 규칙:** 각 하위 프로젝트 작업 시 해당 프로젝트 파일만 커밋한다. 백엔드 작업에서 프론트엔드 파일을 함께 커밋하지 않고, 그 반대도 마찬가지다.

## 설정 파일 구조 (백엔드)

- `application.yml` — 비민감 설정만 포함 (드라이버, pool, 알림 임계값 등)
- `application-secrets.yml` — 민감정보 (DB 접속, JWT secret, 비밀번호, Slack webhook, CORS/WS origins). **`.gitignore` 등록됨.**
- `application-secrets.yml.example` — 팀원용 템플릿
- **`application.yml`에 크리덴셜이나 내부 IP를 직접 쓰지 않는다. 환경변수 기본값(`:` 뒤)에도 실제 값을 넣지 않는다.**

## 주요 환경변수

| 변수 | 용도 |
|------|------|
| `INIT_ADMIN_ENABLED` | 부팅 시 관리자 계정 생성 여부 |
| `ALERT_ENABLED` | 알림 시스템 활성화 여부 |
| `ALERT_CHECK_INTERVAL_MS` | 알림 체크 주기 (기본 10분) |

민감 값(DB 접속정보, JWT secret, Slack webhook URL, CORS origins 등)은 `application-secrets.yml`에서 관리한다.
