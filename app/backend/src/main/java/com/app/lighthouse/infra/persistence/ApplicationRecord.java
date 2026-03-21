package com.app.lighthouse.infra.persistence;

import java.time.LocalDateTime;

/**
 * lh_application 테이블 조회 결과 매핑용 레코드.
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
