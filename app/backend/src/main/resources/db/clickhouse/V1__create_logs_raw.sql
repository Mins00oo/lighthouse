-- ============================================================
-- Lighthouse: 비정형 로그 원본 테이블 (logs.raw 토픽)
-- ============================================================

CREATE DATABASE IF NOT EXISTS lighthouse;

CREATE TABLE IF NOT EXISTS lighthouse.logs_raw
(
    ingest_time DateTime64(3),
    host        String,
    service     String,
    env         String,
    raw_event   String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(ingest_time)
ORDER BY (service, ingest_time, host);

CREATE TABLE IF NOT EXISTS lighthouse.logs_raw_kafka
(
    ingest_time DateTime64(3),
    host        String,
    service     String,
    env         String,
    raw_event   String
)
ENGINE = Kafka
SETTINGS
    kafka_broker_list          = 'kafka:9092',
    kafka_topic_list           = 'logs.raw',
    kafka_group_name           = 'ch_logs_raw_consumer',
    kafka_format               = 'JSONEachRow',
    kafka_num_consumers        = 1,
    kafka_skip_broken_messages = 1000;

CREATE MATERIALIZED VIEW IF NOT EXISTS lighthouse.mv_logs_raw
TO lighthouse.logs_raw
AS
SELECT ingest_time, host, service, env, raw_event
FROM lighthouse.logs_raw_kafka;
