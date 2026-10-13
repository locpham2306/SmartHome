package com.loc.smart_home.integration.websocket;

import com.loc.smart_home.common.dto.response.BaseResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeviceConnectionNotifier {
    private final SimpMessagingTemplate messagingTemplate;
    private volatile String status = "UNKNOWN";

    public String getStatus() {
        return status;
    }

    public synchronized void notifyStatus(String status) {
        this.status = status;
        try {
            messagingTemplate.convertAndSend("/topic/device-connection", BaseResponse.success(status));
        } catch (RuntimeException exception) {
            log.warn("Failed to send ESP32 connection notification", exception);
        }
    }
}
