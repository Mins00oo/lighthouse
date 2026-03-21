CREATE TABLE IF NOT EXISTS lighthouse.system_metrics
(
    timestamp            DateTime64(3),
    service              String,
    cpu_usage_percent    Float64 DEFAULT 0,
    memory_used_bytes    UInt64 DEFAULT 0,
    memory_max_bytes     UInt64 DEFAULT 0,
    jvm_heap_used        UInt64 DEFAULT 0,
    jvm_heap_max         UInt64 DEFAULT 0,
    jvm_nonheap_used     UInt64 DEFAULT 0,
    jvm_threads_live     UInt32 DEFAULT 0,
    jvm_gc_pause_ms      Float64 DEFAULT 0,
    hikari_active        UInt16 DEFAULT 0,
    hikari_idle          UInt16 DEFAULT 0,
    hikari_pending       UInt16 DEFAULT 0,
    http_server_requests UInt64 DEFAULT 0,
    tomcat_threads_busy  UInt16 DEFAULT 0,
    tomcat_threads_max   UInt16 DEFAULT 0
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (service, timestamp)
TTL toDateTime(timestamp) + INTERVAL 30 DAY;
