package com.loc.smart_home.modules.sensor.dto.request;

import com.loc.smart_home.common.dto.request.PageRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SensorPageableSearchRequestDTO {

    @Valid
    @NotNull(message = "pageRequest is required")
    private PageRequestDTO pageRequest = defaultPageRequest();

    @Valid
    @NotNull(message = "searchRequest is required")
    private SensorSearchRequest searchRequest =
            new SensorSearchRequest();

    private static PageRequestDTO defaultPageRequest() {
        PageRequestDTO request = new PageRequestDTO();
        request.setSize(20);
        request.setSortBy("time");
        request.setSortDir("desc");
        return request;
    }
}