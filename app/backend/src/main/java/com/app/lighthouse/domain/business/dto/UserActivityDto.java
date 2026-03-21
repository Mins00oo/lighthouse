package com.app.lighthouse.domain.business.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserActivityDto {
    private final LocalDateTime collectedAt;
    private final long dau;
    private final long wau;
    private final long mau;
    private final long totalUsers;
    private final long newUsersToday;
}
