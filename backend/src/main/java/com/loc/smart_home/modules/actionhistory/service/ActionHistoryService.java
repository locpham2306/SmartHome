package com.loc.smart_home.modules.actionhistory.service;

import com.loc.smart_home.common.dto.response.PageResponse;
import com.loc.smart_home.modules.actionhistory.dto.request.ActionHistoryPageableSearchRequestDTO;
import com.loc.smart_home.modules.actionhistory.dto.response.ActionHistoryResponse;

public interface ActionHistoryService {
    PageResponse<ActionHistoryResponse> search(ActionHistoryPageableSearchRequestDTO request);
}
