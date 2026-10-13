package com.loc.smart_home.integration.mqtt.listener;

import com.loc.smart_home.config.MqttProperties;
import com.loc.smart_home.integration.websocket.DeviceConnectionNotifier;
import com.loc.smart_home.exception.BusinessException;
import com.loc.smart_home.integration.mqtt.dto.DeviceAckMessage;
import com.loc.smart_home.integration.mqtt.dto.SensorMessage;
import com.loc.smart_home.modules.actionhistory.enums.Action;
import com.loc.smart_home.modules.actionhistory.enums.ActionStatus;
import com.loc.smart_home.modules.device.service.DeviceService;
import com.loc.smart_home.modules.sensor.service.SensorService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.MqttTopic;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class MqttMessageListener implements MqttCallbackExtended {

    private final MqttProperties mqttProperties;
    private final JsonMapper jsonMapper;
    private final SensorService sensorService;
    private final DeviceService deviceService;
    private final Validator validator;
    private final DeviceConnectionNotifier connectionNotifier;

    @Setter
    private MqttClient client;

    @Override
    public void connectComplete(boolean reconnect, String serverURI) {
        log.info(
                "MQTT connected: server={}, reconnect={}",
                serverURI,
                reconnect);
        // đăng ký nhận tin
        subscribeTopic(mqttProperties.getSensorTopic());
        subscribeTopic(mqttProperties.getActionStatusTopic());
    }

    // đăng ký nhận tin
    private void subscribeTopic(String topic) {
        try {
            client.subscribe(topic, mqttProperties.getQos());

            log.info(
                    "Subscribed to topic {} with QoS {}",
                    topic,
                    mqttProperties.getQos());
        } catch (MqttException exception) {
            log.error(
                    "Failed to subscribe to topic " + topic,
                    exception);
        }
    }

    // mất kết nối
    @Override
    public void connectionLost(Throwable cause) {
        log.warn("MQTT connection lost", cause);
        connectionNotifier.notifyStatus("UNKNOWN");
    }

    // điểm đầu vào của mọi tin nhắn nhận được
    @Override
    public void messageArrived(
            String topic,
            MqttMessage message) throws Exception {
        boolean sensorTopic = mqttProperties.getSensorTopic().equals(topic);

        boolean actionStatusTopic = MqttTopic.isMatched(
                mqttProperties.getActionStatusTopic(),
                topic);

        if (!sensorTopic && !actionStatusTopic) {
            return;
        }
        // đổi từ byte sang chuỗi
        String payload = new String(
                message.getPayload(),
                StandardCharsets.UTF_8);

        try {
            if ("device/status/connection".equals(topic)) {
                // Đây là trạng thái kết nối của cả ESP32, không phải ACK điều khiển LED.
                if ("OFFLINE".equals(payload)) {
                    log.warn("ESP32 mất kết nối. Kiểm tra nguồn điện hoặc Wi-Fi.");
                    connectionNotifier.notifyStatus("OFFLINE");
                } else if ("ONLINE".equals(payload)) {
                    log.info("ESP32 đã kết nối MQTT.");
                    connectionNotifier.notifyStatus("ONLINE");
                } else {
                    log.warn("Discarding invalid ESP32 connection status on topic {}", topic);
                }
            } else if (sensorTopic) {
                SensorMessage sensorMessage = jsonMapper.readValue(payload, SensorMessage.class);
                // lưu dữ liệu cảm biến
                sensorService.saveSensorData(sensorMessage);
            } else {
                handleDeviceAck(topic, payload);
            }
        } catch (JacksonException exception) { // JSON không đọc được hoặc không khớp kiểu DTO
            log.warn(
                    "Discarding invalid JSON on topic {}: {}",
                    topic,
                    exception.getMessage());
        } catch (BusinessException exception) { // Dữ liệu/topic/nghiệp vụ không hợp lệ
            if (exception.getStatus().is4xxClientError()) {
                log.warn(
                        "Discarding invalid MQTT message: topic={}, code={}, message={}",
                        topic,
                        exception.getStrCode(),
                        exception.getMessage());
                return;
            }

            log.error( // lỗi khác vừa log vừa ném
                    "MQTT processing failed on topic " + topic,
                    exception);
            throw exception;
        } catch (Exception exception) { // log và ném tiếp
            log.error(
                    "Unexpected MQTT processing error on topic " + topic,
                    exception);
            throw exception;
        }
    }

    // xử lí tin điều khiển
    private void handleDeviceAck(String topic, String payload) {
        Integer deviceId = extractDeviceId(topic);
        // chuyển json thành đối tượng
        DeviceAckMessage ack = jsonMapper.readValue(payload, DeviceAckMessage.class);

        if (ack == null) {
            throw new BusinessException(
                    "INVALID_DEVICE_ACK",
                    "Device ACK payload must not be null");
        }

        Set<ConstraintViolation<DeviceAckMessage>> violations = validator.validate(ack);
        // tập các lỗi được tìm thấy
        if (!violations.isEmpty()) {
            String message = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .distinct()
                    .sorted()
                    .collect(Collectors.joining("; "));

            throw new BusinessException(
                    "INVALID_DEVICE_ACK",
                    message);
        }
        // gọi service xử lí tin ack
        deviceService.acknowledge(
                deviceId,
                ack.getHistoryId(),
                Action.valueOf(ack.getAction()),
                ActionStatus.valueOf(ack.getStatus()));
    }

    // lấy id cuối topic ack (tin điều khiển)
    private Integer extractDeviceId(String topic) {
        String value = topic.substring(topic.lastIndexOf('/') + 1);

        if (!value.matches("[1-9][0-9]*")) {
            throw new BusinessException(
                    "INVALID_DEVICE_ACK_TOPIC",
                    "Device ACK topic must end with a positive device ID");
        }

        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException exception) {
            throw new BusinessException(
                    "INVALID_DEVICE_ACK_TOPIC",
                    "Device ID exceeds the supported integer range");
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // MQTT delivery completion is not device execution confirmation.
    }
}