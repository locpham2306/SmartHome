package com.loc.smart_home.modules.sensor.dto.response;

import com.loc.smart_home.modules.sensor.enums.SensorAlertStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SensorLatestResponse {

    private DataSensorResponse temperature;
    private DataSensorResponse humidity;
    private DataSensorResponse light;

    private SensorAlertStatus temperatureAlertStatus;
    private SensorAlertStatus humidityAlertStatus;
    private SensorAlertStatus lightAlertStatus;
}