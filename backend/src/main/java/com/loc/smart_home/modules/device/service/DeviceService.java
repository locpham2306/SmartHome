package com.loc.smart_home.modules.device.service;

import com.loc.smart_home.modules.actionhistory.enums.ActionStatus;
import com.loc.smart_home.modules.device.dto.request.DeviceControlRequest;
import com.loc.smart_home.modules.device.dto.response.DeviceControlResponse;
import com.loc.smart_home.modules.device.dto.response.DeviceResponse;

import java.time.LocalDateTime;
import java.util.List;

import com.loc.smart_home.modules.actionhistory.enums.Action;

public interface DeviceService {
    List<DeviceResponse> getDevices();

    DeviceControlResponse control(Integer deviceId, DeviceControlRequest request);

    void acknowledge(
            Integer deviceId,
            Long historyId,
            Action action,
            ActionStatus status);

    List<Long> findExpiredCommandIds(LocalDateTime cutoff);

    void timeoutCommand(Long historyId, LocalDateTime cutoff);
}
