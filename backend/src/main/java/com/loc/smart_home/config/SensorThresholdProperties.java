package com.loc.smart_home.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;

@Getter
@Setter
@Component
@Validated
@ConfigurationProperties(prefix = "sensor.thresholds")
public class SensorThresholdProperties {

    @Valid
    @NotNull
    private Threshold temperature;

    @Valid
    @NotNull
    private Threshold humidity;

    @Valid
    @NotNull
    private Threshold light;

    @Getter
    @Setter
    public static class Threshold {

        @NotNull
        private BigDecimal lower;

        @NotNull
        private BigDecimal upper;

        @AssertTrue(message = "Lower threshold must be less than upper threshold")
        public boolean isRangeValid() {
            if (lower == null || upper == null) {
                return true;
            }

            return lower.compareTo(upper) < 0;
        }
    }
}