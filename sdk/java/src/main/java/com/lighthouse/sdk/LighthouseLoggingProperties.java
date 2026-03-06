package com.lighthouse.sdk;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "lighthouse.logging")
public class LighthouseLoggingProperties {

    private boolean enabled = true;

    private String serviceName;

    private String logDir;

    private String fileName = "app.log";

    private String maxFileSize = "100MB";

    private int maxHistory = 7;

    private String totalSizeCap = "1GB";

    private boolean httpFilterEnabled = true;

    private String[] excludePaths = {
            "/css/", "/js/", "/images/", "/favicon",
            "/actuator", "/swagger-ui", "/v3/api-docs"
    };

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getLogDir() {
        return logDir;
    }

    public void setLogDir(String logDir) {
        this.logDir = logDir;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getMaxFileSize() {
        return maxFileSize;
    }

    public void setMaxFileSize(String maxFileSize) {
        this.maxFileSize = maxFileSize;
    }

    public int getMaxHistory() {
        return maxHistory;
    }

    public void setMaxHistory(int maxHistory) {
        this.maxHistory = maxHistory;
    }

    public String getTotalSizeCap() {
        return totalSizeCap;
    }

    public void setTotalSizeCap(String totalSizeCap) {
        this.totalSizeCap = totalSizeCap;
    }

    public boolean isHttpFilterEnabled() {
        return httpFilterEnabled;
    }

    public void setHttpFilterEnabled(boolean httpFilterEnabled) {
        this.httpFilterEnabled = httpFilterEnabled;
    }

    public String[] getExcludePaths() {
        return excludePaths;
    }

    public void setExcludePaths(String[] excludePaths) {
        this.excludePaths = excludePaths;
    }
}
