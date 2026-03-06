-- 애플리케이션 메타데이터 테이블
CREATE TABLE lh_application (
    app_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service_name    VARCHAR2(100) NOT NULL UNIQUE,
    display_name    VARCHAR2(200) NOT NULL,
    description     VARCHAR2(1000),
    status          VARCHAR2(20)  DEFAULT 'ACTIVE' NOT NULL,
    created_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
);
