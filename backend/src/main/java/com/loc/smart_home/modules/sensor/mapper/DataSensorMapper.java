package com.loc.smart_home.modules.sensor.mapper;

import com.loc.smart_home.common.base.BaseMapper;
import com.loc.smart_home.modules.sensor.dto.response.DataSensorResponse;
import com.loc.smart_home.modules.sensor.dto.response.SensorChartPointResponse;
import com.loc.smart_home.modules.sensor.entity.DataSensor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface DataSensorMapper extends BaseMapper<DataSensor, DataSensorResponse> {

    @Override
    @Mapping(target = "type", source = "sensor.name")
    @Mapping(
            target = "unit",
            source = "sensor.name",
            qualifiedByName = "resolveUnit"
    )
    DataSensorResponse toResponse(DataSensor entity);

    @Mapping(target = "type", source = "sensor.name")
    SensorChartPointResponse toChartPointResponse(DataSensor entity);

    @Named("resolveUnit")
    default String resolveUnit(String sensorName){
        if (sensorName == null){
            return null;
        }
        return switch (sensorName){
            case "Temperature" -> "°C";
            case "Humidity" -> "%";
            case "Light" -> "lux";
            default -> null;
        };
    }
}
