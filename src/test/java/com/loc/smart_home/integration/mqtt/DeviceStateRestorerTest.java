package com.loc.smart_home.integration.mqtt;

import com.loc.smart_home.modules.device.dto.response.DeviceResponse;
import com.loc.smart_home.modules.device.service.DeviceService;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.task.TaskExecutor;
import tools.jackson.databind.json.JsonMapper;
import org.mockito.ArgumentCaptor;
import java.nio.charset.StandardCharsets;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DeviceStateRestorerTest {
    DeviceService devices = mock(DeviceService.class);
    @SuppressWarnings("unchecked")
    ObjectProvider<MqttClient> provider = mock(ObjectProvider.class);
    MqttClient client = mock(MqttClient.class);
    TaskExecutor executor = mock(TaskExecutor.class);
    JsonMapper json = JsonMapper.builder().build();
    DeviceStateRestorer restorer = new DeviceStateRestorer(devices, provider, json, executor);

    DeviceResponse device(int id, String status) {
        DeviceResponse result = new DeviceResponse();
        result.setId(id); result.setStatus(status); return result;
    }

    @Test void springContextProvidesRestoreExecutor() {
        try (var context = new org.springframework.context.annotation.AnnotationConfigApplicationContext()) {
            context.registerBean(DeviceService.class, () -> devices);
            context.registerBean(MqttClient.class, () -> client);
            context.registerBean(JsonMapper.class, () -> json);
            context.register(com.loc.smart_home.integration.mqtt.config.MqttRestoreConfig.class,
                    DeviceStateRestorer.class);
            context.refresh();
            assertNotNull(context.getBean(DeviceStateRestorer.class));
            assertNotNull(context.getBean("mqttRestoreExecutor", TaskExecutor.class));
        }
    }

    @Test void restoresExactDbStatesOffCallbackThreadWithoutRetaining() throws Exception {
        when(devices.getDevices()).thenReturn(List.of(device(1, "ON"), device(2, "OFF"), device(3, "ON")));
        when(provider.getObject()).thenReturn(client);
        restorer.restore("0123456789abcdef");
        verifyNoInteractions(client, devices);
        ArgumentCaptor<Runnable> task = ArgumentCaptor.forClass(Runnable.class);
        verify(executor).execute(task.capture());
        task.getValue().run();
        ArgumentCaptor<MqttMessage> message = ArgumentCaptor.forClass(MqttMessage.class);
        verify(client).publish(eq("device/control/restore"), message.capture());
        assertEquals(1, message.getValue().getQos());
        assertFalse(message.getValue().isRetained());
        var body = json.readTree(new String(message.getValue().getPayload(), StandardCharsets.UTF_8));
        assertEquals("0123456789abcdef", body.get("requestId").asText());
        assertEquals("ON", body.get("states").get("1").asText());
        assertEquals("OFF", body.get("states").get("2").asText());
        assertEquals("ON", body.get("states").get("3").asText());
        verify(devices).getDevices();
        verifyNoMoreInteractions(devices);
    }

    @Test void rejectsInvalidRequest() {
        restorer.restore("invalid");
        verifyNoInteractions(executor, devices, client);
    }

    @Test void missingDeviceDoesNotSendPartialRestore() {
        when(devices.getDevices()).thenReturn(List.of(device(1, "ON")));
        doAnswer(call -> { call.getArgument(0, Runnable.class).run(); return null; })
                .when(executor).execute(any());
        restorer.restore("0123456789abcdef");
        verifyNoInteractions(client, provider);
    }
}
