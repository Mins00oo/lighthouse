-- ============================================================
-- [V1] lh_user: 사용자 테이블
-- ============================================================

CREATE TABLE lh_user (
    user_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username   VARCHAR2(50)  NOT NULL UNIQUE,
    password   VARCHAR2(200) NOT NULL,
    role       VARCHAR2(20)  DEFAULT 'USER' NOT NULL,
    created_at TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
);

