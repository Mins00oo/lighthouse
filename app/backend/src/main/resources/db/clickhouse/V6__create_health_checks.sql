CREATE TABLE IF NOT EXISTS lighthouse.health_checks
(
    timestamp          DateTime64(3),
    service            String,
    status             LowCardinality(String),
    response_time_ms   UInt32 DEFAULT 0,
    db_status          LowCardinality(String) DEFAULT '',
    db_pool_active     UInt16 DEFAULT 0,
    db_pool_idle       UInt16 DEFAULT 0,
    db_pool_total      UInt16 DEFAULT 0,
    disk_free_bytes    UInt64 DEFAULT 0,
    disk_total_bytes   UInt64 DEFAULT 0,
    app_version        String DEFAULT '',
    jvm_uptime_seconds UInt64 DEFAULT 0,
    details            String DEFAULT ''
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (service, timestamp)
TTL toDateTime(timestamp) + INTERVAL 90 DAY;
