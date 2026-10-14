package com.loc.smart_home.modules.actionhistory.service.impl;

import com.loc.smart_home.common.dto.response.PageResponse;
import com.loc.smart_home.modules.actionhistory.dto.request.ActionHistoryPageableSearchRequestDTO;
import com.loc.smart_home.modules.actionhistory.dto.request.ActionHistorySearchRequest;
import com.loc.smart_home.modules.actionhistory.dto.response.ActionHistoryResponse;
import com.loc.smart_home.modules.actionhistory.enums.Action;
import com.loc.smart_home.modules.actionhistory.enums.ActionStatus;
import com.loc.smart_home.modules.actionhistory.mapper.ActionHistoryMapper;
import com.loc.smart_home.modules.actionhistory.repository.ActionHistoryRepository;
import com.loc.smart_home.modules.actionhistory.service.ActionHistoryService;
import com.loc.smart_home.utils.PageableSearchUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class ActionHistoryServiceImpl implements ActionHistoryService {

    private final ActionHistoryRepository actionHistoryRepository;
    private final ActionHistoryMapper actionHistoryMapper;
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ActionHistoryResponse> search(ActionHistoryPageableSearchRequestDTO request) {
        ActionHistorySearchRequest searchRequest = request.getSearchRequest();
        String time = buildTimePattern(searchRequest.getTime());
        String device = "all".equals(searchRequest.getDevice()) ? null : searchRequest.getDevice();
        Action action = "all".equals(searchRequest.getAction()) ? null : Action.valueOf(searchRequest.getAction());
        ActionStatus actionStatus = "all".equals((searchRequest.getActionStatus())) ? null : ActionStatus.valueOf(searchRequest.getActionStatus());

        return PageableSearchUtils.search(
                pageable -> actionHistoryRepository.search(
                        time,
                        device,
                        action,
                        actionStatus,
                        pageable
                ),
                request.getPageRequest(),
                ALLOWED_SORT_FIELDS,
                actionHistoryMapper::toResponse

        );
    }

    private String buildTimePattern (String time){
        if(time == null || time.trim().isEmpty()){
            return  null;
        }
        String keyword = time.trim();
        keyword = keyword
                .replace("!", "!!")
                .replace("%", "!%")
                .replace("_", "!_");

        return "%" + keyword + "%";
    }

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of("id", "createdAt");
}
