package com.loc.smart_home.modules.device.event;

import com.loc.smart_home.modules.device.dto.response.DeviceCommandStatusResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class DeviceCommandStatusChangedEvent {

    private final DeviceCommandStatusResponse data;
}