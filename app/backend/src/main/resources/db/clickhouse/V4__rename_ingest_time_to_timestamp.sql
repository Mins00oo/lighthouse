-- ============================================================
-- ingest_time → timestamp 변경, ingest_time_utc 제거
-- SDK의 @timestamp(로그 발생 시각)를 기준 시간으로 사용
-- ============================================================
-- ClickHouse는 ORDER BY/PARTITION BY 키 컬럼을 RENAME할 수 없으므로
-- 테이블을 재생성하는 방식으로 처리한다.

-- 1) Kafka Engine + MV 제거
DROP VIEW IF EXISTS lighthouse.mv_app_logs;
DROP TABLE IF EXISTS lighthouse.app_logs_kafka;

-- 2) 새 스키마로 테이블 재생성 (기존 데이터 보존)
CREATE TABLE IF NOT EXISTS lighthouse.app_logs_new
(
    timestamp        DateTime64(3),
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
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (service, level, timestamp, host);

-- 3) 기존 데이터 이관
INSERT INTO lighthouse.app_logs_new
SELECT
    ingest_time AS timestamp,
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
FROM lighthouse.app_logs;

-- 4) 기존 테이블 교체
DROP TABLE lighthouse.app_logs;
RENAME TABLE lighthouse.app_logs_new TO lighthouse.app_logs;

-- 5) Kafka Engine 테이블 재생성 (timestamp 컬럼)
CREATE TABLE IF NOT EXISTS lighthouse.app_logs_kafka
(
    timestamp        String,
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

-- 6) MV 재생성 (String → DateTime64 변환)
CREATE MATERIALIZED VIEW IF NOT EXISTS lighthouse.mv_app_logs
TO lighthouse.app_logs
AS
SELECT
    parseDateTimeBestEffort(timestamp) AS timestamp,
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
