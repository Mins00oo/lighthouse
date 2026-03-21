package com.app.lighthouse.domain.metric.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.app.lighthouse.domain.metric.dto.SystemMetricDto;
import com.app.lighthouse.domain.metric.repository.MetricRepository;
import com.app.lighthouse.domain.metric.repository.row.SystemMetricRow;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MetricService {

    private static final Set<Integer> ALLOWED_INTERVALS = Set.of(1, 5, 15, 30, 60);
    private final MetricRepository metricRepository;

    public SystemMetricDto getLatest(String service) {
        SystemMetricRow row = metricRepository.getLatest(service);
        if (row == null) return null;
        return toDto(row);
    }

    public List<SystemMetricDto> getTrend(String service, LocalDateTime from, LocalDateTime to, int intervalMin) {
        if (!ALLOWED_INTERVALS.contains(intervalMin)) intervalMin = 5;
        if (from == null) from = LocalDateTime.now().minusHours(1);
        if (to == null) to = LocalDateTime.now();

        String interval = intervalMin + " MINUTE";
        return metricRepository.getTrend(service, from, to, interval).stream()
                .map(this::toDto)
                .toList();
    }

    private SystemMetricDto toDto(SystemMetricRow row) {
        return SystemMetricDto.builder()
                .timestamp(row.timestamp())
                .service(row.service())
                .cpuUsagePercent(row.cpuUsagePercent())
                .memoryUsedBytes(row.memoryUsedBytes())
                .memoryMaxBytes(row.memoryMaxBytes())
                .jvmHeapUsed(row.jvmHeapUsed())
                .jvmHeapMax(row.jvmHeapMax())
                .jvmNonheapUsed(row.jvmNonheapUsed())
                .jvmThreadsLive(row.jvmThreadsLive())
                .jvmGcPauseMs(row.jvmGcPauseMs())
                .hikariActive(row.hikariActive())
                .hikariIdle(row.hikariIdle())
                .hikariPending(row.hikariPending())
                .httpServerRequests(row.httpServerRequests())
                .build();
    }
}
