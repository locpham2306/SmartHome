package com.loc.smart_home.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String studentId;
    private String email;
    private String phone;
    private String githubLink;
    private String figmaLink;
    private String apiDocsLink;
}
