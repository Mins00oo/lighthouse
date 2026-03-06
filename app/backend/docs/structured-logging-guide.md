# Lighthouse 로그 수집 아키텍처

## 핵심 설계 원칙

**앱이 구조화 로깅을 하든 안 하든, Lighthouse는 동작합니다.**

Vector가 중간 파싱 레이어 역할을 하여 두 가지 경로를 모두 지원합니다:

```
[경로 1] 앱이 JSON 구조화 로그 출력 가능한 경우
  App → JSON stdout → Vector(필드 매핑) → Kafka → ClickHouse(app_logs)
  결과: 모든 컬럼 풍부하게 채워짐, 최고 품질

[경로 2] 앱의 로그 포맷을 바꿀 수 없는 경우
  App → 텍스트 stdout → Vector(regex 파싱) → Kafka → ClickHouse(app_logs)
  결과: 파싱 가능한 필드만 채워짐, level/logger/message는 대부분 추출 가능
        HTTP 필드는 로그 포맷에 따라 추출 가능/불가능
```

두 경로 모두 같은 `app_logs` 테이블에 적재됩니다.
파싱에 실패한 필드는 기본값(빈 문자열, 0)으로 저장되며,
백엔드 API는 이를 null로 변환하여 프론트에 전달합니다.

---

## Vector의 파싱 전략 (vector.yaml)

Vector의 `parse_and_enrich` transform이 다음 순서로 시도합니다:

1. **JSON 파싱** → 성공하면 모든 필드 매핑 (경로 1)
2. **Spring Boot 텍스트 포맷 regex** → `YYYY-MM-DD HH:mm:ss.SSS LEVEL PID --- [thread] logger : message` 패턴
3. **기타 포맷** → 최소한 로그 레벨만이라도 추출

HTTP 요청 정보(`http_method`, `http_path`, `http_status`, `response_time_ms`)는
메시지 본문에 해당 패턴이 있을 때만 추출됩니다.

---

## 경로 1: 구조화 로깅 설정 (권장)

앱이 JSON 로그를 출력할 수 있다면, 데이터 품질이 가장 높습니다.

### Spring Boot (Java)

**의존성:**
```groovy
implementation 'net.logstash.logback:logstash-logback-encoder:8.0'
```

**logback-spring.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeMdcKeyName>http_method</includeMdcKeyName>
            <includeMdcKeyName>http_path</includeMdcKeyName>
            <includeMdcKeyName>http_status</includeMdcKeyName>
            <includeMdcKeyName>response_time_ms</includeMdcKeyName>
        </encoder>
    </appender>
    <root level="INFO">
        <appender-ref ref="JSON" />
    </root>
</configuration>
```

**HTTP 요청 로깅 필터:**
```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class HttpRequestLoggingFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(HttpRequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain) throws ServletException, IOException {
        long start = System.currentTimeMillis();
        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            MDC.put("http_method", request.getMethod());
            MDC.put("http_path", request.getRequestURI());
            MDC.put("http_status", String.valueOf(response.getStatus()));
            MDC.put("response_time_ms", String.valueOf(duration));
            log.info("{} {} {} {}ms", request.getMethod(), request.getRequestURI(),
                     response.getStatus(), duration);
            MDC.clear();
        }
    }
}
```

### Python (structlog)
```python
import structlog
structlog.configure(
    processors=[structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.JSONRenderer()],
    logger_factory=structlog.PrintLoggerFactory(),
)
log = structlog.get_logger()
log.info("http_request", http_method="GET", http_path="/api/users",
         http_status=200, response_time_ms=45)
```

### Node.js (pino)
```javascript
const pino = require('pino');
const logger = pino({ level: 'info' });
logger.info({ http_method: req.method, http_path: req.url,
              http_status: res.statusCode, response_time_ms: duration },
            'HTTP request completed');
```

---

## 경로 2: 앱 변경 없이 사용

앱의 로그를 바꿀 수 없는 경우, Vector가 텍스트 파싱합니다.

**지원되는 포맷:**
- Spring Boot 기본 포맷: `2026-02-26 04:29:55.123  INFO 12345 --- [main] c.a.Main : message`
- 로그 레벨 포함 일반 텍스트: 최소한 `ERROR`, `WARN`, `INFO` 등 추출

**제한사항:**
- HTTP 필드(`http_method`, `http_path` 등)는 메시지에 명시적 패턴이 있을 때만 추출
- 앱이 독자적 포맷을 사용하면 Vector config에 해당 포맷의 regex 추가 필요
- 구조화 로깅 대비 데이터 품질이 낮음

**면접 답변 포인트:**
> "모니터링 솔루션이 특정 로그 포맷을 강제하지 않습니다.
> Vector가 중간 파싱 레이어로 동작하여 JSON/텍스트 모두 처리합니다.
> 다만 구조화 로깅을 하면 더 풍부한 지표(API별 성능, P95 응답시간 등)를
> 얻을 수 있기 때문에 권장하는 것이지, 필수가 아닙니다."

---

## 필수 필드 매핑

| 필드             | 타입   | 설명                | 경로1 | 경로2 |
|------------------|--------|---------------------|-------|-------|
| level            | String | 로그 레벨           | O     | O     |
| logger           | String | 로거명/클래스명     | O     | O (Spring) |
| thread           | String | 스레드명            | O     | O (Spring) |
| message          | String | 로그 메시지         | O     | O     |
| http_method      | String | GET, POST 등        | O     | 조건부 |
| http_path        | String | /api/users 등       | O     | 조건부 |
| http_status      | Number | 200, 500 등         | O     | 조건부 |
| response_time_ms | Number | 응답 시간 (ms)      | O     | 조건부 |
| exception_class  | String | 예외 클래스명       | O     | 조건부 |
| stack_trace      | String | 스택 트레이스       | O     | 조건부 |
