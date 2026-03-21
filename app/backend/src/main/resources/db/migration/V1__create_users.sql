-- ============================================================
-- [V1] lh_user: 사용자 테이블
-- ============================================================

CREATE TABLE lh_user (
    user_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(200) NOT NULL,
    role       VARCHAR(20)  DEFAULT 'USER' NOT NULL,
    created_at TIMESTAMP    DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP    DEFAULT NOW() NOT NULL
);
