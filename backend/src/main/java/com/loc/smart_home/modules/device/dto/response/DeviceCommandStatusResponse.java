package com.loc.smart_home.modules.device.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DeviceCommandStatusResponse {

    private Long historyId;
    private Integer deviceId;
    private String action;
    private String status;
    private String deviceStatus;
}