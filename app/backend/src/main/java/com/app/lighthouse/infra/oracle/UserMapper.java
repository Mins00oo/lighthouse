package com.app.lighthouse.infra.oracle;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {

    UserRecord findByUsername(@Param("username") String username);

    void insertUser(@Param("username") String username,
                    @Param("password") String password,
                    @Param("role") String role);
}
