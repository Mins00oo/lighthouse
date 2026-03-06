package com.app.lighthouse.global.init;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.app.lighthouse.infra.oracle.UserMapper;
import com.app.lighthouse.infra.oracle.UserRecord;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 애플리케이션 최초 기동 시 관리자 계정이 존재하지 않으면 자동 생성.
 *
 * <p>운영 환경에서는 환경변수로 자격증명을 주입하고,
 * 계정 생성 후 INIT_ADMIN_ENABLED=false 로 비활성화를 권장.</p>
 *
 * <pre>
 *   INIT_ADMIN_ENABLED=true
 *   INIT_ADMIN_USERNAME=admin
 *   INIT_ADMIN_PASSWORD=your-secure-password
 * </pre>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAccountInitializer implements ApplicationRunner {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.init-admin.enabled:true}")
    private boolean enabled;

    @Value("${app.init-admin.username:admin}")
    private String username;

    @Value("${app.init-admin.password:changeme}")
    private String password;

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.debug("AdminAccountInitializer disabled.");
            return;
        }

        UserRecord existing = userMapper.findByUsername(username);
        if (existing != null) {
            log.debug("Admin account '{}' already exists. Skipping initialization.", username);
            return;
        }

        String encodedPassword = passwordEncoder.encode(password);
        userMapper.insertUser(username, encodedPassword, "ADMIN");
        log.info("Initial admin account created: username='{}'", username);
    }
}
