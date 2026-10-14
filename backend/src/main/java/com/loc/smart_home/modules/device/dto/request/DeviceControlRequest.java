package com.loc.smart_home.modules.device.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DeviceControlRequest {
    @NotBlank(message = "action is required")
    @Pattern(regexp = "ON|OFF")
    private String action;
}
