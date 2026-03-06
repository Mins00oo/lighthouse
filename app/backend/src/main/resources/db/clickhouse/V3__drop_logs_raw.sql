-- ============================================================
-- logs_raw 파이프라인 제거
-- SDK 기반 구조화 로그만 사용하므로 비정형 파이프라인 불필요
-- ============================================================

DROP VIEW IF EXISTS lighthouse.mv_logs_raw;
DROP TABLE IF EXISTS lighthouse.logs_raw_kafka;
DROP TABLE IF EXISTS lighthouse.logs_raw;
