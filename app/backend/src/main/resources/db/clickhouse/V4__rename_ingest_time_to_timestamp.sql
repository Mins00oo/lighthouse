-- ============================================================
-- ingest_time → timestamp 변경, ingest_time_utc 제거
-- SDK의 @timestamp(로그 발생 시각)를 기준 시간으로 사용
-- ============================================================

-- 1) Kafka Engine + MV 재생성 (컬럼명 변경 반영)
DROP VIEW IF EXISTS lighthouse.mv_app_logs;
DROP TABLE IF EXISTS lighthouse.app_logs_kafka;

-- 2) app_logs 테이블 컬럼 변경
ALTER TABLE lighthouse.app_logs RENAME COLUMN ingest_time TO timestamp;
ALTER TABLE lighthouse.app_logs DROP COLUMN IF EXISTS ingest_time_utc;

-- 3) Kafka Engine 테이블 재생성 (timestamp 컬럼)
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

-- 4) MV 재생성 (String → DateTime64 변환)
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
