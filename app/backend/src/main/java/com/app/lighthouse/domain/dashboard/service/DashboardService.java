package com.app.lighthouse.domain.dashboard.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.app.lighthouse.domain.dashboard.dto.ApiDetailDto;
import com.app.lighthouse.domain.dashboard.dto.ApiRankingDto;
import com.app.lighthouse.domain.dashboard.dto.DashboardSummaryDto;
import com.app.lighthouse.domain.dashboard.dto.ErrorTrendDto;
import com.app.lighthouse.domain.dashboard.dto.LogLevelDistributionDto;
import com.app.lighthouse.domain.dashboard.dto.LogVolumeDto;
import com.app.lighthouse.domain.dashboard.dto.RecentErrorDto;
import com.app.lighthouse.domain.dashboard.dto.ServerStatusDto;
import com.app.lighthouse.domain.log.repository.LogRepository;
import com.app.lighthouse.domain.log.repository.row.LevelCountRow;
import com.app.lighthouse.domain.log.repository.row.ServerStatusRow;
import com.app.lighthouse.global.util.TimeUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LogRepository logRepository;

    private static final int SERVER_ACTIVE_THRESHOLD_MINUTES = 5;
    private static final int MAX_RECENT_MINUTES = 1440;
    private static final int MAX_QUERY_DAYS = 7;

    private static final Set<String> ALLOWED_INTERVALS = Set.of(
            "1 MINUTE", "5 MINUTE", "15 MINUTE", "30 MINUTE",
            "1 HOUR", "6 HOUR", "1 DAY"
    );

    // ========== Overview ==========

    public DashboardSummaryDto getSummary(LocalDateTime from, LocalDateTime to) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];

        long totalCount = logRepository.getTotalLogCount(from, to);
        long errorCount = logRepository.getErrorLogCount(from, to);
        long fatalCount = logRepository.getFatalLogCount(from, to);
        long warnCount = logRepository.getWarnLogCount(from, to);
        double errorRate = totalCount > 0 ? (double) (errorCount + fatalCount) / totalCount * 100 : 0.0;

        LocalDateTime activeThreshold = TimeUtils.nowUtc().minusMinutes(SERVER_ACTIVE_THRESHOLD_MINUTES);
        int activeServerCount = logRepository.getActiveServerCount(activeThreshold);
        int serviceCount = logRepository.getServiceCount(from);
        long requestCount = logRepository.getRequestCount(from, to);
        double avgResponseTime = logRepository.getAvgResponseTime(from, to);
        double p95ResponseTime = logRepository.getP95ResponseTime(from, to);

        return DashboardSummaryDto.builder()
                .totalLogCount(totalCount)
                .errorCount(errorCount)
                .fatalCount(fatalCount)
                .warnCount(warnCount)
                .errorRate(roundTwo(errorRate))
                .activeServerCount(activeServerCount)
                .totalServiceCount(serviceCount)
                .totalRequestCount(requestCount)
                .avgResponseTimeMs(avgResponseTime)
                .p95ResponseTimeMs(p95ResponseTime)
                .periodDescription(TimeUtils.toKst(from) + " ~ " + TimeUtils.toKst(to))
                .build();
    }

    // ========== 로그 볼륨 트렌드 ==========

    public LogVolumeDto getLogVolume(LocalDateTime from, LocalDateTime to,
                                     String interval, String service, String env) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];

        if (interval == null || interval.isBlank()) {
            interval = resolveInterval(from, to);
        }
        validateInterval(interval);

        var rows = logRepository.getLogTimeline(from, to, interval, service, env);

        List<LogVolumeDto.TimeSlot> points = rows.stream()
                .map(r -> LogVolumeDto.TimeSlot.builder()
                        .time(r.time())
                        .totalCount(r.total())
                        .errorCount(r.error())
                        .warnCount(r.warn())
                        .infoCount(r.info())
                        .build())
                .collect(Collectors.toList());

        return LogVolumeDto.builder()
                .interval(interval)
                .points(points)
                .build();
    }

    // ========== 로그 레벨 분포 ==========

    public LogLevelDistributionDto getLogLevelDistribution(LocalDateTime from, LocalDateTime to,
                                                            String service, String env) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];

        List<LevelCountRow> rows = logRepository.getLogLevelDistribution(from, to, service, env);
        long total = rows.stream().mapToLong(LevelCountRow::count).sum();

        List<LogLevelDistributionDto.LevelCount> distribution = rows.stream()
                .map(r -> {
                    double pct = total > 0 ? (double) r.count() / total * 100 : 0.0;
                    return LogLevelDistributionDto.LevelCount.builder()
                            .level(r.level())
                            .count(r.count())
                            .percentage(roundTwo(pct))
                            .build();
                })
                .collect(Collectors.toList());

        return LogLevelDistributionDto.builder()
                .timeRange(TimeUtils.toKst(from) + " ~ " + TimeUtils.toKst(to))
                .distribution(distribution)
                .build();
    }

    // ========== 서버 상태 ==========

    public List<ServerStatusDto> getServerStatuses(int recentMinutes) {
        if (recentMinutes <= 0 || recentMinutes > MAX_RECENT_MINUTES) {
            throw new IllegalArgumentException(
                    "recentMinutes는 1 이상 " + MAX_RECENT_MINUTES + " 이하여야 합니다.");
        }

        LocalDateTime since = TimeUtils.nowUtc().minusMinutes(recentMinutes);
        List<ServerStatusRow> rows = logRepository.getServerStatusSummary(since);

        return rows.stream()
                .map(r -> {
                    boolean isActive = r.lastLogTime() != null && r.lastLogTime().isAfter(
                            TimeUtils.nowKst().minusMinutes(SERVER_ACTIVE_THRESHOLD_MINUTES));

                    return ServerStatusDto.builder()
                            .host(r.host())
                            .service(r.service())
                            .env(r.env())
                            .status(isActive ? "ACTIVE" : "INACTIVE")
                            .lastLogTime(r.lastLogTime())
                            .recentLogCount(r.logCount())
                            .recentErrorCount(r.errorCount())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ========== Error Trend ==========

    public ErrorTrendDto getErrorTrend(LocalDateTime from, LocalDateTime to,
                                        String interval, String service) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];

        if (interval == null || interval.isBlank()) {
            interval = resolveInterval(from, to);
        }
        validateInterval(interval);

        var rows = logRepository.getErrorTrend(from, to, interval, service);

        List<ErrorTrendDto.ErrorPoint> points = rows.stream()
                .map(r -> ErrorTrendDto.ErrorPoint.builder()
                        .time(r.time())
                        .errorCount(r.errorCount())
                        .fatalCount(r.fatalCount())
                        .build())
                .collect(Collectors.toList());

        return ErrorTrendDto.builder()
                .interval(interval)
                .points(points)
                .build();
    }

    // ========== API Ranking ==========

    public ApiRankingDto getApiRanking(LocalDateTime from, LocalDateTime to,
                                        String service, String sortBy, int limit) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];

        if (limit <= 0 || limit > 100) limit = 20;

        var rows = logRepository.getApiRanking(from, to, service, sortBy, limit);

        List<ApiRankingDto.ApiEntry> rankings = rows.stream()
                .map(r -> {
                    double errorRate = r.requestCount() > 0
                            ? (double) r.errorCount() / r.requestCount() * 100 : 0.0;
                    return ApiRankingDto.ApiEntry.builder()
                            .httpMethod(r.httpMethod())
                            .httpPath(r.httpPath())
                            .requestCount(r.requestCount())
                            .avgResponseTimeMs(r.avgResponseTimeMs())
                            .p95ResponseTimeMs(r.p95ResponseTimeMs())
                            .errorCount(r.errorCount())
                            .errorRate(roundTwo(errorRate))
                            .build();
                })
                .collect(Collectors.toList());

        return ApiRankingDto.builder()
                .rankings(rankings)
                .periodDescription(TimeUtils.toKst(from) + " ~ " + TimeUtils.toKst(to))
                .build();
    }

    // ========== API Detail ==========

    public ApiDetailDto getApiDetail(LocalDateTime from, LocalDateTime to,
                                      String httpMethod, String httpPath, String interval) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];

        if (httpMethod == null || httpPath == null) {
            throw new IllegalArgumentException("httpMethod와 httpPath는 필수입니다.");
        }
        if (interval == null || interval.isBlank()) {
            interval = resolveInterval(from, to);
        }
        validateInterval(interval);

        var rows = logRepository.getApiDetail(from, to, httpMethod.toUpperCase(), httpPath, interval);

        List<ApiDetailDto.TimeSlot> timeline = rows.stream()
                .map(r -> ApiDetailDto.TimeSlot.builder()
                        .time(r.time())
                        .requestCount(r.requestCount())
                        .avgResponseTimeMs(r.avgResponseTimeMs())
                        .p95ResponseTimeMs(r.p95ResponseTimeMs())
                        .errorCount(r.errorCount())
                        .build())
                .collect(Collectors.toList());

        return ApiDetailDto.builder()
                .httpMethod(httpMethod.toUpperCase())
                .httpPath(httpPath)
                .interval(interval)
                .timeline(timeline)
                .build();
    }

    // ========== Recent Errors ==========

    public RecentErrorDto getRecentErrors(LocalDateTime from, LocalDateTime to,
                                            String service, int limit) {
        LocalDateTime[] range = resolveAndValidate(from, to);
        from = range[0]; to = range[1];

        if (limit <= 0 || limit > 200) limit = 50;

        var groups = logRepository.getErrorGrouping(from, to, service, 20);
        var recentLogs = logRepository.getRecentErrors(from, to, service, limit);

        List<RecentErrorDto.ErrorGroup> errorGroups = groups.stream()
                .map(g -> RecentErrorDto.ErrorGroup.builder()
                        .exceptionClass(g.exceptionClass())
                        .message(g.message())
                        .count(g.count())
                        .lastOccurrence(g.lastOccurrence())
                        .build())
                .collect(Collectors.toList());

        List<RecentErrorDto.ErrorEntry> errorEntries = recentLogs.stream()
                .map(e -> RecentErrorDto.ErrorEntry.builder()
                        .ingestTime(e.getIngestTime())
                        .host(e.getHost())
                        .service(e.getService())
                        .level(e.getLevel())
                        .logger(e.getLogger())
                        .message(e.getMessage())
                        .exceptionClass(e.getExceptionClass())
                        .stackTrace(e.getStackTrace())
                        .httpMethod(e.getHttpMethod())
                        .httpPath(e.getHttpPath())
                        .build())
                .collect(Collectors.toList());

        return RecentErrorDto.builder()
                .groups(errorGroups)
                .recentErrors(errorEntries)
                .build();
    }

    // ========== 공통 ==========

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

    private double roundTwo(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
