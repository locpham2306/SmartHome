package com.loc.smart_home.modules.sensor.service;

import com.loc.smart_home.common.dto.response.PageResponse;
import com.loc.smart_home.integration.mqtt.dto.SensorMessage;
import com.loc.smart_home.modules.sensor.dto.request.SensorChartRequest;
import com.loc.smart_home.modules.sensor.dto.request.SensorPageableSearchRequestDTO;
import com.loc.smart_home.modules.sensor.dto.response.DataSensorResponse;
import com.loc.smart_home.modules.sensor.dto.response.SensorChartPointResponse;
import com.loc.smart_home.modules.sensor.dto.response.SensorLatestResponse;

import java.util.List;

public interface SensorService {
    void saveSensorData(SensorMessage message);
    PageResponse<DataSensorResponse> search(SensorPageableSearchRequestDTO request);

    SensorLatestResponse getLatest();

    List<SensorChartPointResponse> getChart(SensorChartRequest request);

}
