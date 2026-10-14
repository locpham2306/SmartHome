package com.loc.smart_home.modules.user.service.impl;

import com.loc.smart_home.exception.BusinessException;
import com.loc.smart_home.modules.user.dto.response.UserResponse;
import com.loc.smart_home.modules.user.entity.User;
import com.loc.smart_home.modules.user.mapper.UserMapper;
import com.loc.smart_home.modules.user.repository.UserRepository;
import com.loc.smart_home.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserResponse getProfile(Long id) {
        if(id == null || id <= 0){
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_USER_ID", "User id must be greater than 0");
        }
        User user = this.userRepository.findById(id).orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER NOT FOUND", "User not found"));
        return userMapper.toResponse(user);
    }
}
