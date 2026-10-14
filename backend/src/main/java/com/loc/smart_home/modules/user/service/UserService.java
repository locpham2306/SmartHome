package com.loc.smart_home.modules.user.service;

import com.loc.smart_home.modules.user.dto.response.UserResponse;

public interface UserService {
    UserResponse getProfile(Long id);
}
