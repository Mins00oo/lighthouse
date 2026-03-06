# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 따라야 할 규칙과 프로젝트 맥락을 제공합니다.

## 0. 프로젝트 개요

Lighthouse_BE는 **로그 모니터링 플랫폼 백엔드**입니다. Spring Boot 4.0.3 / Java 17 기반이며, Kafka로 유입된 로그를 ClickHouse에 적재하고 로그 검색/대시보드/애플리케이션 관리용 REST API를 제공합니다. 사용자/애플리케이션 메타데이터는 Oracle에 저장합니다.

## 1. 절대 규칙 (Non-Negotiables)

### 1.1 변경 범위/스타일
- 요청받은 범위 내에서 **최소 변경**을 우선한다. 불필요한 대규모 리팩토링 금지.
- 기존 아키텍처 경계를 유지한다: **controller → service → repository**, 도메인 단위 패키지 구조 준수.
- 명시적 요구 없이 **새 프레임워크/라이브러리 추가 금지**.
- DTO/예외/응답 처리 등은 기존 패턴을 그대로 따른다.

### 1.2 API 규약
- 모든 REST 응답은 반드시 `ApiResponse<T>`(`global/response/ApiResponse.java`)로 감싼다.
- 기존 엔드포인트의 응답 스키마(필드/형태)를 임의로 변경하지 않는다(명시적 요구가 있을 때만).
- 신규 엔드포인트는 `/api/**` 하위 규칙과 기존 네이밍 컨벤션을 따른다.

### 1.3 예외/에러 처리
- 예외 → 응답 매핑은 `GlobalExceptionHandler`(`global/exception/`)에서 일관되게 처리한다.
- 의미 없는 `RuntimeException` 남발 금지. 가능한 한 **도메인 의미가 있는 예외**를 사용한다.
- 사용자 메시지에는 민감정보(토큰/비밀번호/내부 스택/원문 SQL)를 포함하지 않는다.

### 1.4 데이터 접근/트랜잭션 (Oracle + ClickHouse)
- Oracle은 사용자/앱 메타의 **원장(Source of Truth)** 이다. 접근은 `infra/oracle/`의 MyBatis를 사용한다.
- ClickHouse는 로그/분석 조회용이다. 접근은 `JdbcTemplate` 기반(repository)으로 수행한다.
- **크로스 DB 트랜잭션을 시도하지 않는다.** (Oracle write + ClickHouse query를 하나의 트랜잭션처럼 묶지 말 것)
- Oracle 쓰기 작업은 필요 시 `@Transactional`로 묶되, 그 트랜잭션 경계 안에 ClickHouse 접근을 섞지 않는다.

### 1.5 마이그레이션 규칙
- Oracle 스키마 변경: Flyway 스크립트는 `resources/db/migration/`에 추가(버전 관리, forward-only).
- ClickHouse 스키마 변경: `resources/db/clickhouse/`에 스크립트 추가, `ClickHouseMigrationRunner`로 실행.
- 이미 적용된 마이그레이션 파일은 수정하지 않는다. 변경이 필요하면 **새 마이그레이션을 추가**한다.

### 1.6 보안
- Public endpoint는 제한적으로만 허용한다: `/api/auth/**`, `/ws/**`, `/swagger-ui/**`, `/v3/api-docs/**`.
- 신규 엔드포인트는 **공개/보호 여부를 명시**하고, Security 설정에 반영한다.
- JWT secret/토큰/크리덴셜을 로그로 남기지 않는다.

## 2. 빌드 & 실행 명령어

```bash
./gradlew build          # 빌드 + 테스트
./gradlew bootRun        # 애플리케이션 실행
./gradlew test           # 전체 테스트 실행
./gradlew test --tests "com.app.lighthouse.SomeTest"                 # 특정 테스트 클래스
./gradlew test --tests "com.app.lighthouse.SomeTest.methodName"      # 특정 테스트 메서드
./gradlew clean build    # 클린 빌드
```

## 3. 아키텍처

### 3.1 이중 DB 구조 (Dual-Database Design)
- Oracle(Primary): 사용자(lh_user), 애플리케이션 레지스트리(lh_application)
	- 접근: infra/oracle/의 MyBatis mapper
	- 마이그레이션: Flyway (resources/db/migration/)
- ClickHouse(Secondary): 로그 저장(logs_raw, app_logs) + Kafka 엔진 테이블로 ingest
	- 접근: domain/log/repository/에서 @Qualifier("clickHouseJdbcTemplate") JdbcTemplate 사용
	- 마이그레이션: Flyway 미지원 → 커스텀 ClickHouseMigrationRunner + 스크립트(resources/db/clickhouse/)
두 데이터소스 모두 HikariCP 사용. Oracle SqlSessionFactory는 Flyway 완료 후 생성되며, ClickHouse JdbcTemplate은 custom migration runner 완료 후 사용되도록 구성되어 있다.

