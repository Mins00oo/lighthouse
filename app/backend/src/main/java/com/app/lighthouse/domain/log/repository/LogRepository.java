package com.app.lighthouse.domain.log.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.app.lighthouse.domain.log.dto.LogEntryDto;
import com.app.lighthouse.domain.log.dto.LogSearchRequest;
import com.app.lighthouse.domain.log.repository.row.ApiDetailRow;
import com.app.lighthouse.domain.log.repository.row.ApiRankingRow;
import com.app.lighthouse.domain.log.repository.row.AppStatsRow;
import com.app.lighthouse.domain.log.repository.row.ErrorGroupRow;
import com.app.lighthouse.domain.log.repository.row.ErrorTrendRow;
import com.app.lighthouse.domain.log.repository.row.LevelCountRow;
import com.app.lighthouse.domain.log.repository.row.ServerStatusRow;
import com.app.lighthouse.domain.log.repository.row.ServiceSummaryRow;
import com.app.lighthouse.domain.log.repository.row.TimelineRow;
import com.app.lighthouse.global.util.TimeUtils;

@Repository
public class LogRepository {

    private static final String TABLE = "lighthouse.app_logs";

    private final JdbcTemplate jdbc;

    public LogRepository(@Qualifier("clickHouseJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ========== 로그 검색 ==========

    public List<LogEntryDto> searchLogs(LogSearchRequest request) {
        StringBuilder sql = new StringBuilder(
                "SELECT ingest_time, host, service, env, level, logger, thread, message," +
                " http_method, http_path, http_status, response_time_ms," +
                " exception_class, stack_trace, raw_event" +
                " FROM " + TABLE + " WHERE 1=1");

        List<Object> params = new ArrayList<>();
        appendSearchConditions(sql, params, request);

        sql.append(" ORDER BY ingest_time DESC LIMIT ? OFFSET ?");
        params.add(request.getSize());
        params.add(request.getPage() * request.getSize());

        return jdbc.query(sql.toString(), (rs, rowNum) -> mapToLogEntry(rs), params.toArray());
    }

    public long countLogs(LogSearchRequest request) {
        StringBuilder sql = new StringBuilder(
                "SELECT count() FROM " + TABLE + " WHERE 1=1");

        List<Object> params = new ArrayList<>();
        appendSearchConditions(sql, params, request);

        Long count = jdbc.queryForObject(sql.toString(), Long.class, params.toArray());
        return count != null ? count : 0L;
    }

    // ========== 대시보드: Overview ==========

    public long getTotalLogCount(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT count() FROM " + TABLE + " WHERE ingest_time >= ? AND ingest_time < ?";
        Long count = jdbc.queryForObject(sql, Long.class, from, to);
        return count != null ? count : 0L;
    }

    public long getErrorLogCount(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT count() FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND level = 'ERROR'";
        Long count = jdbc.queryForObject(sql, Long.class, from, to);
        return count != null ? count : 0L;
    }

    public long getFatalLogCount(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT count() FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND level = 'FATAL'";
        Long count = jdbc.queryForObject(sql, Long.class, from, to);
        return count != null ? count : 0L;
    }

    public long getWarnLogCount(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT count() FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND level = 'WARN'";
        Long count = jdbc.queryForObject(sql, Long.class, from, to);
        return count != null ? count : 0L;
    }

    public int getActiveServerCount(LocalDateTime since) {
        String sql = "SELECT uniq(host) FROM " + TABLE + " WHERE ingest_time >= ?";
        Integer count = jdbc.queryForObject(sql, Integer.class, since);
        return count != null ? count : 0;
    }

    public int getServiceCount(LocalDateTime since) {
        String sql = "SELECT uniq(service) FROM " + TABLE + " WHERE ingest_time >= ?";
        Integer count = jdbc.queryForObject(sql, Integer.class, since);
        return count != null ? count : 0;
    }

    public long getRequestCount(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT count() FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND http_method != ''";
        Long count = jdbc.queryForObject(sql, Long.class, from, to);
        return count != null ? count : 0L;
    }

    public double getAvgResponseTime(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT avg(response_time_ms) FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND response_time_ms > 0";
        Double val = jdbc.queryForObject(sql, Double.class, from, to);
        return val != null ? Math.round(val * 100.0) / 100.0 : 0.0;
    }

    public double getP95ResponseTime(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT quantile(0.95)(response_time_ms) FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND response_time_ms > 0";
        Double val = jdbc.queryForObject(sql, Double.class, from, to);
        return val != null ? Math.round(val * 100.0) / 100.0 : 0.0;
    }

    // ========== 대시보드: 로그 레벨 분포 ==========

    public List<LevelCountRow> getLogLevelDistribution(LocalDateTime from, LocalDateTime to,
                                                        String service, String env) {
        StringBuilder sql = new StringBuilder(
                "SELECT level, count() AS cnt FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ?");

        List<Object> params = new ArrayList<>();
        params.add(from);
        params.add(to);
        appendOptionalFilter(sql, params, "service", service);
        appendOptionalFilter(sql, params, "env", env);
        sql.append(" GROUP BY level ORDER BY cnt DESC");

        return jdbc.query(sql.toString(),
                (rs, rowNum) -> {
                    String level = rs.getString("level");
                    return new LevelCountRow(
                            (level == null || level.isEmpty()) ? "UNKNOWN" : level,
                            rs.getLong("cnt")
                    );
                },
                params.toArray());
    }

    // ========== 대시보드: 서버 상태 ==========

    public List<ServerStatusRow> getServerStatusSummary(LocalDateTime since) {
        String sql = "SELECT host, service, env," +
                " max(ingest_time) AS last_log_time," +
                " count() AS recent_log_count," +
                " countIf(level IN ('ERROR', 'FATAL')) AS recent_error_count" +
                " FROM " + TABLE + " WHERE ingest_time >= ?" +
                " GROUP BY host, service, env ORDER BY last_log_time DESC";

        return jdbc.query(sql,
                (rs, rowNum) -> new ServerStatusRow(
                        rs.getString("host"),
                        rs.getString("service"),
                        rs.getString("env"),
                        toSafeLocalDateTime(rs.getTimestamp("last_log_time")),
                        rs.getLong("recent_log_count"),
                        rs.getLong("recent_error_count")
                ),
                since);
    }

    // ========== 대시보드: 로그 타임라인 ==========

    public List<TimelineRow> getLogTimeline(LocalDateTime from, LocalDateTime to,
                                             String interval, String service, String env) {
        StringBuilder sql = new StringBuilder(
                "SELECT toStartOfInterval(ingest_time, INTERVAL " + interval + ") AS time_bucket," +
                " count() AS total_count," +
                " countIf(level IN ('ERROR', 'FATAL')) AS error_count," +
                " countIf(level = 'WARN') AS warn_count," +
                " countIf(level = 'INFO') AS info_count" +
                " FROM " + TABLE + " WHERE ingest_time >= ? AND ingest_time < ?");

        List<Object> params = new ArrayList<>();
        params.add(from);
        params.add(to);
        appendOptionalFilter(sql, params, "service", service);
        appendOptionalFilter(sql, params, "env", env);
        sql.append(" GROUP BY time_bucket ORDER BY time_bucket ASC");

        return jdbc.query(sql.toString(),
                (rs, rowNum) -> new TimelineRow(
                        toSafeLocalDateTime(rs.getTimestamp("time_bucket")),
                        rs.getLong("total_count"),
                        rs.getLong("error_count"),
                        rs.getLong("warn_count"),
                        rs.getLong("info_count")
                ),
                params.toArray());
    }

    // ========== 대시보드: API Performance ==========

    public List<ApiRankingRow> getApiRanking(LocalDateTime from, LocalDateTime to,
                                              String service, String sortBy, int limit) {
        StringBuilder sql = new StringBuilder(
                "SELECT http_method, http_path," +
                " count() AS request_count," +
                " avg(response_time_ms) AS avg_ms," +
                " quantile(0.95)(response_time_ms) AS p95_ms," +
                " countIf(http_status >= 500) AS error_count" +
                " FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND http_method != ''");

        List<Object> params = new ArrayList<>();
        params.add(from);
        params.add(to);
        appendOptionalFilter(sql, params, "service", service);
        sql.append(" GROUP BY http_method, http_path");

        switch (sortBy != null ? sortBy : "count") {
            case "slow" -> sql.append(" ORDER BY p95_ms DESC");
            case "error" -> sql.append(" ORDER BY error_count DESC");
            default -> sql.append(" ORDER BY request_count DESC");
        }

        sql.append(" LIMIT ?");
        params.add(limit);

        return jdbc.query(sql.toString(),
                (rs, rowNum) -> new ApiRankingRow(
                        rs.getString("http_method"),
                        rs.getString("http_path"),
                        rs.getLong("request_count"),
                        roundTwo(rs.getDouble("avg_ms")),
                        roundTwo(rs.getDouble("p95_ms")),
                        rs.getLong("error_count")
                ),
                params.toArray());
    }

    public List<ApiDetailRow> getApiDetail(LocalDateTime from, LocalDateTime to,
                                            String httpMethod, String httpPath, String interval) {
        String sql = "SELECT toStartOfInterval(ingest_time, INTERVAL " + interval + ") AS time_bucket," +
                " count() AS request_count," +
                " avg(response_time_ms) AS avg_ms," +
                " quantile(0.95)(response_time_ms) AS p95_ms," +
                " countIf(http_status >= 500) AS error_count" +
                " FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ?" +
                " AND http_method = ? AND http_path = ?" +
                " GROUP BY time_bucket ORDER BY time_bucket ASC";

        return jdbc.query(sql,
                (rs, rowNum) -> new ApiDetailRow(
                        toSafeLocalDateTime(rs.getTimestamp("time_bucket")),
                        rs.getLong("request_count"),
                        roundTwo(rs.getDouble("avg_ms")),
                        roundTwo(rs.getDouble("p95_ms")),
                        rs.getLong("error_count")
                ),
                from, to, httpMethod, httpPath);
    }

    // ========== 대시보드: Error Analysis ==========

    public List<ErrorTrendRow> getErrorTrend(LocalDateTime from, LocalDateTime to,
                                              String interval, String service) {
        StringBuilder sql = new StringBuilder(
                "SELECT toStartOfInterval(ingest_time, INTERVAL " + interval + ") AS time_bucket," +
                " countIf(level = 'ERROR') AS error_count," +
                " countIf(level = 'FATAL') AS fatal_count" +
                " FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND level IN ('ERROR', 'FATAL')");

        List<Object> params = new ArrayList<>();
        params.add(from);
        params.add(to);
        appendOptionalFilter(sql, params, "service", service);
        sql.append(" GROUP BY time_bucket ORDER BY time_bucket ASC");

        return jdbc.query(sql.toString(),
                (rs, rowNum) -> new ErrorTrendRow(
                        toSafeLocalDateTime(rs.getTimestamp("time_bucket")),
                        rs.getLong("error_count"),
                        rs.getLong("fatal_count")
                ),
                params.toArray());
    }

    public List<ErrorGroupRow> getErrorGrouping(LocalDateTime from, LocalDateTime to,
                                                  String service, int limit) {
        StringBuilder sql = new StringBuilder(
                "SELECT exception_class," +
                " any(message) AS sample_message," +
                " count() AS cnt," +
                " max(ingest_time) AS last_occurrence" +
                " FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND level IN ('ERROR', 'FATAL')");

        List<Object> params = new ArrayList<>();
        params.add(from);
        params.add(to);
        appendOptionalFilter(sql, params, "service", service);
        sql.append(" GROUP BY exception_class ORDER BY cnt DESC LIMIT ?");
        params.add(limit);

        return jdbc.query(sql.toString(),
                (rs, rowNum) -> new ErrorGroupRow(
                        rs.getString("exception_class"),
                        rs.getString("sample_message"),
                        rs.getLong("cnt"),
                        toSafeLocalDateTime(rs.getTimestamp("last_occurrence"))
                ),
                params.toArray());
    }

    public List<LogEntryDto> getRecentErrors(LocalDateTime from, LocalDateTime to,
                                               String service, int limit) {
        StringBuilder sql = new StringBuilder(
                "SELECT ingest_time, host, service, env, level, logger, thread, message," +
                " http_method, http_path, http_status, response_time_ms," +
                " exception_class, stack_trace, raw_event" +
                " FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND level IN ('ERROR', 'FATAL')");

        List<Object> params = new ArrayList<>();
        params.add(from);
        params.add(to);
        appendOptionalFilter(sql, params, "service", service);
        sql.append(" ORDER BY ingest_time DESC LIMIT ?");
        params.add(limit);

        return jdbc.query(sql.toString(), (rs, rowNum) -> mapToLogEntry(rs), params.toArray());
    }

    // ========== 애플리케이션: 자동 발견 ==========

    public List<String> getDistinctServices(LocalDateTime since) {
        String sql = "SELECT DISTINCT service FROM " + TABLE +
                " WHERE ingest_time >= ? AND service != '' ORDER BY service";
        return jdbc.queryForList(sql, String.class, since);
    }

    // ========== 애플리케이션: 서비스별 요약 통계 ==========

    public List<ServiceSummaryRow> getServiceSummaries(LocalDateTime since, List<String> serviceNames) {
        if (serviceNames == null || serviceNames.isEmpty()) {
            return Collections.emptyList();
        }

        String placeholders = serviceNames.stream().map(s -> "?").collect(Collectors.joining(", "));
        String sql = "SELECT service, count() AS log_count," +
                " countIf(level IN ('ERROR', 'FATAL')) AS error_count," +
                " max(ingest_time) AS last_log_time" +
                " FROM " + TABLE +
                " WHERE ingest_time >= ? AND service IN (" + placeholders + ")" +
                " GROUP BY service";

        List<Object> params = new ArrayList<>();
        params.add(since);
        params.addAll(serviceNames);

        return jdbc.query(sql,
                (rs, rowNum) -> new ServiceSummaryRow(
                        rs.getString("service"),
                        rs.getLong("log_count"),
                        rs.getLong("error_count"),
                        toSafeLocalDateTime(rs.getTimestamp("last_log_time"))
                ),
                params.toArray());
    }

    // ========== 애플리케이션: 서비스별 인스턴스 현황 ==========

    public List<ServerStatusRow> getServerStatusByService(String serviceName, LocalDateTime since) {
        String sql = "SELECT host, service, env," +
                " max(ingest_time) AS last_log_time," +
                " count() AS recent_log_count," +
                " countIf(level IN ('ERROR', 'FATAL')) AS recent_error_count" +
                " FROM " + TABLE +
                " WHERE ingest_time >= ? AND service = ?" +
                " GROUP BY host, service, env ORDER BY last_log_time DESC";

        return jdbc.query(sql,
                (rs, rowNum) -> new ServerStatusRow(
                        rs.getString("host"),
                        rs.getString("service"),
                        rs.getString("env"),
                        toSafeLocalDateTime(rs.getTimestamp("last_log_time")),
                        rs.getLong("recent_log_count"),
                        rs.getLong("recent_error_count")
                ),
                since, serviceName);
    }

    // ========== 애플리케이션: 상세 통계 ==========

    public AppStatsRow getAppStats(LocalDateTime from, LocalDateTime to, String serviceName) {
        String sql = "SELECT count() AS total_count," +
                " countIf(level = 'ERROR') AS error_count," +
                " countIf(level = 'WARN') AS warn_count," +
                " countIf(http_method != '') AS request_count," +
                " avg(if(response_time_ms > 0, response_time_ms, null)) AS avg_response_ms," +
                " quantile(0.95)(if(response_time_ms > 0, response_time_ms, null)) AS p95_response_ms" +
                " FROM " + TABLE +
                " WHERE ingest_time >= ? AND ingest_time < ? AND service = ?";

        return jdbc.queryForObject(sql,
                (rs, rowNum) -> new AppStatsRow(
                        rs.getLong("total_count"),
                        rs.getLong("error_count"),
                        rs.getLong("warn_count"),
                        rs.getLong("request_count"),
                        roundTwo(rs.getDouble("avg_response_ms")),
                        roundTwo(rs.getDouble("p95_response_ms"))
                ),
                from, to, serviceName);
    }

    // ========== Private Helpers ==========

    private void appendSearchConditions(StringBuilder sql, List<Object> params,
                                         LogSearchRequest request) {
        if (request.getFrom() != null) {
            sql.append(" AND ingest_time >= ?");
            params.add(request.getFrom());
        }
        if (request.getTo() != null) {
            sql.append(" AND ingest_time < ?");
            params.add(request.getTo());
        }
        if (hasValue(request.getService())) {
            sql.append(" AND service = ?");
            params.add(request.getService());
        }
        if (hasValue(request.getHost())) {
            sql.append(" AND host = ?");
            params.add(request.getHost());
        }
        if (hasValue(request.getEnv())) {
            sql.append(" AND env = ?");
            params.add(request.getEnv());
        }
        if (hasValue(request.getLevel())) {
            sql.append(" AND level = ?");
            params.add(request.getLevel().toUpperCase());
        }
        if (hasValue(request.getKeyword())) {
            sql.append(" AND (positionCaseInsensitive(message, ?) > 0" +
                    " OR positionCaseInsensitive(raw_event, ?) > 0)");
            params.add(request.getKeyword());
            params.add(request.getKeyword());
        }
    }

    private void appendOptionalFilter(StringBuilder sql, List<Object> params,
                                       String column, String value) {
        if (hasValue(value)) {
            sql.append(" AND ").append(column).append(" = ?");
            params.add(value);
        }
    }

    private LogEntryDto mapToLogEntry(ResultSet rs) throws SQLException {
        int httpStatus = rs.getInt("http_status");
        int responseTime = rs.getInt("response_time_ms");

        return LogEntryDto.builder()
                .ingestTime(toSafeLocalDateTime(rs.getTimestamp("ingest_time")))
                .host(rs.getString("host"))
                .service(rs.getString("service"))
                .env(rs.getString("env"))
                .level(defaultIfBlank(rs.getString("level"), "UNKNOWN"))
                .logger(emptyToNull(rs.getString("logger")))
                .thread(emptyToNull(rs.getString("thread")))
                .message(rs.getString("message"))
                .httpMethod(emptyToNull(rs.getString("http_method")))
                .httpPath(emptyToNull(rs.getString("http_path")))
                .httpStatus(httpStatus > 0 ? httpStatus : null)
                .responseTimeMs(responseTime > 0 ? responseTime : null)
                .exceptionClass(emptyToNull(rs.getString("exception_class")))
                .stackTrace(emptyToNull(rs.getString("stack_trace")))
                .rawEvent(rs.getString("raw_event"))
                .build();
    }

    private LocalDateTime toSafeLocalDateTime(Timestamp ts) {
        return ts != null ? TimeUtils.toKst(ts.toLocalDateTime()) : null;
    }

    private boolean hasValue(String s) {
        return s != null && !s.isBlank();
    }

    private String emptyToNull(String s) {
        return (s == null || s.isEmpty()) ? null : s;
    }

    private String defaultIfBlank(String s, String defaultVal) {
        return (s == null || s.isBlank()) ? defaultVal : s;
    }

    private double roundTwo(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
