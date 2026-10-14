package com.loc.smart_home.common.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BaseResponse<T> {
    private boolean success;
    private String strCode;
    private String message;
    private T data;

    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(true, "Success", "Success", data);
    }

    public static <T> BaseResponse<T> error(String message) {
        return error("ERROR", message);
    }

    public static <T> BaseResponse<T> error(String strCode, String message) {
        return new BaseResponse<>(false, strCode, message, null);
    }
}