### 3.2 패키지 구조 
```
com.app.lighthouse
├── domain/          # 도메인(컨텍스트) 단위 비즈니스 로직
│   ├── auth/        # JWT 로그인/리프레시 (POST /api/auth/login, /api/auth/refresh)
│   ├── application/ # 모니터링 앱 CRUD + ClickHouse 기반 자동 동기화
│   ├── dashboard/   # 집계 지표 (GET /api/dashboard/*)
│   └── log/         # 로그 검색/타임라인 (GET /api/logs, /api/logs/timeline)
├── global/          # 공통: 보안/예외/응답 래퍼 등
│   ├── config/      # SecurityConfig, WebSocketConfig, datasource configs, FlywayConfig, OpenApiConfig
│   ├── exception/   # GlobalExceptionHandler (@RestControllerAdvice)
│   ├── init/        # AdminAccountInitializer (부팅 시 관리자 계정 생성)
│   └── response/    # ApiResponse<T> — {success, data, message, timestamp}
└── infra/           # 인프라 어댑터
    ├── oracle/      # MyBatis mapper + record types
    ├── security/    # JwtTokenProvider, JwtAuthenticationFilter, JwtProperties
    └── websocket/   # DashboardNotificationService (STOMP → /topic/dashboard)
```

## 3.3 핵심 패턴 (Key Patterns)
- 도메인 레이어는 controller → service → repository 흐름을 따른다. 각 도메인은 자체 DTO를 가진다.
- 모든 API 응답은 `ApiResponse<T>`로 통일한다. (`global/response/ApiResponse.java`)
- MyBatis XML mapper는 `resources/mapper/oracle/`에 위치하며 `mapUnderscoreToCamelCase`가 활성화되어 있다.
- ClickHouse 쿼리는 `JdbcTemplate` 기반으로 raw SQL을 수행한다. (`domain/log/repository/`)

## 4. 인증 (Authentication)
- Stateless JWT (HS256, JJWT 0.12.5).
- 토큰에는 `type` claim (`ACCESS`/`REFRESH`)를 포함해 refresh 토큰이 API 토큰으로 오용되지 않도록 한다.
- Public endpoint:
  - `/api/auth/**`
  - `/ws/**`
  - `/swagger-ui/**`
  - `/v3/api-docs/**`

## 5. 스케줄러 (Scheduler)
- `ApplicationSyncScheduler`는 **5분마다** 실행된다.
- 동작:
  - ClickHouse에서 최근 24시간 내 활성 서비스(애플리케이션) 목록을 조회한다.
  - 신규로 발견된 서비스가 있으면 Oracle의 `lh_application`에 자동 등록한다.

## 6. WebSocket
- SockJS 기반 STOMP 엔드포인트: `/ws`
- 대시보드 업데이트 브로드캐스트:
  - `/topic/dashboard`
  - `/topic/dashboard/alerts`

## 7. 설정 (Configuration)
- 단일 `application.yml`을 사용하며, 프로파일별 파일을 분리하지 않는다.
- 주요 환경변수:

| Variable | Purpose | Default |
|---|---|---|
| `ORACLE_HOST`, `ORACLE_PORT`, `ORACLE_SID` | Oracle connection | `localhost:1521/FREEPDB1` |
| `ORACLE_USERNAME`, `ORACLE_PASSWORD` | Oracle credentials | `lighthouse` / `lighthousepass` |
| `CLICKHOUSE_HOST`, `CLICKHOUSE_PORT` | ClickHouse connection | `localhost:8123` |
| `CLICKHOUSE_USERNAME`, `CLICKHOUSE_PASSWORD` | ClickHouse credentials | `lighthouse` / `chpass` |
| `JWT_SECRET` | JWT signing key | hardcoded dev value |
| `INIT_ADMIN_ENABLED` | Create admin on startup | `true` |

## 8. API Documentation
- Swagger UI: `/swagger-ui.html` (SpringDoc OpenAPI 3.0.1)
- OpenAPI JSON: `/v3/api-docs`

## 9. Claude Output Expectations (응답 형식)
- 먼저 3~6줄 요약: 무엇을/어디를/왜 바꿨는지
- 그 다음 체크리스트: 리스크, 테스트/검증 방법, 다음 단계
- 확실하지 않은 내용은 추측하지 말고 “근거/가정”을 명시한다.

## 10. 커밋 컨벤션
- 아래 형식을 지킨다.
  <type>(<scope>): <subject>

  <body>

- type 목록
  - feat: 새로운 기능 추가
  - fix: 버그 수정
  - docs: 문서 수정
  - style: 코드 포맷팅 (코드 변경 없음)
  - refactor: 리팩토링
  - test: 테스트 코드 추가/수정
  - chore: 빌드 업무, 패키지 매니저 설정 등
- body: 상세 설명 (72자 이내 줄바꿈)