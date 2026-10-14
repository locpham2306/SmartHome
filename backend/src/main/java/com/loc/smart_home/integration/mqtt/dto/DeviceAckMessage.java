package com.loc.smart_home.integration.mqtt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DeviceAckMessage {

    @NotNull(message = "historyId is required")
    @Positive(message = "historyId must be greater than 0")
    private Long historyId;

    @NotBlank(message = "action is required")
    @Pattern(regexp = "ON|OFF", message = "action must be ON or OFF")
    private String action;

    @NotBlank(message = "status is required")
    @Pattern(regexp = "SUCCESS|ERROR", message = "status must be SUCCESS or ERROR")
    private String status;
}