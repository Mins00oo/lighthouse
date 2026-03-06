package com.app.lighthouse.domain.log.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LogSearchResponse {

    private final List<LogEntryDto> logs;
    private final long totalCount;
    private final int page;
    private final int size;
    private final boolean hasNext;
}
