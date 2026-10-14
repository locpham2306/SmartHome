package com.loc.smart_home.modules.actionhistory.mapper;

import com.loc.smart_home.common.base.BaseMapper;
import com.loc.smart_home.modules.actionhistory.dto.response.ActionHistoryResponse;
import com.loc.smart_home.modules.actionhistory.entity.ActionHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ActionHistoryMapper extends BaseMapper<ActionHistory, ActionHistoryResponse> {
    @Override
    @Mapping(target = "time", source = "createdAt")
    @Mapping(target = "operator", source = "user.name")
    @Mapping(target = "device", source = "device.name")
    ActionHistoryResponse toResponse(ActionHistory entity);

}
