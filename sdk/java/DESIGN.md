# Lighthouse Spring Boot Starter SDK - 설계 문서

## Context
현재 대상 앱이 Lighthouse 로깅을 적용하려면 `logback-lighthouse.xml` 복사 + `LighthouseHttpLoggingFilter.java` 복사 + 의존성 추가 등 수작업이 많다. 이를 **`build.gradle`에 한 줄 추가**만으로 자동 적용되는 Spring Boot Starter SDK로 대체한다. 기존 `lighthouse-config/` 폴더는 폐기 대상.

## 핵심 설계 결정

### 1. Logback Appender를 프로그래밍 방식으로 추가
- XML fragment 방식은 대상 앱의 기존 `logback-spring.xml`과 충돌 가능
- `SmartLifecycle` 빈에서 Logback `LoggerContext`에 `RollingFileAppender` + `LogstashEncoder`를 직접 부착
- 기존 콘솔 로깅은 그대로 유지, JSON 파일 appender만 추가

### 2. 파일 출력 → Vector 수집
- SDK는 파일로만 출력 (HTTP/Kafka 전송 없음)
- Vector가 해당 파일을 수집하여 Kafka로 전송

### 3. 서비스 식별
- `spring.application.name` → `lighthouse.logging.service-name` → Main 클래스명 순서로 폴백
- 로그 JSON에 `service` 필드로 포함 (LogstashEncoder customFields)
- 이 값은 Vector에서 Kafka 파티셔닝, ClickHouse 쿼리 필터링에 핵심

### 4. 예외 정보 캡처
- 필터에서 예외 발생 시 `exception_class` MDC 필드에 예외 클래스명 기록
- `chain.doFilter()` catch 블록에서 예외를 잡아 MDC에 기록 후 재throw
- LogstashEncoder가 stack_trace는 자동으로 포함 (throwable 필드)

## 프로젝트 구조

```
lighthouse-sdk/
├── build.gradle
├── settings.gradle
├── DESIGN.md                    # 이 문서
├── gradlew / gradlew.bat / gradle/wrapper/
└── src/main/
    ├── java/com/lighthouse/sdk/
    │   ├── LighthouseLoggingAutoConfiguration.java    # @AutoConfiguration 진입점
    │   ├── LighthouseLoggingProperties.java           # lighthouse.logging.* 설정
    │   ├── LighthouseLogbackAppenderInitializer.java   # 프로그래밍 방식 appender 등록
    │   └── LighthouseHttpLoggingFilter.java           # HTTP 요청 MDC 필터 + 예외 캡처
    └── resources/META-INF/spring/
        └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

## 구현 파일 상세

### `build.gradle`
- `java-library` + `maven-publish` 플러그인 (bootJar 아님, 일반 라이브러리)
- Spring Boot 의존성은 `compileOnly` (버전 충돌 방지)
- `logstash-logback-encoder:8.0`은 `api` 스코프 (런타임 필요)
- group: `com.lighthouse`, artifact: `lighthouse-spring-boot-starter`
- 배포: 우선 `mavenLocal`, 이후 GitHub Packages로 이전

### `LighthouseLoggingProperties.java`
| 프로퍼티 | 기본값 | 설명 |
|---------|-------|------|
| `enabled` | `true` | 킬스위치 |
| `service-name` | `${spring.application.name:}` (빈 값이면 Main 클래스명) | 서비스 식별자 |
| `log-dir` | `/var/log/lighthouse/` | 로그 디렉토리 (하위에 service-name 폴더 자동 생성) |
| `file-name` | `app.log` | 로그 파일명 |
| `max-file-size` | `100MB` | 롤링 파일 크기 |
| `max-history` | `7` | 보관 일수 |
| `total-size-cap` | `1GB` | 전체 크기 제한 |
| `http-filter-enabled` | `true` | HTTP 필터 on/off |
| `exclude-paths` | `/css/,/js/,/favicon,/actuator,/swagger-ui,/v3/api-docs` | 필터 제외 경로 |

### `LighthouseLogbackAppenderInitializer.java`
- `SmartLifecycle` 구현 → Spring 컨텍스트 시작 시 실행
- **서비스명 결정 로직**: `properties.serviceName` → `spring.application.name` → Main 클래스 `getSimpleName()` → `"unknown-app"`
- `LoggerContext`에서 root logger를 가져와 `RollingFileAppender` 부착
- `LogstashEncoder` 설정: `@timestamp`, `level`, `logger_name`, `thread_name`, `message` + MDC 필드
- MDC 포함 키: `service`, `http_method`, `http_path`, `http_status`, `response_time_ms`, `client_ip`, `exception_class`
- 서비스명은 `LogstashEncoder`의 customFields로 고정 주입: `{"service":"order-service"}`
- `SizeAndTimeBasedRollingPolicy`로 롤링 관리
- 로그 경로: `{logDir}/{serviceName}/app.log`
- 멱등성: appender 이름 `LIGHTHOUSE_JSON_FILE`으로 중복 방지

### `LighthouseHttpLoggingFilter.java`
- `OncePerRequestFilter` 확장
- **MDC 타이밍 전략**:
  - `chain.doFilter()` **전**: `http_method`, `http_path`, `client_ip` → 컨트롤러 내부 로그에도 포함
  - `chain.doFilter()` **후 finally**: `http_status`, `response_time_ms` 추가 세팅 + **요약 로그 출력** + `MDC.clear()`
- **예외 캡처**: catch에서 `exception_class` MDC 세팅 후 재throw
- **핵심 로직 흐름**:
  ```java
  // 필터 내 로거 선언
  private static final Logger accessLog = LoggerFactory.getLogger("lighthouse_access");

  // doFilterInternal
  String method = request.getMethod();
  String path = request.getRequestURI();
  String clientIp = resolveClientIp(request);

  // 1) chain.doFilter() 전: 컨트롤러 로그에도 포함될 MDC
  MDC.put("http_method", method);
  MDC.put("http_path", path);
  MDC.put("client_ip", clientIp);

  long start = System.currentTimeMillis();
  try {
      chain.doFilter(request, response);
  } catch (Exception e) {
      MDC.put("exception_class", e.getClass().getName());
      throw e;
  } finally {
      long duration = System.currentTimeMillis() - start;
      MDC.put("http_status", String.valueOf(response.getStatus()));
      MDC.put("response_time_ms", String.valueOf(duration));
      accessLog.info("{} {} {} {}ms", method, path, response.getStatus(), duration);
      MDC.clear();
  }
  ```
- `X-Forwarded-For` 헤더로 클라이언트 IP 해석
- 설정된 `excludePaths`에 해당하면 스킵

### `LighthouseLoggingAutoConfiguration.java`
- `@AutoConfiguration` + `@ConditionalOnClass("ch.qos.logback.classic.LoggerContext")`
- `@ConditionalOnProperty(matchIfMissing = true)` → 무설정으로 동작
- HTTP 필터는 `@ConditionalOnWebApplication(SERVLET)` 조건부 등록

### Auto-configuration 등록
`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`에 한 줄 등록:
```
com.lighthouse.sdk.LighthouseLoggingAutoConfiguration
```

## 대상 앱 사용법

```groovy
// build.gradle에 이것만 추가
implementation 'com.lighthouse:lighthouse-spring-boot-starter:1.0.0'
```

설정 오버라이드 (선택):
```yaml
spring:
  application:
    name: order-service  # 이것만 있으면 서비스 식별 자동

