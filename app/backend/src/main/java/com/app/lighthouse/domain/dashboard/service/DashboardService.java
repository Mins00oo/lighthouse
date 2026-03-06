package com.app.lighthouse.domain.dashboard.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.app.lighthouse.domain.dashboard.dto.ErrorLogDto;
import com.app.lighthouse.domain.dashboard.dto.OverviewSummaryDto;
import com.app.lighthouse.domain.dashboard.dto.RequestVolumeDto;
import com.app.lighthouse.domain.dashboard.dto.ResponseTimeDto;
import com.app.lighthouse.domain.dashboard.dto.SlowApiDto;
import com.app.lighthouse.domain.log.repository.LogRepository;
import com.app.lighthouse.global.util.TimeUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LogRepository logRepository;

    private static final int MAX_QUERY_DAYS = 7;
    private static final Set<Integer> ALLOWED_INTERVAL_MINUTES = Set.of(10, 30, 60);

    public OverviewSummaryDto getSummary(LocalDateTime from, LocalDateTime to) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];

        long totalRequests = logRepository.getRequestCount(from, to);
        long errorCount = logRepository.getHttpErrorCount(from, to);
        double avgResponseTimeMs = logRepository.getAvgResponseTime(from, to);

        return OverviewSummaryDto.builder()
                .totalRequests(totalRequests)
                .errorCount(errorCount)
                .avgResponseTimeMs(avgResponseTimeMs)
                .build();
    }

    public List<RequestVolumeDto> getRequestVolume(LocalDateTime from, LocalDateTime to, int intervalMin) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];
        validateIntervalMin(intervalMin);

        String interval = intervalMin + " MINUTE";
        var rows = logRepository.getRequestVolume(from, to, interval);

        return rows.stream()
                .map(r -> RequestVolumeDto.builder()
                        .time(r.time())
                        .requestCount(r.requestCount())
                        .build())
                .collect(Collectors.toList());
    }

    public List<ResponseTimeDto> getResponseTime(LocalDateTime from, LocalDateTime to, int intervalMin) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];
        validateIntervalMin(intervalMin);

        String interval = intervalMin + " MINUTE";
        var rows = logRepository.getResponseTimeTrend(from, to, interval);

        return rows.stream()
                .map(r -> ResponseTimeDto.builder()
                        .time(r.time())
                        .p95Ms(r.p95Ms())
                        .p99Ms(r.p99Ms())
                        .build())
                .collect(Collectors.toList());
    }

    public List<SlowApiDto> getSlowApis(LocalDateTime from, LocalDateTime to, int limit) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];

        if (limit <= 0 || limit > 100) limit = 10;

        var rows = logRepository.getSlowApis(from, to, limit);

        AtomicInteger rank = new AtomicInteger(1);
        return rows.stream()
                .map(r -> SlowApiDto.builder()
                        .rank(rank.getAndIncrement())
                        .httpMethod(r.httpMethod())
                        .httpPath(r.httpPath())
                        .p95Ms(r.p95ResponseTimeMs())
                        .avgMs(r.avgResponseTimeMs())
                        .requestCount(r.requestCount())
                        .build())
                .collect(Collectors.toList());
    }

    public List<ErrorLogDto> getErrorLogs(LocalDateTime from, LocalDateTime to, int limit) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];

        if (limit <= 0 || limit > 200) limit = 20;

        var rows = logRepository.getHttpErrorLogs(from, to, limit);

        return rows.stream()
                .map(r -> ErrorLogDto.builder()
                        .id(UUID.randomUUID().toString())
                        .timestamp(r.timestamp())
                        .httpMethod(r.httpMethod())
                        .httpPath(r.httpPath())
                        .httpStatus(r.httpStatus())
                        .serviceName(r.service())
                        .message(r.message())
                        .traceId(null)
                        .build())
                .collect(Collectors.toList());
    }

    private LocalDateTime[] resolveAndValidate(LocalDateTime from, LocalDateTime to) {
        if (from == null && to == null) {
            to = TimeUtils.nowUtc();
            from = to.minusHours(1);
        } else if (from != null && to == null) {
            from = TimeUtils.toUtc(from);
            to = TimeUtils.nowUtc();
        } else if (from == null) {
            to = TimeUtils.toUtc(to);
            from = to.minusHours(1);
        } else {
            from = TimeUtils.toUtc(from);
            to = TimeUtils.toUtc(to);
        }
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("시작 시간(from)이 종료 시간(to)보다 클 수 없습니다.");
        }
        if (Duration.between(from, to).toDays() > MAX_QUERY_DAYS) {
            throw new IllegalArgumentException("최대 조회 기간은 " + MAX_QUERY_DAYS + "일입니다.");
        }
        return new LocalDateTime[]{from, to};
    }

    private void validateIntervalMin(int intervalMin) {
        if (!ALLOWED_INTERVAL_MINUTES.contains(intervalMin)) {
            throw new IllegalArgumentException("허용되지 않는 intervalMin 값입니다: " + intervalMin + " (허용: 10, 30, 60)");
        }
    }
}
