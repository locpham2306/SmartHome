package com.loc.smart_home.integration.mqtt;

import com.loc.smart_home.modules.device.service.DeviceService;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;

@Component
@Slf4j
public class DeviceStateRestorer {
    private final DeviceService deviceService;
    private final ObjectProvider<MqttClient> clientProvider;
    private final JsonMapper jsonMapper;
    private final TaskExecutor executor;

    public DeviceStateRestorer(DeviceService deviceService, ObjectProvider<MqttClient> clientProvider,
                              JsonMapper jsonMapper,
                              @Qualifier("mqttRestoreExecutor") TaskExecutor executor) {
        this.deviceService = deviceService;
        this.clientProvider = clientProvider;
        this.jsonMapper = jsonMapper;
        this.executor = executor;
    }

    public void restore(String requestId) {
        if (!requestId.matches("[0-9a-fA-F]{16}")) {
            log.warn("Discarding invalid ESP32 restore request");
            return;
        }
        // Không chờ PUBACK trên MQTT callback thread.
        executor.execute(() -> {
            try {
                Map<String, String> states = new TreeMap<>();
                deviceService.getDevices().stream()
                        .filter(device -> device.getId() >= 1 && device.getId() <= 3)
                        .forEach(device -> states.put(device.getId().toString(), device.getStatus()));
                if (states.size() != 3 || states.values().stream()
                        .anyMatch(state -> !"ON".equals(state) && !"OFF".equals(state))) {
                    log.warn("Cannot restore ESP32: expected states for devices 1, 2, 3");
                    return;
                }
                String payload = jsonMapper.writeValueAsString(Map.of("requestId", requestId, "states", states));
                MqttMessage message = new MqttMessage(payload.getBytes(StandardCharsets.UTF_8));
                message.setQos(1);
                message.setRetained(false);
                clientProvider.getObject().publish("device/control/restore", message);
                log.info("Sent saved device states to ESP32: requestId={}", requestId);
            } catch (Exception exception) {
                log.warn("Failed to restore ESP32 states; board will retry", exception);
            }
        });
    }
}