# 필요 시 추가 커스터마이징
lighthouse:
  logging:
    log-dir: /custom/log/path
```

## 출력 JSON 예시

### 1) 필터 요약 로그 (finally에서 출력, logger: lighthouse_access)
```json
{
  "@timestamp": "2026-03-05T10:30:45.123+09:00",
  "level": "INFO",
  "logger_name": "lighthouse_access",
  "thread_name": "http-nio-8080-exec-5",
  "message": "GET /api/orders 200 45ms",
  "service": "order-service",
  "http_method": "GET",
  "http_path": "/api/orders",
  "http_status": "200",
  "response_time_ms": "45",
  "client_ip": "192.168.1.100"
}
```

### 2) 컨트롤러/서비스 내부 로그 (개발자가 찍은 로그)
```json
{
  "@timestamp": "2026-03-05T10:30:45.100+09:00",
  "level": "INFO",
  "logger_name": "com.example.OrderController",
  "thread_name": "http-nio-8080-exec-5",
  "message": "주문 조회 완료: orderId=123",
  "service": "order-service",
  "http_method": "GET",
  "http_path": "/api/orders",
  "client_ip": "192.168.1.100"
}
```

### 3) 예외 발생 시
```json
{
  "@timestamp": "2026-03-05T10:30:45.123+09:00",
  "level": "INFO",
  "logger_name": "lighthouse_access",
  "thread_name": "http-nio-8080-exec-5",
  "message": "POST /api/orders 500 120ms",
  "service": "order-service",
  "http_method": "POST",
  "http_path": "/api/orders",
  "http_status": "500",
  "response_time_ms": "120",
  "client_ip": "192.168.1.100",
  "exception_class": "java.lang.NullPointerException"
}
```

## Vector 설정 변경 사항
- Vector의 `sources.app_log.include` 경로를 `/var/log/lighthouse/*/app.log`로 변경 (와일드카드로 전체 서비스 수집)
- MDC 값이 문자열이므로 `http_status`, `response_time_ms`는 Vector VRL에서 `to_int!()` 처리
- `service` 필드는 SDK가 JSON에 직접 포함하므로 Vector에서 별도 추출 불필요

## 구현 순서
1. `lighthouse-sdk/` 디렉토리 생성 + Gradle wrapper 복사
2. `settings.gradle`, `build.gradle` 작성
3. `LighthouseLoggingProperties.java` 구현
4. `LighthouseLogbackAppenderInitializer.java` 구현
5. `LighthouseHttpLoggingFilter.java` 구현
6. `LighthouseLoggingAutoConfiguration.java` 구현
7. `AutoConfiguration.imports` 파일 생성
8. `./gradlew build`로 빌드 검증

## 검증 방법
- `./gradlew build` 성공 확인
- `./gradlew publishToMavenLocal` 후 별도 Spring Boot 앱에서 의존성 추가하여 로그 파일 생성 확인
- 로그 파일의 JSON에 `service` 필드 포함 확인
- 500 에러 발생 시 `exception_class` 필드에 예외 클래스명 포함 확인
