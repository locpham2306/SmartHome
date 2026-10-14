package com.loc.smart_home.modules.sensor.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class SensorChartRequest {
    @NotBlank(message = "type must not be blank")
    @Pattern(
            regexp = "Temperature|temperature|Humidity|humidity|Light|light",
            message = "type must be Temperature, Humidity or Light"
    )
    private String type = "Temperature";
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startTime;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endTime;

    @NotNull(message = "limit must not be null")
    @Min(value = 1, message = "limit must be at least 1")
    @Max(value = 1000, message = "limit must not exceed 1000")
    private Integer limit = 100;
}
