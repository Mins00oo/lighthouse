# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

`sdk/java/`는 Lighthouse 로그 모니터링 플랫폼의 **Java SDK** (`lighthouse-spring-boot-starter`)이다. 모니터링 대상 Spring Boot 앱에 의존성을 추가하면, 자동으로 구조화 JSON 로그 파일을 생성한다.

## 빌드 & 배포

```bash
cd sdk/java
./gradlew build                # 빌드
./gradlew publishToMavenLocal  # ~/.m2/repository에 퍼블리시
```

대상 앱 `build.gradle`에 추가:
```groovy
repositories {
    mavenLocal()
    mavenCentral()
}
dependencies {
    implementation 'com.lighthouse:lighthouse-spring-boot-starter:1.0.0'
}
```

SDK 자체가 실행되는 것이 아니라, 대상 앱이 시작될 때 AutoConfiguration으로 자동 활성화된다.

## 동작 원리

`LighthouseLoggingAutoConfiguration` (Spring Boot AutoConfiguration):
1. Logback이 존재하면 자동 활성화 (`@ConditionalOnClass("ch.qos.logback.classic.LoggerContext")`)
2. `LighthouseLogbackAppenderInitializer` (SmartLifecycle): `lighthouse_access` 로거에 `RollingFileAppender` + `LogstashEncoder` 부착 (additive=false, 파일에는 HTTP access 로그만 기록)
3. `LighthouseHttpLoggingFilter` (서블릿 앱일 때): HTTP 요청/응답 정보를 MDC에 설정

## 로그 출력 필드

LogstashEncoder가 생성하는 JSON 필드:

| 필드 | 출처 | 설명 |
|------|------|------|
| `@timestamp` | LogstashEncoder | 로그 발생 시각 (ISO 8601) |
| `level` | LogstashEncoder | 로그 레벨 |
| `logger_name` | LogstashEncoder | 로거 이름 |
| `thread_name` | LogstashEncoder | 스레드 이름 |
| `message` | LogstashEncoder | 로그 메시지 |
| `stack_trace` | LogstashEncoder | 예외 스택트레이스 |
| `service` | customFields | `spring.application.name` 또는 `lighthouse.logging.service-name` |
| `host` | customFields | `InetAddress.getLocalHost().getHostName()` |
| `http_method` | MDC (Filter) | HTTP 메서드 |
| `http_path` | MDC (Filter) | 요청 경로 |
| `http_status` | MDC (Filter) | 응답 상태 코드 |
| `response_time_ms` | MDC (Filter) | 응답 시간 (ms) |
| `client_ip` | MDC (Filter) | 클라이언트 IP |
| `exception_class` | MDC (Filter) | 예외 클래스명 |

## 설정

### 로그 디렉토리 결정 순서
1. 대상 앱의 `application.yml`에 `lighthouse.logging.log-dir` 명시
2. SDK classpath의 `sdk.properties` 파일에서 `log.dir` 읽기
3. 기본값: `/var/log/apps`

### sdk.properties (SDK 내부, gitignored)
```properties
log.dir=D:/work/logs
```
최초 설정: `cp src/main/resources/sdk.properties.example src/main/resources/sdk.properties`

### LighthouseLoggingProperties 주요 속성
| 속성 | 기본값 | 설명 |
|------|--------|------|
| `lighthouse.logging.enabled` | `true` | SDK 활성화 여부 |
| `lighthouse.logging.service-name` | (자동 감지) | 서비스 이름 |
| `lighthouse.logging.log-dir` | (null → sdk.properties → /var/log/apps) | 로그 디렉토리 |
| `lighthouse.logging.file-name` | `app.log` | 로그 파일명 |
| `lighthouse.logging.max-file-size` | `100MB` | 롤링 파일 최대 크기 |
| `lighthouse.logging.max-history` | `7` | 롤링 파일 보관 일수 |
| `lighthouse.logging.total-size-cap` | `1GB` | 전체 로그 용량 제한 |

### 서비스 이름 결정 순서
1. `lighthouse.logging.service-name` 명시
2. `spring.application.name`
3. 메인 클래스 이름
4. `unknown-app`

## 로그 파일 경로

`{log-dir}/{service-name}/{file-name}` (예: `D:/work/logs/my-app/app.log`)

서비스별 하위 디렉토리는 자동 생성된다. 이 경로는 인프라의 `LOG_SOURCE_PATH`와 동일한 루트를 가리켜야 Vector가 파일을 감시할 수 있다.

## 변경 시 주의사항

- SDK를 수정하면 반드시 `./gradlew publishToMavenLocal`로 재배포해야 대상 앱에 반영된다.
- 출력 JSON 필드를 변경하면 Vector의 `vector.yaml` 파싱 로직과 ClickHouse 스키마도 함께 수정해야 한다.
- `sdk.properties`와 `lighthouse.yml`은 gitignored. 커밋되는 것은 `.example` 파일뿐이다.
