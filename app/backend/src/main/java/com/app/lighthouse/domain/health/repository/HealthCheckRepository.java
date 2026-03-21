package com.app.lighthouse.domain.health.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.app.lighthouse.domain.health.repository.row.HealthCheckRow;

@Repository
public class HealthCheckRepository {

    private static final String TABLE = "lighthouse.health_checks";
    private final JdbcTemplate jdbc;

    public HealthCheckRepository(@Qualifier("clickHouseJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(HealthCheckRow row) {
        String sql = "INSERT INTO " + TABLE +
                " (timestamp, service, status, response_time_ms, db_status," +
                " db_pool_active, db_pool_idle, db_pool_total," +
                " disk_free_bytes, disk_total_bytes, app_version, jvm_uptime_seconds, details)" +
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '')";
        jdbc.update(sql,
                row.timestamp(), row.service(), row.status(), row.responseTimeMs(),
                row.dbStatus(), row.dbPoolActive(), row.dbPoolIdle(), row.dbPoolTotal(),
                row.diskFreeBytes(), row.diskTotalBytes(), row.appVersion(), row.jvmUptimeSeconds());
    }

    public HealthCheckRow getLatest(String service) {
        String sql = "SELECT * FROM " + TABLE +
                " WHERE service = ? ORDER BY timestamp DESC LIMIT 1";
        List<HealthCheckRow> rows = jdbc.query(sql, this::mapRow, service);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public List<HealthCheckRow> getHistory(String service, LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT * FROM " + TABLE +
                " WHERE service = ? AND timestamp >= ? AND timestamp < ?" +
                " ORDER BY timestamp ASC";
        return jdbc.query(sql, this::mapRow, service, from, to);
    }

    public int countConsecutiveDown(String service, int minutes) {
        String sql = "SELECT count() FROM (" +
                " SELECT status FROM " + TABLE +
                " WHERE service = ? AND timestamp >= now() - INTERVAL " + minutes + " MINUTE" +
                " ORDER BY timestamp DESC LIMIT 10" +
                ") WHERE status = 'DOWN'";
        Long count = jdbc.queryForObject(sql, Long.class, service);
        return count != null ? count.intValue() : 0;
    }

    public double getUptimePercent(String service, int days) {
        String sql = "SELECT" +
                " countIf(status = 'UP') AS up_count," +
                " count() AS total_count" +
                " FROM " + TABLE +
                " WHERE service = ? AND timestamp >= now() - INTERVAL " + days + " DAY";
        return jdbc.queryForObject(sql, (rs, rowNum) -> {
            long total = rs.getLong("total_count");
            if (total == 0) return 100.0;
            long up = rs.getLong("up_count");
            return Math.round(up * 10000.0 / total) / 100.0;
        }, service);
    }

    private HealthCheckRow mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new HealthCheckRow(
                rs.getTimestamp("timestamp").toLocalDateTime(),
                rs.getString("service"),
                rs.getString("status"),
                rs.getLong("response_time_ms"),
                rs.getString("db_status"),
                rs.getInt("db_pool_active"),
                rs.getInt("db_pool_idle"),
                rs.getInt("db_pool_total"),
                rs.getLong("disk_free_bytes"),
                rs.getLong("disk_total_bytes"),
                rs.getString("app_version"),
                rs.getLong("jvm_uptime_seconds")
        );
    }
}
