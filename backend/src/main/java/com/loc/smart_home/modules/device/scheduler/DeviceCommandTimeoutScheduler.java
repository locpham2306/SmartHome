package com.loc.smart_home.modules.device.scheduler;

import com.loc.smart_home.modules.device.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeviceCommandTimeoutScheduler {

    private final DeviceService deviceService;

    @Value("${device.command.timeout-seconds:30}")
    private long commandTimeoutSeconds;

    @Scheduled(fixedDelayString = "${device.command.timeout-scan-delay-ms:5000}", initialDelayString = "${device.command.timeout-scan-delay-ms:5000}")
    public void checkTimeouts() {
        LocalDateTime cutoff = LocalDateTime.now()
                .minusSeconds(commandTimeoutSeconds);

        List<Long> historyIds;

        try {
            historyIds = deviceService.findExpiredCommandIds(cutoff);
        } catch (Exception exception) {
            log.error(
                    "Failed to find expired device commands",
                    exception);
            return;
        }

        for (Long historyId : historyIds) {
            try {
                deviceService.timeoutCommand(historyId, cutoff);
            } catch (Exception exception) {
                log.error(
                        "Failed to process device command timeout: historyId={}",
                        historyId,
                        exception);
            }
        }
    }
}