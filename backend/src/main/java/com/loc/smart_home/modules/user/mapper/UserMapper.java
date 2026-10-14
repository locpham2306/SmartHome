package com.loc.smart_home.modules.user.mapper;

import com.loc.smart_home.common.base.BaseMapper;
import com.loc.smart_home.modules.user.dto.response.UserResponse;
import com.loc.smart_home.modules.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface UserMapper extends BaseMapper<User, UserResponse> {
}
