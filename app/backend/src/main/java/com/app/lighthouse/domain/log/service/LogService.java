package com.app.lighthouse.domain.log.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.app.lighthouse.domain.log.dto.LogEntryDto;
import com.app.lighthouse.domain.log.dto.LogSearchRequest;
import com.app.lighthouse.domain.log.dto.LogSearchResponse;
import com.app.lighthouse.domain.log.dto.LogTimelineDto;
import com.app.lighthouse.domain.log.repository.LogRepository;

import com.app.lighthouse.global.util.TimeUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LogService {

    private static final Set<String> ALLOWED_INTERVALS = Set.of(
            "1 MINUTE", "5 MINUTE", "15 MINUTE", "30 MINUTE",
            "1 HOUR", "6 HOUR", "1 DAY"
    );
    private static final int MAX_QUERY_DAYS = 7;

    private final LogRepository logRepository;

    public LogSearchResponse searchLogs(LogSearchRequest request) {
        resolveTimeRange(request);
        validateTimeRange(request.getFrom(), request.getTo());

        List<LogEntryDto> logs = logRepository.searchLogs(request);
        long totalCount = logRepository.countLogs(request);
        boolean hasNext = (long) (request.getPage() + 1) * request.getSize() < totalCount;

        return LogSearchResponse.builder()
                .logs(logs)
                .totalCount(totalCount)
                .page(request.getPage())
                .size(request.getSize())
                .hasNext(hasNext)
                .build();
    }

    public LogTimelineDto getTimeline(LocalDateTime from, LocalDateTime to,
                                       String interval, String service, String env) {
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
        validateTimeRange(from, to);

        if (interval == null || interval.isBlank()) {
            interval = resolveInterval(from, to);
        }
        validateInterval(interval);

        List<LogTimelineDto.TimePoint> points = logRepository.getLogTimeline(from, to, interval, service, env)
                .stream()
                .map(r -> LogTimelineDto.TimePoint.builder()
                        .time(r.time())
                        .totalCount(r.total())
                        .errorCount(r.error())
                        .warnCount(r.warn())
                        .infoCount(r.info())
                        .build())
                .collect(Collectors.toList());

        return LogTimelineDto.builder()
                .interval(interval)
                .points(points)
                .build();
    }

    private void resolveTimeRange(LogSearchRequest request) {
        if (request.getFrom() == null && request.getTo() == null) {
            request.setTo(TimeUtils.nowUtc());
            request.setFrom(request.getTo().minusHours(1));
        } else if (request.getFrom() != null && request.getTo() == null) {
            request.setFrom(TimeUtils.toUtc(request.getFrom()));
            request.setTo(TimeUtils.nowUtc());
        } else if (request.getFrom() == null) {
            request.setTo(TimeUtils.toUtc(request.getTo()));
            request.setFrom(request.getTo().minusHours(1));
        } else {
            request.setFrom(TimeUtils.toUtc(request.getFrom()));
            request.setTo(TimeUtils.toUtc(request.getTo()));
        }
    }

    private void validateTimeRange(LocalDateTime from, LocalDateTime to) {
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("시작 시간(from)이 종료 시간(to)보다 클 수 없습니다.");
        }
        if (Duration.between(from, to).toDays() > MAX_QUERY_DAYS) {
            throw new IllegalArgumentException("최대 조회 기간은 " + MAX_QUERY_DAYS + "일입니다.");
        }
    }

    private void validateInterval(String interval) {
        if (!ALLOWED_INTERVALS.contains(interval.toUpperCase())) {
            throw new IllegalArgumentException("허용되지 않는 interval 값입니다: " + interval);
        }
    }

    private String resolveInterval(LocalDateTime from, LocalDateTime to) {
        long hours = Duration.between(from, to).toHours();
        if (hours <= 1) return "1 MINUTE";
        if (hours <= 6) return "5 MINUTE";
        if (hours <= 24) return "15 MINUTE";
        if (hours <= 72) return "1 HOUR";
        return "6 HOUR";
    }
}
