package com.loc.smart_home.common.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T>{
    private List<T> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    public static <T> PageResponse<T> from(Page<T> source){
        return new PageResponse<>(
                source.getContent(),
                source.getNumber() + 1,
                source.getSize(),
                source.getTotalElements(),
                source.getTotalPages()
        );
    }
}
