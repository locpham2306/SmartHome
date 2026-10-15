package com.loc.smart_home.modules.device.service;

import com.loc.smart_home.modules.actionhistory.entity.ActionHistory;
import com.loc.smart_home.modules.actionhistory.enums.Action;
import com.loc.smart_home.modules.actionhistory.enums.ActionStatus;
import com.loc.smart_home.modules.actionhistory.repository.ActionHistoryRepository;
import com.loc.smart_home.modules.device.entity.Device;
import com.loc.smart_home.modules.device.enums.DeviceStatus;
import com.loc.smart_home.modules.device.event.DeviceCommandStatusChangedEvent;
import com.loc.smart_home.modules.device.mapper.DeviceMapper;
import com.loc.smart_home.modules.device.repository.DeviceRepository;
import com.loc.smart_home.modules.device.service.impl.DeviceServiceImpl;
import com.loc.smart_home.modules.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DeviceCommandExpiryTest {
    private final ActionHistoryRepository histories = mock(ActionHistoryRepository.class);
    private final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
    @SuppressWarnings("unchecked")
    private final DeviceServiceImpl service = new DeviceServiceImpl(
            mock(DeviceRepository.class), Mappers.getMapper(DeviceMapper.class), histories,
            mock(ObjectProvider.class), mock(UserRepository.class), events,
            mock(PlatformTransactionManager.class));
    private final LocalDateTime cutoff = LocalDateTime.of(2026, 10, 15, 12, 0);

    private ActionHistory history(ActionStatus status, LocalDateTime createdAt) {
        Device device = new Device();
        device.setId(1);
        device.setStatus(DeviceStatus.ON);
        ActionHistory history = new ActionHistory();
        history.setId(10L);
        history.setDevice(device);
        history.setAction(Action.OFF);
        history.setStatus(status);
        history.setCreatedAt(createdAt);
        when(histories.findWithLockById(10L)).thenReturn(Optional.of(history));
        return history;
    }

    @Test void expiredCommandPublishesErrorAndPreservesDeviceState() {
        ActionHistory history = history(ActionStatus.PENDING, cutoff);
        service.timeoutCommand(10L, cutoff);
        assertEquals(ActionStatus.ERROR, history.getStatus());
        assertEquals(DeviceStatus.ON, history.getDevice().getStatus());
        var event = ArgumentCaptor.forClass(DeviceCommandStatusChangedEvent.class);
        verify(events).publishEvent(event.capture());
        assertEquals("ERROR", event.getValue().getData().getStatus());
        assertEquals("ON", event.getValue().getData().getDeviceStatus());
    }

    @Test void commandStillWithinDeadlineRemainsPending() {
        ActionHistory history = history(ActionStatus.PENDING, cutoff.plusSeconds(1));
        service.timeoutCommand(10L, cutoff);
        assertEquals(ActionStatus.PENDING, history.getStatus());
        verifyNoInteractions(events);
    }

    @Test void completedCommandsAreNotOverwritten() {
        for (ActionStatus status : new ActionStatus[]{ActionStatus.SUCCESS, ActionStatus.ERROR}) {
            ActionHistory history = history(status, cutoff.minusMinutes(1));
            service.timeoutCommand(10L, cutoff);
            assertEquals(status, history.getStatus());
        }
        verifyNoInteractions(events);
    }

    @Test void missingCommandIsIgnored() {
        when(histories.findWithLockById(10L)).thenReturn(Optional.empty());
        service.timeoutCommand(10L, cutoff);
        verifyNoInteractions(events);
    }
}
