package com.loc.smart_home.integration.websocket.listener;

import com.loc.smart_home.common.dto.response.BaseResponse;
import com.loc.smart_home.modules.sensor.event.SensorDataSavedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class SensorWebSocketListener {

    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSensorDataSaved(SensorDataSavedEvent event) {
        try {
            messagingTemplate.convertAndSend(
                    "/topic/sensors",
                    BaseResponse.success(event.getData()));
        } catch (RuntimeException exception) {
            log.error(
                    "Failed to publish committed sensor data to WebSocket",
                    exception);
        }
    }
}