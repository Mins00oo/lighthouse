package com.app.lighthouse.domain.auth.service;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.app.lighthouse.infra.oracle.UserMapper;
import com.app.lighthouse.infra.oracle.UserRecord;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserRecord user = userMapper.findByUsername(username);
        if (user == null) {
            // 존재하지 않는 사용자임을 로그에 남기되, 클라이언트에는 구체적 이유를 노출하지 않음
            log.warn("Login attempt for unknown username: {}", username);
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username);
        }

        // DB에 저장된 BCrypt-encoded password를 그대로 반환.
        // Spring Security DaoAuthenticationProvider가 passwordEncoder.matches()로 검증.
        return new User(
                user.username(),
                user.password(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.role()))
        );
    }
}
