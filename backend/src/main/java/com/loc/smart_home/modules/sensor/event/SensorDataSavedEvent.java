package com.loc.smart_home.modules.sensor.event;

import com.loc.smart_home.modules.sensor.dto.response.SensorLatestResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class SensorDataSavedEvent {

    private final SensorLatestResponse data;
}