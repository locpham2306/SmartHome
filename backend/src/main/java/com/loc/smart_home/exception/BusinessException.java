package com.loc.smart_home.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {

    private final HttpStatus status;
    private final String strCode;

    public BusinessException(HttpStatus status, String strCode, String message) {
        super(message);
        this.status = status;
        this.strCode = strCode;
    }

    public BusinessException(String strCode, String message){
        this(HttpStatus.BAD_REQUEST, strCode, message);
    }
}