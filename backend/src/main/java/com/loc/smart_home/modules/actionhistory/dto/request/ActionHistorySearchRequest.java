package com.loc.smart_home.modules.actionhistory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ActionHistorySearchRequest {
    @Size(max = 100, message = "time must not exceed 100 characters")
    private String time;
    @NotBlank(message = "device is required")
    @Pattern(
            regexp = "all|Light System|Fan System|Air Condition System",
            message = "field must be all, light, fan or air condition"
    )
    private String device = "all";
    @NotBlank(message = "action is required")
    @Pattern(
            regexp = "all|ON|OFF",
            message = "action must be all, ON or OFF"
    )
    private String action = "all";
    @NotBlank(message = "action status is required")
    @Pattern(
            regexp = "all|PENDING|SUCCESS|ERROR|TIMEOUT",
            message = "action status must be all, ON or OFF"
    )
    private String actionStatus = "all";
}
