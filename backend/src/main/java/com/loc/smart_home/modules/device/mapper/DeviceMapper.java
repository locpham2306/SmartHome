package com.loc.smart_home.modules.device.mapper;

import com.loc.smart_home.common.base.BaseMapper;
import com.loc.smart_home.modules.actionhistory.entity.ActionHistory;
import com.loc.smart_home.modules.device.dto.response.DeviceCommandStatusResponse;
import com.loc.smart_home.modules.device.dto.response.DeviceResponse;
import com.loc.smart_home.modules.device.entity.Device;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface DeviceMapper extends BaseMapper<Device, DeviceResponse> {

    @Mapping(target = "historyId", source = "id")
    @Mapping(target = "deviceId", source = "device.id")
    @Mapping(target = "deviceStatus", source = "device.status")
    DeviceCommandStatusResponse toCommandStatusResponse(
            ActionHistory history);
}