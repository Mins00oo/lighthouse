package com.app.lighthouse.infra.oracle;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ApplicationMapper {

    List<ApplicationRecord> findAll(@Param("status") String status);

    ApplicationRecord findById(@Param("appId") Long appId);

    ApplicationRecord findByServiceName(@Param("serviceName") String serviceName);

    void insert(@Param("serviceName") String serviceName,
                @Param("displayName") String displayName,
                @Param("description") String description);

    void update(@Param("appId") Long appId,
                @Param("displayName") String displayName,
                @Param("description") String description,
                @Param("status") String status);

    void delete(@Param("appId") Long appId);
}
