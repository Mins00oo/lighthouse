package com.app.lighthouse.domain.dashboard.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RequestVolumeDto {

    private final LocalDateTime time;
    private final long requestCount;
}
