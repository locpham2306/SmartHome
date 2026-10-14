package com.loc.smart_home.modules.device.service.impl;

import com.loc.smart_home.exception.BusinessException;
import com.loc.smart_home.modules.actionhistory.entity.ActionHistory;
import com.loc.smart_home.modules.actionhistory.enums.Action;
import com.loc.smart_home.modules.actionhistory.enums.ActionStatus;
import com.loc.smart_home.modules.actionhistory.repository.ActionHistoryRepository;
import com.loc.smart_home.modules.device.dto.request.DeviceControlRequest;
import com.loc.smart_home.modules.device.dto.response.DeviceControlResponse;
import com.loc.smart_home.modules.device.dto.response.DeviceResponse;
import com.loc.smart_home.modules.device.entity.Device;
import com.loc.smart_home.modules.device.enums.DeviceStatus;
import com.loc.smart_home.modules.device.event.DeviceCommandStatusChangedEvent;
import com.loc.smart_home.modules.device.mapper.DeviceMapper;
import com.loc.smart_home.modules.device.repository.DeviceRepository;
import com.loc.smart_home.modules.device.service.DeviceService;
import com.loc.smart_home.modules.user.entity.User;
import com.loc.smart_home.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.beans.factory.ObjectProvider;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeviceServiceImpl implements DeviceService {
        private final DeviceRepository deviceRepository;
        private final DeviceMapper deviceMapper;
        private final ActionHistoryRepository actionHistoryRepository;
        private final ObjectProvider<MqttClient> mqttClientProvider;
        private final UserRepository userRepository;
        private final ApplicationEventPublisher eventPublisher;
        private final PlatformTransactionManager transactionManager;

        @Value("${user-id}")
        private Long userId;

        @Override
        public List<DeviceResponse> getDevices() {
                List<Device> devices = this.deviceRepository.findAll();
                return deviceMapper.toResponseList(devices);
        }

        @Override
        public DeviceControlResponse control(Integer deviceId, DeviceControlRequest request) {
                if (actionHistoryRepository.existsByDevice_IdAndStatus(
                                deviceId, ActionStatus.PENDING)) {
                        throw new BusinessException(
                                        HttpStatus.CONFLICT,
                                        "DEVICE_COMMAND_PENDING",
                                        "Device already has a pending command");
                }
                Action action = Action.valueOf(request.getAction());
                Device device = this.deviceRepository.findById(deviceId).orElseThrow(() -> new BusinessException(
                                HttpStatus.NOT_FOUND,
                                "DEVICE_NPT_FOUND",
                                "Device not found"));
                if (device.getStatus().name().equals(action.name())) {
                        throw new BusinessException(
                                        HttpStatus.CONFLICT,
                                        "DEVICE_ALREADY_IN_STATE",
                                        "Device is already " + action.name());
                }
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new BusinessException(
                                                HttpStatus.NOT_FOUND,
                                                "USER_NOT_FOUND",
                                                "User not found"));
                ActionHistory actionHistory = new ActionHistory();
                actionHistory.setDevice(device);
                actionHistory.setUser(user);
                actionHistory.setAction(action);
                actionHistory.setStatus(ActionStatus.PENDING);
                ActionHistory savedHistory = this.actionHistoryRepository.save(actionHistory);
                String topic = "device/control/" + device.getId();

                String payload = """
                                {
                                    "historyId": %d,
                                    "action": "%s"
                                }
                                """.formatted(savedHistory.getId(), action.name());

                MqttMessage message = new MqttMessage(
                                payload.getBytes(StandardCharsets.UTF_8));
                message.setQos(1);
                message.setRetained(false);

                try {
                        MqttClient mqttClient = mqttClientProvider.getObject();
                        mqttClient.publish(topic, message);
                } catch (MqttException exception) {
                        markPublishFailed(savedHistory.getId());

                        throw new BusinessException(
                                        HttpStatus.SERVICE_UNAVAILABLE,
                                        "MQTT_PUBLISH_FAILED",
                                        "Could not send device command");
                }

                DeviceControlResponse response = new DeviceControlResponse();
                response.setHistoryId(savedHistory.getId());
                response.setDeviceId(device.getId());
                response.setAction(action.name());
                response.setStatus(savedHistory.getStatus().name());

                return response;

        }

        @Override
        @Transactional
        public void acknowledge(
                        Integer deviceId,
                        Long historyId,
                        Action action,
                        ActionStatus status) {
                if (deviceId == null || deviceId <= 0
                                || historyId == null || historyId <= 0
                                || action == null
                                || (status != ActionStatus.SUCCESS
                                                && status != ActionStatus.ERROR)) {
                        throw new BusinessException(
                                        HttpStatus.BAD_REQUEST,
                                        "INVALID_DEVICE_ACK",
                                        "Device ACK requires positive deviceId and historyId, "
                                                        + "an action, and status SUCCESS or ERROR");
                }

                ActionHistory history = actionHistoryRepository
                                .findWithLockById(historyId)
                                .orElseThrow(() -> new BusinessException(
                                                HttpStatus.NOT_FOUND,
                                                "DEVICE_ACK_HISTORY_NOT_FOUND",
                                                "Device ACK history not found"));

                Device device = history.getDevice();

                if (!device.getId().equals(deviceId)
                                || history.getAction() != action) {
                        throw new BusinessException(
                                        HttpStatus.BAD_REQUEST,
                                        "DEVICE_ACK_MISMATCH",
                                        "Device ACK does not match the recorded device and action");
                }

                if (history.getStatus() != ActionStatus.PENDING) {
                        log.debug(
                                        "Ignoring device ACK for completed history: historyId={}, status={}",
                                        historyId, history.getStatus());
                        return;
                }

                history.setStatus(status);

                if (status == ActionStatus.SUCCESS) {
                        device.setStatus(
                                        action == Action.ON
                                                        ? DeviceStatus.ON
                                                        : DeviceStatus.OFF);
                }

                publishCommandStatus(history);
        }

        @Override
        @Transactional(readOnly = true)
        public List<Long> findExpiredCommandIds(LocalDateTime cutoff) {
                return actionHistoryRepository.findExpiredIds(
                                ActionStatus.PENDING,
                                cutoff,
                                PageRequest.of(0, 100));
        }

        @Override
        @Transactional
        public void timeoutCommand(Long historyId, LocalDateTime cutoff) {
                ActionHistory history = actionHistoryRepository
                                .findWithLockById(historyId)
                                .orElse(null);

                if (history == null
                                || history.getStatus() != ActionStatus.PENDING) {
                        return;
                }

                if (history.getCreatedAt().isAfter(cutoff)) {
                        return;
                }

                history.setStatus(ActionStatus.TIMEOUT);
                publishCommandStatus(history);
        }

        private void publishCommandStatus(ActionHistory history) {
                eventPublisher.publishEvent(
                                new DeviceCommandStatusChangedEvent(
                                                deviceMapper.toCommandStatusResponse(history)));
        }

        private void markPublishFailed(Long historyId) {
                TransactionTemplate transaction = new TransactionTemplate(transactionManager);

                transaction.setPropagationBehavior(
                                TransactionDefinition.PROPAGATION_REQUIRES_NEW);

                transaction.executeWithoutResult(transactionStatus -> {
                        ActionHistory history = actionHistoryRepository
                                        .findWithLockById(historyId)
                                        .orElse(null);

                        if (history == null
                                        || history.getStatus() != ActionStatus.PENDING) {
                                return;
                        }

                        history.setStatus(ActionStatus.ERROR);
                        publishCommandStatus(history);
                });
        }
}
