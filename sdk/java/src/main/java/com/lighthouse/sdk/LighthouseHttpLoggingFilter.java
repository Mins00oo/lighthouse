package com.lighthouse.sdk;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class LighthouseHttpLoggingFilter extends OncePerRequestFilter {

    private static final Logger accessLog = LoggerFactory.getLogger("lighthouse_access");

    private final String[] excludePaths;

    public LighthouseHttpLoggingFilter(String[] excludePaths) {
        this.excludePaths = excludePaths;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        if (shouldSkip(uri)) {
            chain.doFilter(request, response);
            return;
        }

        String method = request.getMethod();
        String path = uri;
        String clientIp = resolveClientIp(request);

        MDC.put("http_method", method);
        MDC.put("http_path", path);
        MDC.put("client_ip", clientIp);

        long start = System.currentTimeMillis();
        try {
            chain.doFilter(request, response);
        } catch (Exception e) {
            MDC.put("exception_class", e.getClass().getName());
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - start;
            MDC.put("http_status", String.valueOf(response.getStatus()));
            MDC.put("response_time_ms", String.valueOf(duration));
            accessLog.info("{} {} {} {}ms", method, path, response.getStatus(), duration);
            MDC.clear();
        }
    }

    private boolean shouldSkip(String uri) {
        return Arrays.stream(excludePaths).anyMatch(uri::startsWith);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
