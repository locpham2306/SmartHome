package com.loc.smart_home.modules.actionhistory.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ActionHistoryResponse {
    private Long id;
    private LocalDateTime time;
    private String operator;
    private String device;
    private String action;
    private String status;
}
