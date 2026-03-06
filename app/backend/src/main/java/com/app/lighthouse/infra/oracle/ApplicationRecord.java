package com.app.lighthouse.infra.oracle;

import java.time.LocalDateTime;

/**
 * Oracle lh_application 테이블 조회 결과 매핑용 레코드.
 */
public record ApplicationRecord(
        Long appId,
        String serviceName,
        String displayName,
        String description,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
