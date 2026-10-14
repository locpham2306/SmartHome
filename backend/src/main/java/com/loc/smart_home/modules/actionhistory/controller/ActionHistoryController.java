package com.loc.smart_home.modules.actionhistory.controller;

import com.loc.smart_home.common.dto.response.BaseResponse;
import com.loc.smart_home.common.dto.response.PageResponse;
import com.loc.smart_home.modules.actionhistory.dto.request.ActionHistoryPageableSearchRequestDTO;
import com.loc.smart_home.modules.actionhistory.dto.response.ActionHistoryResponse;
import com.loc.smart_home.modules.actionhistory.service.ActionHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ActionHistoryController {
    private final ActionHistoryService actionHistoryService;
    @GetMapping("api/action-history")
    public ResponseEntity<BaseResponse<PageResponse<ActionHistoryResponse>>> search(@Valid @ParameterObject ActionHistoryPageableSearchRequestDTO request){
        PageResponse<ActionHistoryResponse> response = this.actionHistoryService.search(request);
        return ResponseEntity.ok(BaseResponse.success(response));
    }
}
