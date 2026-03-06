package com.app.lighthouse.domain.log.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LogSearchResponse {

    private final List<LogEntryDto> content;
    private final long totalElements;
    private final int totalPages;
    private final int page;
    private final int size;
    private final boolean hasNext;
}
