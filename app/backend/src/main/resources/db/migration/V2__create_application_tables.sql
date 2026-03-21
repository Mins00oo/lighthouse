-- ============================================================
-- [V2] lh_application: 애플리케이션 메타데이터 테이블
-- ============================================================

CREATE TABLE lh_application (
    app_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service_name    VARCHAR(100) NOT NULL UNIQUE,
    display_name    VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    status          VARCHAR(20)  DEFAULT 'ACTIVE' NOT NULL,
    created_at      TIMESTAMP    DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP    DEFAULT NOW() NOT NULL
);
