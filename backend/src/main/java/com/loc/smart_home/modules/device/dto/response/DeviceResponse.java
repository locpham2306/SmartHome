package com.loc.smart_home.modules.device.dto.response;

import com.loc.smart_home.modules.device.enums.DeviceStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DeviceResponse {
    private Integer id;
    private String name;
    private String status;
}
