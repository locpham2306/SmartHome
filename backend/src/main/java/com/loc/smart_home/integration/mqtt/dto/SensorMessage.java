package com.loc.smart_home.integration.mqtt.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class SensorMessage {
    private BigDecimal temperature;
    private BigDecimal humidity;
    private BigDecimal light;
}
