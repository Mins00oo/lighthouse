CREATE TABLE IF NOT EXISTS lighthouse.business_metrics
(
    timestamp    DateTime64(3),
    service      String,
    metric_type  LowCardinality(String),
    metric_data  String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (service, metric_type, timestamp)
TTL toDateTime(timestamp) + INTERVAL 180 DAY;
