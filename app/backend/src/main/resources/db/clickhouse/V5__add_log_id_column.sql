-- ============================================================
-- app_logs 테이블에 UUID id 컬럼 추가
-- 로그 상세 조회(API-06) 지원을 위한 고유 식별자
-- ============================================================

-- 1) Kafka Engine + MV 제거
DROP VIEW IF EXISTS lighthouse.mv_app_logs;
DROP TABLE IF EXISTS lighthouse.app_logs_kafka;

-- 2) id 컬럼 추가
ALTER TABLE lighthouse.app_logs ADD COLUMN IF NOT EXISTS id UUID DEFAULT generateUUIDv4();

-- 3) 기존 행 백필
ALTER TABLE lighthouse.app_logs MATERIALIZE COLUMN id;

-- 4) id 검색용 skip index 추가
ALTER TABLE lighthouse.app_logs ADD INDEX IF NOT EXISTS idx_id id TYPE bloom_filter GRANULARITY 4;

-- 5) Kafka Engine 테이블 재생성
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

-- 6) MV 재생성 (generateUUIDv4() AS id 포함)
CREATE MATERIALIZED VIEW IF NOT EXISTS lighthouse.mv_app_logs
TO lighthouse.app_logs
AS
SELECT
    generateUUIDv4() AS id,
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
