package com.loc.smart_home.modules.device.controller;

import com.loc.smart_home.common.dto.response.BaseResponse;
import com.loc.smart_home.integration.websocket.DeviceConnectionNotifier;
import com.loc.smart_home.modules.device.dto.request.DeviceControlRequest;
import com.loc.smart_home.modules.device.dto.response.DeviceControlResponse;
import com.loc.smart_home.modules.device.dto.response.DeviceResponse;
import com.loc.smart_home.modules.device.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DeviceController {
    private final DeviceService deviceService;
    private final DeviceConnectionNotifier connectionNotifier;

    @GetMapping("/api/devices/connection")
    public ResponseEntity<BaseResponse<String>> getConnection() {
        return ResponseEntity.ok(BaseResponse.success(connectionNotifier.getStatus()));
    }


    @GetMapping("/api/devices")
    public ResponseEntity<BaseResponse<List<DeviceResponse>>> getDevices() {
        List<DeviceResponse> response = this.deviceService.getDevices();
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @PostMapping("/api/devices/{id}/control")
    public ResponseEntity<BaseResponse<DeviceControlResponse>> control(@PathVariable("id") Integer deviceId,
                                                                       @Valid @ParameterObject DeviceControlRequest request){
        DeviceControlResponse response = this.deviceService.control(deviceId, request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(BaseResponse.success(response));
    }
}
