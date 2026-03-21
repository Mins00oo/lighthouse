package com.app.lighthouse.domain.alert.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.app.lighthouse.domain.alert.repository.row.AlertHistoryRow;

@Repository
public class AlertHistoryRepository {

    private static final String TABLE = "lighthouse.alert_history";
    private final JdbcTemplate jdbc;

    public AlertHistoryRepository(@Qualifier("clickHouseJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(AlertHistoryRow row) {
        String sql = "INSERT INTO " + TABLE +
                " (timestamp, service, rule_type, level, triggered, message, details)" +
                " VALUES (?, ?, ?, ?, ?, ?, ?)";
        jdbc.update(sql, row.timestamp(), row.service(), row.ruleType(),
                row.level(), row.triggered() ? 1 : 0, row.message(), row.details());
    }

    public List<AlertHistoryRow> search(LocalDateTime from, LocalDateTime to,
                                         String ruleType, String level,
                                         int page, int size) {
        StringBuilder sql = new StringBuilder("SELECT * FROM " + TABLE + " WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (from != null) {
            sql.append(" AND timestamp >= ?");
            params.add(from);
        }
        if (to != null) {
            sql.append(" AND timestamp < ?");
            params.add(to);
        }
        if (ruleType != null && !ruleType.isBlank()) {
            sql.append(" AND rule_type = ?");
            params.add(ruleType);
        }
        if (level != null && !level.isBlank()) {
            sql.append(" AND level = ?");
            params.add(level);
        }

        sql.append(" ORDER BY timestamp DESC LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return jdbc.query(sql.toString(), (rs, rowNum) -> new AlertHistoryRow(
                rs.getTimestamp("timestamp").toLocalDateTime(),
                rs.getString("service"),
                rs.getString("rule_type"),
                rs.getString("level"),
                rs.getInt("triggered") == 1,
                rs.getString("message"),
                rs.getString("details")
        ), params.toArray());
    }

    public long count(LocalDateTime from, LocalDateTime to, String ruleType, String level) {
        StringBuilder sql = new StringBuilder("SELECT count() FROM " + TABLE + " WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (from != null) {
            sql.append(" AND timestamp >= ?");
            params.add(from);
        }
        if (to != null) {
            sql.append(" AND timestamp < ?");
            params.add(to);
        }
        if (ruleType != null && !ruleType.isBlank()) {
            sql.append(" AND rule_type = ?");
            params.add(ruleType);
        }
        if (level != null && !level.isBlank()) {
            sql.append(" AND level = ?");
            params.add(level);
        }

        Long count = jdbc.queryForObject(sql.toString(), Long.class, params.toArray());
        return count != null ? count : 0;
    }
}
