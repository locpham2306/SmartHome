package com.loc.smart_home.common.base;

import org.springframework.data.domain.Page;

import java.util.List;

public interface BaseMapper<E, RP> {
    RP toResponse(E entity);

    List<RP> toResponseList(List<E> entities);

    default Page<RP> toResponsePage(Page<E> entityPage){
        return entityPage.map(this::toResponse);
    }
}
