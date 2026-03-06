package com.app.lighthouse.infra.oracle;

/**
 * Oracle lh_user 테이블 조회 결과 매핑용 레코드.
 * MyBatis가 생성자를 통해 매핑하므로 필드 순서가 XML resultMap과 일치해야 함.
 */
public record UserRecord(
        Long userId,
        String username,
        String password,
        String role
) {}
