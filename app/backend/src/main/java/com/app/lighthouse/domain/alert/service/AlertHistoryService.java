package com.app.lighthouse.domain.alert.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.app.lighthouse.domain.alert.dto.AlertHistoryDto;
import com.app.lighthouse.domain.alert.dto.AlertHistoryPageDto;
import com.app.lighthouse.domain.alert.repository.AlertHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AlertHistoryService {

    private final AlertHistoryRepository alertHistoryRepository;

    public AlertHistoryPageDto search(LocalDateTime from, LocalDateTime to,
                                       String ruleType, String level,
                                       int page, int size) {
        if (from == null) from = LocalDateTime.now().minusDays(7);
        if (to == null) to = LocalDateTime.now();
        if (size <= 0 || size > 200) size = 50;
        if (page < 0) page = 0;

        long totalCount = alertHistoryRepository.count(from, to, ruleType, level);
        List<AlertHistoryDto> alerts = alertHistoryRepository.search(from, to, ruleType, level, page, size)
                .stream()
                .map(row -> AlertHistoryDto.builder()
                        .timestamp(row.timestamp())
                        .service(row.service())
                        .ruleType(row.ruleType())
                        .level(row.level())
                        .triggered(row.triggered())
                        .message(row.message())
                        .build())
                .toList();

        return AlertHistoryPageDto.builder()
                .alerts(alerts)
                .totalCount(totalCount)
                .page(page)
                .size(size)
                .hasNext((long) (page + 1) * size < totalCount)
                .build();
    }
}
