package com.app.lighthouse.global.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class ClickHouseMigrationRunner {

    private static final int MAX_RETRIES = 5;
    private static final long INITIAL_BACKOFF_MS = 3000;

    @Bean(name = "clickHouseMigration")
    public Object clickHouseMigration(
            @Qualifier("clickHouseDataSource") DataSource dataSource) throws Exception {

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        createMigrationsTable(jdbc);

        List<Resource> scripts = scanMigrationScripts();
        if (scripts.isEmpty()) {
            log.info("No ClickHouse migration scripts found");
            return new Object();
        }

        Set<String> applied = getAppliedVersions(jdbc);

        for (Resource script : scripts) {
            String filename = script.getFilename();
            String version = extractVersion(filename);
            String description = extractDescription(filename);

            if (applied.contains(version)) {
                String existingChecksum = getChecksum(jdbc, version);
                String currentChecksum = computeChecksum(script);
                if (existingChecksum != null && !existingChecksum.equals(currentChecksum)) {
                    log.warn("Checksum mismatch for migration {} — expected: {}, actual: {}",
                            filename, existingChecksum, currentChecksum);
                }
                log.debug("Skipping already applied migration: {}", filename);
                continue;
            }

            log.info("Applying ClickHouse migration: {}", filename);
            long start = System.currentTimeMillis();

            String sql = script.getContentAsString(StandardCharsets.UTF_8);
            List<String> statements = splitStatements(sql);

            for (String stmt : statements) {
                executeWithRetry(jdbc, stmt, filename);
            }

            long elapsed = System.currentTimeMillis() - start;
            String checksum = computeChecksum(script);
            recordMigration(jdbc, version, description, checksum, elapsed);
            log.info("Applied ClickHouse migration {} in {} ms", filename, elapsed);
        }

        return new Object();
    }

    private void createMigrationsTable(JdbcTemplate jdbc) {
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS lighthouse.schema_migrations (
                    version           String,
                    description       String,
                    checksum          String,
                    installed_on      DateTime64(3) DEFAULT now64(3),
                    execution_time_ms UInt32,
                    success           UInt8 DEFAULT 1
                ) ENGINE = MergeTree ORDER BY version
                """);
    }

    private List<Resource> scanMigrationScripts() throws IOException {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:db/clickhouse/V*.sql");
        return Arrays.stream(resources)
                .sorted(Comparator.comparingInt(r -> Integer.parseInt(extractVersion(r.getFilename()))))
                .collect(Collectors.toList());
    }

    private Set<String> getAppliedVersions(JdbcTemplate jdbc) {
        return jdbc.queryForList(
                "SELECT version FROM lighthouse.schema_migrations WHERE success = 1",
                String.class
        ).stream().collect(Collectors.toSet());
    }

    private String getChecksum(JdbcTemplate jdbc, String version) {
        List<String> checksums = jdbc.queryForList(
                "SELECT checksum FROM lighthouse.schema_migrations WHERE version = ?",
                String.class, version);
        return checksums.isEmpty() ? null : checksums.get(0);
    }

    private String extractVersion(String filename) {
        // V1__description.sql -> "1"
        int underscoreIdx = filename.indexOf("__");
        return filename.substring(1, underscoreIdx);
    }

    private String extractDescription(String filename) {
        // V1__create_logs_raw.sql -> "create_logs_raw"
        int underscoreIdx = filename.indexOf("__");
        return filename.substring(underscoreIdx + 2, filename.length() - 4);
    }

    private List<String> splitStatements(String sql) {
        return Arrays.stream(sql.split(";"))
                .map(String::trim)
                .map(this::stripLeadingComments)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private String stripLeadingComments(String statement) {
        return statement.lines()
                .dropWhile(line -> line.isBlank() || line.stripLeading().startsWith("--"))
                .collect(Collectors.joining("\n"))
                .trim();
    }

    private void executeWithRetry(JdbcTemplate jdbc, String statement, String filename) {
        long backoff = INITIAL_BACKOFF_MS;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                jdbc.execute(statement);
                return;
            } catch (Exception e) {
                if (attempt == MAX_RETRIES) {
                    log.error("Failed to execute statement in {} after {} attempts: {}",
                            filename, MAX_RETRIES, e.getMessage());
                    throw e;
                }
                log.warn("Attempt {}/{} failed for statement in {} — retrying in {} ms: {}",
                        attempt, MAX_RETRIES, filename, backoff, e.getMessage());
                try {
                    Thread.sleep(backoff);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Migration interrupted", ie);
                }
                backoff *= 2;
            }
        }
    }

    private String computeChecksum(Resource resource) throws IOException, NoSuchAlgorithmException {
        byte[] content = resource.getContentAsByteArray();
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(content);
        return HexFormat.of().formatHex(hash);
    }

    private void recordMigration(JdbcTemplate jdbc, String version, String description,
                                 String checksum, long executionTimeMs) {
        jdbc.update("""
                INSERT INTO lighthouse.schema_migrations (version, description, checksum, execution_time_ms, success)
                VALUES (?, ?, ?, ?, 1)
                """, version, description, checksum, (int) executionTimeMs);
    }
}
