package com.app.lighthouse.domain.alert.repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.app.lighthouse.domain.alert.repository.row.ErrorRateStats;
import com.app.lighthouse.domain.alert.repository.row.FailedEndpointRow;
import com.app.lighthouse.domain.alert.repository.row.ResponseTimeStats;

@Repository
public class AlertLogRepository {

    private static final String TABLE = "lighthouse.app_logs";

    private final JdbcTemplate jdbc;

    public AlertLogRepository(@Qualifier("clickHouseJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public ErrorRateStats getRecentErrorRate(int minutes) {
        String sql = "SELECT" +
                " count(*) AS total," +
                " countIf(http_status >= 400) AS errors," +
                " if(total > 0, errors / total, 0) AS error_rate" +
                " FROM " + TABLE +
                " WHERE timestamp >= now() - INTERVAL " + minutes + " MINUTE" +
                " AND http_method != ''";

        return jdbc.queryForObject(sql, (rs, rowNum) -> new ErrorRateStats(
                rs.getLong("total"),
                rs.getLong("errors"),
                rs.getDouble("error_rate")
        ));
    }

    public ErrorRateStats getBaselineErrorRate(int recentMinutes, int baselineMinutes) {
        String sql = "SELECT" +
                " count(*) AS total," +
                " countIf(http_status >= 400) AS errors," +
                " if(total > 0, errors / total, 0) AS error_rate" +
                " FROM " + TABLE +
                " WHERE timestamp >= now() - INTERVAL " + baselineMinutes + " MINUTE" +
                " AND timestamp < now() - INTERVAL " + recentMinutes + " MINUTE" +
                " AND http_method != ''";

        return jdbc.queryForObject(sql, (rs, rowNum) -> new ErrorRateStats(
                rs.getLong("total"),
                rs.getLong("errors"),
                rs.getDouble("error_rate")
        ));
    }

    public ResponseTimeStats getRecentResponseTimeStats(int minutes) {
        String sql = "SELECT" +
                " count(*) AS total," +
                " quantile(0.95)(response_time_ms) AS p95," +
                " quantile(0.99)(response_time_ms) AS p99," +
                " avg(response_time_ms) AS avg_rt" +
                " FROM " + TABLE +
                " WHERE timestamp >= now() - INTERVAL " + minutes + " MINUTE" +
                " AND http_method != ''" +
                " AND response_time_ms > 0";

        return jdbc.queryForObject(sql, (rs, rowNum) -> new ResponseTimeStats(
                rs.getLong("total"),
                roundTwo(rs.getDouble("p95")),
                roundTwo(rs.getDouble("p99")),
                roundTwo(rs.getDouble("avg_rt"))
        ));
    }

    public List<FailedEndpointRow> getRecentFailedEndpoints(int minutes) {
        String sql = "SELECT DISTINCT http_method, http_path, service" +
                " FROM " + TABLE +
                " WHERE timestamp >= now() - INTERVAL " + minutes + " MINUTE" +
                " AND http_status >= 500" +
                " AND http_method != ''";

        return jdbc.query(sql, (rs, rowNum) -> new FailedEndpointRow(
                rs.getString("http_method"),
                rs.getString("http_path"),
                rs.getString("service")
        ));
    }

    public List<Integer> getRecentStatusesForEndpoint(String method, String path,
                                                       int minutes, int limit) {
        String sql = "SELECT http_status" +
                " FROM " + TABLE +
                " WHERE timestamp >= now() - INTERVAL " + minutes + " MINUTE" +
                " AND http_method = ? AND http_path = ?" +
                " ORDER BY timestamp DESC LIMIT ?";

        return jdbc.query(sql, (rs, rowNum) -> rs.getInt("http_status"),
                method, path, limit);
    }

    private double roundTwo(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
