-- ============================================================
-- Lighthouse: 정규화된 애플리케이션 로그 테이블
-- 기존 logs_raw(비정형)는 유지하되, 구조화된 데이터는 이 테이블 사용
-- ============================================================

CREATE TABLE IF NOT EXISTS lighthouse.app_logs
(
    ingest_time      DateTime64(3),
    ingest_time_utc  DateTime64(3),
    host             String,
    service          String,
    env              String,

    level            LowCardinality(String) DEFAULT 'UNKNOWN',
    logger           String DEFAULT '',
    thread           String DEFAULT '',
    message          String DEFAULT '',

    http_method      LowCardinality(String) DEFAULT '',
    http_path        String DEFAULT '',
    http_status      UInt16 DEFAULT 0,
    response_time_ms UInt32 DEFAULT 0,

    exception_class  String DEFAULT '',
    stack_trace      String DEFAULT '',

    raw_event        String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(ingest_time)
ORDER BY (service, level, ingest_time, host);

-- ============================================================
-- Kafka 연동 테이블
-- ============================================================

CREATE TABLE IF NOT EXISTS lighthouse.app_logs_kafka
(
    ingest_time      DateTime64(3),
    ingest_time_utc  DateTime64(3),
    host             String,
    service          String,
    env              String,
    level            String,
    logger           String,
    thread           String,
    message          String,
    http_method      String,
    http_path        String,
    http_status      UInt16,
    response_time_ms UInt32,
    exception_class  String,
    stack_trace      String,
    raw_event        String
)
ENGINE = Kafka
SETTINGS
    kafka_broker_list          = 'kafka:9092',
    kafka_topic_list           = 'logs.app',
    kafka_group_name           = 'ch_app_logs_consumer',
    kafka_format               = 'JSONEachRow',
    kafka_num_consumers        = 1,
    kafka_skip_broken_messages = 1000;

-- ============================================================
-- Materialized View: Kafka -> app_logs 자동 적재
-- ============================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS lighthouse.mv_app_logs
TO lighthouse.app_logs
AS
SELECT
    ingest_time,
    ingest_time_utc,
    host,
    service,
    env,
    level,
    logger,
    thread,
    message,
    http_method,
    http_path,
    http_status,
    response_time_ms,
    exception_class,
    stack_trace,
    raw_event
FROM lighthouse.app_logs_kafka;
