package com.loc.smart_home.modules.user.controller;

import com.loc.smart_home.common.dto.response.BaseResponse;
import com.loc.smart_home.modules.user.dto.response.UserResponse;
import com.loc.smart_home.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/api/profile/{id}")
    public ResponseEntity<BaseResponse<UserResponse>> getProfile(@PathVariable("id") Long id){
        UserResponse userResponse = this.userService.getProfile(id);
        return ResponseEntity.ok(BaseResponse.success(userResponse));
    }
}
