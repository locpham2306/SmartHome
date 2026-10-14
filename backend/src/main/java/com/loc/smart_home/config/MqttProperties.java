package com.loc.smart_home.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "mqtt")
public class MqttProperties {
    private String brokerUrl;

    private String clientId;

    private String username;

    private String password;

    private String sensorTopic;

    private String actionStatusTopic;


    private int qos;
}
