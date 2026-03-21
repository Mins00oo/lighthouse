package com.app.lighthouse.domain.alert.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AlertHistoryPageDto {
    private final List<AlertHistoryDto> alerts;
    private final long totalCount;
    private final int page;
    private final int size;
    private final boolean hasNext;
}
