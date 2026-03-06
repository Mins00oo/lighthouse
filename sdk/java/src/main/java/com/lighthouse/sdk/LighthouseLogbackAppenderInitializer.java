package com.lighthouse.sdk;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.rolling.RollingFileAppender;
import ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy;
import ch.qos.logback.core.util.FileSize;
import net.logstash.logback.encoder.LogstashEncoder;
import net.logstash.logback.fieldnames.LogstashFieldNames;
import net.logstash.logback.stacktrace.ShortenedThrowableConverter;
import org.slf4j.LoggerFactory;
import org.springframework.context.SmartLifecycle;
import org.springframework.core.env.Environment;

import java.net.InetAddress;
import java.nio.file.Path;

public class LighthouseLogbackAppenderInitializer implements SmartLifecycle {

    private static final String APPENDER_NAME = "LIGHTHOUSE_JSON_FILE";

    private final LighthouseLoggingProperties properties;
    private final Environment environment;
    private volatile boolean running = false;

    public LighthouseLogbackAppenderInitializer(LighthouseLoggingProperties properties,
                                                 Environment environment) {
        this.properties = properties;
        this.environment = environment;
    }

    @Override
    public void start() {
        if (!properties.isEnabled()) {
            return;
        }

        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        Logger rootLogger = context.getLogger(Logger.ROOT_LOGGER_NAME);

        if (rootLogger.getAppender(APPENDER_NAME) != null) {
            running = true;
            return;
        }

        String serviceName = resolveServiceName();
        String hostname = resolveHostname();

        // Encoder
        LogstashEncoder encoder = new LogstashEncoder();
        encoder.setContext(context);

        LogstashFieldNames fieldNames = new LogstashFieldNames();
        fieldNames.setTimestamp("@timestamp");
        fieldNames.setVersion("[ignore]");
        fieldNames.setLevelValue("[ignore]");
        encoder.setFieldNames(fieldNames);

        encoder.setCustomFields("{\"service\":\"" + serviceName + "\",\"host\":\"" + hostname + "\"}");

        encoder.addIncludeMdcKeyName("http_method");
        encoder.addIncludeMdcKeyName("http_path");
        encoder.addIncludeMdcKeyName("http_status");
        encoder.addIncludeMdcKeyName("response_time_ms");
        encoder.addIncludeMdcKeyName("client_ip");
        encoder.addIncludeMdcKeyName("exception_class");

        ShortenedThrowableConverter throwableConverter = new ShortenedThrowableConverter();
        throwableConverter.setMaxDepthPerThrowable(30);
        throwableConverter.setShortenedClassNameLength(36);
        throwableConverter.setRootCauseFirst(true);
        encoder.setThrowableConverter(throwableConverter);

        encoder.start();

        // Rolling file appender
        String logDir = properties.getLogDir();
        String fileName = properties.getFileName();
        Path logFile = Path.of(logDir, serviceName, fileName);
        String baseNameNoExt = fileName.replaceAll("\\.log$", "");
        Path rollingPattern = Path.of(logDir, serviceName,
                baseNameNoExt + ".%d{yyyy-MM-dd}.%i.log");

        RollingFileAppender<ILoggingEvent> appender = new RollingFileAppender<>();
        appender.setContext(context);
        appender.setName(APPENDER_NAME);
        appender.setFile(logFile.toString());
        appender.setEncoder(encoder);

        SizeAndTimeBasedRollingPolicy<ILoggingEvent> rollingPolicy =
                new SizeAndTimeBasedRollingPolicy<>();
        rollingPolicy.setContext(context);
        rollingPolicy.setParent(appender);
        rollingPolicy.setFileNamePattern(rollingPattern.toString());
        rollingPolicy.setMaxFileSize(FileSize.valueOf(properties.getMaxFileSize()));
        rollingPolicy.setMaxHistory(properties.getMaxHistory());
        rollingPolicy.setTotalSizeCap(FileSize.valueOf(properties.getTotalSizeCap()));
        rollingPolicy.start();

        appender.setRollingPolicy(rollingPolicy);
        appender.start();

        rootLogger.addAppender(appender);
        running = true;
    }

    private String resolveServiceName() {
        // 1) Explicit lighthouse.logging.service-name
        String name = properties.getServiceName();
        if (name != null && !name.isBlank()) {
            return name;
        }

        // 2) spring.application.name
        name = environment.getProperty("spring.application.name");
        if (name != null && !name.isBlank()) {
            return name;
        }

        // 3) Fallback to main class simple name
        String mainClass = environment.getProperty("sun.java.command");
        if (mainClass != null && !mainClass.isBlank()) {
            String className = mainClass.split("\\s")[0];
            int lastDot = className.lastIndexOf('.');
            if (lastDot >= 0) {
                return className.substring(lastDot + 1);
            }
            return className;
        }

        return "unknown-app";
    }

    private String resolveHostname() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (Exception e) {
            return "unknown-host";
        }
    }

    @Override
    public void stop() {
        running = false;
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public int getPhase() {
        return SmartLifecycle.DEFAULT_PHASE - 1000;
    }
}
