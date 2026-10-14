package com.loc.smart_home.integration.mqtt.config;

import com.loc.smart_home.config.MqttProperties;
import com.loc.smart_home.integration.mqtt.listener.MqttMessageListener;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class MqttConfig {
    private final MqttProperties mqttProperties;
    private final MqttMessageListener mqttMessageListener;
    private MqttClient client;

    @Bean(destroyMethod = "")
    public MqttClient mqttClient() throws MqttException {
        client = new MqttClient(
                mqttProperties.getBrokerUrl(),
                mqttProperties.getClientId(),
                new MemoryPersistence()
        );

        MqttConnectOptions options = new MqttConnectOptions();
        options.setAutomaticReconnect(true);
        options.setCleanSession(true);
        options.setConnectionTimeout(10);
        options.setKeepAliveInterval(30);

        if (StringUtils.hasText(mqttProperties.getUsername())) {
            options.setUserName(mqttProperties.getUsername());

            if (mqttProperties.getPassword() != null) {
                options.setPassword(
                        mqttProperties.getPassword().toCharArray()
                );
            }
        }

        // Listener cần client để subscribe khi kết nối thành công.
        mqttMessageListener.setClient(client);

        // Gắn callback trước khi kết nối.
        client.setCallback(mqttMessageListener);

        try {
            client.connect(options);
        } catch (MqttException exception) {
            shutdown();
            throw exception;
        }

        return client;
    }

    @PreDestroy
    public void shutdown() {
        if (client == null) {
            return;
        }

        try {
            if (client.isConnected()) {
                client.disconnect();
            }
        } catch (MqttException exception) {
            log.warn("Failed to disconnect MQTT client", exception);
        } finally {
            try {
                client.close(true);
            } catch (MqttException exception) {
                log.warn("Failed to close MQTT client", exception);
            }
        }
    }
}
