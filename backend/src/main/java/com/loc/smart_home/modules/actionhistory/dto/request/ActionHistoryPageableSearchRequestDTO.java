package com.loc.smart_home.modules.actionhistory.dto.request;

import com.loc.smart_home.common.dto.request.PageRequestDTO;
import com.loc.smart_home.modules.sensor.dto.request.SensorSearchRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ActionHistoryPageableSearchRequestDTO {
    @Valid
    @NotNull(message = "pageRequest is required")
    private PageRequestDTO pageRequest = defaultPageRequest();

    @Valid
    @NotNull(message = "searchRequest is required")
    private ActionHistorySearchRequest searchRequest =
            new ActionHistorySearchRequest();

    private static PageRequestDTO defaultPageRequest() {
        PageRequestDTO request = new PageRequestDTO();
        request.setSize(20);
        request.setSortBy("createdAt");
        request.setSortDir("desc");
        return request;
    }
}
