package com.loc.smart_home.modules.sensor.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class DataSensorResponse {
    private Long id;
    private LocalDateTime time;
    private String type;
    private BigDecimal value;
    private String unit;
}
