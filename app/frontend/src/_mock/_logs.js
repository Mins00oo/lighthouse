// ----------------------------------------------------------------------

export const LOG_LEVEL_OPTIONS = [
  { value: 'INFO', label: 'Info' },
  { value: 'WARN', label: 'Warn' },
  { value: 'ERROR', label: 'Error' },
  { value: 'FATAL', label: 'Fatal' },
];

const SERVICES = ['lighthouse-be', 'user-api', 'payment-api', 'order-api', 'notification-api'];

const HOSTS = ['web-server-01', 'web-server-02', 'api-server-01', 'api-server-02'];

const ENVS = ['dev', 'prod', 'staging'];

const LOGGERS = [
  'com.app.lighthouse.domain.auth.service.AuthService',
  'com.app.lighthouse.domain.log.service.LogService',
  'com.app.user.service.UserService',
  'com.app.payment.service.PaymentService',
  'com.app.order.service.OrderService',
  'com.app.notification.service.NotificationService',
  'com.app.lighthouse.global.filter.JwtAuthFilter',
  'com.app.lighthouse.infra.clickhouse.ClickHouseClient',
];

const THREADS = [
  'http-nio-8080-exec-1',
  'http-nio-8080-exec-3',
  'http-nio-8080-exec-5',
  'http-nio-8080-exec-7',
  'http-nio-8081-exec-1',
  'http-nio-8081-exec-2',
  'scheduling-1',
  'async-pool-1',
];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const HTTP_PATHS = [
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/users/me',
  '/api/users',
  '/api/logs',
  '/api/orders',
  '/api/orders/checkout',
  '/api/payments/process',
  '/api/notifications/send',
  '/api/dashboard/metrics',
];

const LOG_MESSAGES = {
  INFO: [
    '사용자 로그인 성공: admin',
    'JWT 토큰 갱신 완료',
    '대시보드 메트릭 조회 완료',
    '로그 검색 요청 처리 완료 (152건)',
    '주문 생성 완료: ORDER-20260228-001',
    '결제 승인 완료: PAY-20260228-042',
    '알림 발송 완료: 3건',
    '헬스체크 통과 - 모든 서비스 정상',
    '캐시 갱신 완료: user_sessions',
    '스케줄링 작업 완료: daily_report',
  ],
  WARN: [
    'JWT 토큰 만료 감지',
    '슬로우 쿼리 감지: 실행시간 2340ms 초과',
    'API 호출 재시도 2/3회',
    '메모리 사용률 82% - 임계치 근접',
    'DB 커넥션 풀 부족: 잔여 2개',
    '요청 페이로드 크기 초과 (15MB)',
    '인증서 만료 7일 전',
    'Rate limit 90% 도달',
  ],
  ERROR: [
    'ClickHouse 연결 실패',
    '사용자 생성 실패: 중복 이메일',
    '결제 처리 실패: 외부 API 타임아웃',
    '인증 실패: 유효하지 않은 토큰 서명',
    '주문 처리 실패: 재고 부족',
    '알림 발송 실패: SMTP 연결 거부',
    'SSL 핸드셰이크 실패',
  ],
  FATAL: [
    '애플리케이션 시작 실패: 포트 8080 바인딩 불가',
    'OutOfMemoryError: 힙 메모리 소진',
    'DB 연결 불가: 복구 불가능한 오류',
  ],
};

const EXCEPTION_CLASSES = [
  'java.sql.SQLException',
  'java.lang.NullPointerException',
  'org.springframework.web.client.HttpServerErrorException',
  'java.net.ConnectException',
  'javax.net.ssl.SSLHandshakeException',
  'java.lang.OutOfMemoryError',
  'io.jsonwebtoken.ExpiredJwtException',
];

const STACK_TRACES = [
  `java.lang.NullPointerException: Cannot invoke method on null reference
\tat com.app.user.service.UserService.getUserById(UserService.java:45)
\tat com.app.user.controller.UserController.getUser(UserController.java:32)
\tat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
\tat org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:897)`,
  `java.sql.SQLException: Connection refused
\tat com.zaxxer.hikari.pool.HikariPool.createTimeoutException(HikariPool.java:696)
\tat com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:197)
\tat com.app.lighthouse.infra.clickhouse.ClickHouseClient.query(ClickHouseClient.java:58)
\tat com.app.lighthouse.domain.log.service.LogService.searchLogs(LogService.java:112)`,
  `org.springframework.web.client.HttpServerErrorException: 503 Service Unavailable
\tat org.springframework.web.client.DefaultResponseErrorHandler.handleError(DefaultResponseErrorHandler.java:97)
\tat com.app.payment.client.PaymentGatewayClient.process(PaymentGatewayClient.java:67)
\tat com.app.payment.service.PaymentService.charge(PaymentService.java:89)`,
  `java.lang.OutOfMemoryError: Java heap space
\tat java.util.Arrays.copyOf(Arrays.java:3210)
\tat java.util.ArrayList.grow(ArrayList.java:265)
\tat com.app.lighthouse.batch.ReportGenerator.generate(ReportGenerator.java:234)`,
  `javax.net.ssl.SSLHandshakeException: Remote host closed connection during handshake
\tat sun.security.ssl.SSLSocketImpl.readHandshakeRecord(SSLSocketImpl.java:1311)
\tat com.app.notification.client.SmtpClient.send(SmtpClient.java:78)
\tat com.app.notification.service.NotificationService.notify(NotificationService.java:56)`,
];

function getLevel(index) {
  // INFO 60%, WARN 20%, ERROR 15%, FATAL 5%
  if (index % 20 === 0) return 'FATAL';
  if (index % 7 < 1) return 'ERROR';
  if (index % 5 < 1) return 'WARN';
  return 'INFO';
}

function toLocalDateTime(minutesAgo) {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 백엔드 GET /api/logs 응답의 data.logs 항목과 동일한 구조
export const _logs = Array.from({ length: 50 }, (_, index) => {
  const level = getLevel(index);
  const messages = LOG_MESSAGES[level];
  const message = messages[index % messages.length];
  const isError = level === 'ERROR' || level === 'FATAL';
  const hasHttp = index % 3 !== 2; // 대부분 HTTP 정보 있음

  const httpStatus = isError ? 500 : level === 'WARN' ? 401 : 200;

  const log = {
    id: `log-${String(index + 1).padStart(3, '0')}`, // 프론트 라우팅용 (백엔드에는 없음)
    ingestTime: toLocalDateTime(index * 2), // 2분 간격
    host: HOSTS[index % HOSTS.length],
    service: SERVICES[index % SERVICES.length],
    env: ENVS[index % ENVS.length],
    level,
    logger: LOGGERS[index % LOGGERS.length],
    thread: THREADS[index % THREADS.length],
    message,
  };

  // HTTP 관련 필드 (null이면 생략 — @JsonInclude(NON_NULL) 동작 모사)
  if (hasHttp) {
    log.httpMethod = HTTP_METHODS[index % HTTP_METHODS.length];
    log.httpPath = HTTP_PATHS[index % HTTP_PATHS.length];
    log.httpStatus = httpStatus;
    log.responseTimeMs = Math.floor(10 + ((index * 37) % 3000));
  }

  // ERROR/FATAL 전용 필드
  if (isError) {
    log.exceptionClass = EXCEPTION_CLASSES[index % EXCEPTION_CLASSES.length];
    log.stackTrace = STACK_TRACES[index % STACK_TRACES.length];
  }

  return log;
});
