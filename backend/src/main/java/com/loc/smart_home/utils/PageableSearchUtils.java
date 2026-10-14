package com.loc.smart_home.utils;

import com.loc.smart_home.common.dto.request.PageRequestDTO;
import com.loc.smart_home.common.dto.response.PageResponse;
import com.loc.smart_home.exception.BusinessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;
import java.util.function.Function;

public final class PageableSearchUtils {

    private PageableSearchUtils() {
    }

    public static <E, R> PageResponse<R> search(
            Function<Pageable, Page<E>> finder,
            PageRequestDTO request,
            Set<String> allowedSortFields,
            Function<E, R> mapper
    ) {
        Pageable pageable = toPageable(request, allowedSortFields);

        Page<E> entityPage = finder.apply(pageable);
        Page<R> responsePage = entityPage.map(mapper);

        return PageResponse.from(responsePage);
    }

    private static Pageable toPageable(
            PageRequestDTO request,
            Set<String> allowedSortFields
    ) {
        if (request == null
                || request.getPage() == null
                || request.getPage() < 1
                || request.getSize() == null
                || request.getSize() < 1
                || request.getSize() > 100) {
            throw new BusinessException(
                    "INVALID_PAGINATION",
                    "page must be at least 1 and size must be between 1 and 100"
            );
        }

        String sortBy = request.getSortBy();

        if (sortBy == null || !allowedSortFields.contains(sortBy)) {
            throw new BusinessException(
                    "INVALID_SORT_FIELD",
                    "Unsupported sort field: " + sortBy
            );
        }

        String sortDir = request.getSortDir();

        if (!"asc".equals(sortDir) && !"desc".equals(sortDir)) {
            throw new BusinessException(
                    "INVALID_SORT_DIRECTION",
                    "sortDir must be asc or desc"
            );
        }

        Sort.Direction direction = Sort.Direction.fromString(sortDir);
        Sort sort = Sort.by(direction, sortBy);

        // Dùng ID để giữ thứ tự ổn định khi giá trị sắp xếp trùng nhau.
        // Áp dụng cho các entity có thuộc tính khóa chính tên "id".
        if (!"id".equals(sortBy)) {
            sort = sort.and(Sort.by(direction, "id"));
        }

        return PageRequest.of(
                request.getPage() - 1,
                request.getSize(),
                sort
        );
    }
}