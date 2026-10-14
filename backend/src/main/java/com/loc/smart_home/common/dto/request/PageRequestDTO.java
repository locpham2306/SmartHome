package com.loc.smart_home.common.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PageRequestDTO {

    @NotNull(message = "page is required")
    @Min(value = 1, message = "page must be at least 1")
    private Integer page = 1;

    @NotNull(message = "size is required")
    @Min(value = 1, message = "size must be at least 1")
    @Max(value = 100, message = "size must not exceed 100")
    private Integer size = 10;

    private String sortBy = "id";

    @Pattern(
            regexp = "asc|desc",
            message = "sortDir must be asc or desc"
    )
    private String sortDir = "desc";
}