CREATE TABLE IF NOT EXISTS lighthouse.alert_history
(
    timestamp  DateTime64(3),
    service    String DEFAULT '',
    rule_type  LowCardinality(String),
    level      LowCardinality(String),
    triggered  UInt8 DEFAULT 1,
    message    String DEFAULT '',
    details    String DEFAULT ''
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (service, rule_type, timestamp)
TTL toDateTime(timestamp) + INTERVAL 365 DAY;
