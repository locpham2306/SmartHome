package com.loc.smart_home.exception;

import com.loc.smart_home.common.dto.response.BaseResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.stream.Collectors;


@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<BaseResponse<Void>> handleBusinessException(BusinessException exception) {
        return ResponseEntity.status(exception.getStatus()).body(BaseResponse.<Void>error(exception.getStrCode(), exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse<Void>> handleValidationException(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getAllErrors().stream().map(error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value").distinct().collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(BaseResponse.<Void>error("VALIDATION_ERROR",message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<BaseResponse<Void>> handleInvalidBody(HttpMessageNotReadableException exception) {
        return ResponseEntity.badRequest().body(BaseResponse.<Void>error("INVALID_REQUEST_BODY","Invalid request body"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<BaseResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        String message = "Invalid value for parameter: " + exception.getName();
        return ResponseEntity.badRequest().body(BaseResponse.<Void>error( "PARAMETER_TYPE_MISMATCH",message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Void>> handleUnexpectedException(Exception exception) {
        log.error("Unexpected error while processing request", exception);
        return ResponseEntity.internalServerError().body(BaseResponse.<Void>error("INTERNAL_SERVER_ERROR","Internal server error"));
    }

}
