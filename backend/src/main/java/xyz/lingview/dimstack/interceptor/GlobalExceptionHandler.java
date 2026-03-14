package xyz.lingview.dimstack.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import xyz.lingview.dimstack.common.RateLimitException;

import java.util.HashMap;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/03/14 22:41:05
 * @Description: 全局异常处理器
 * @Version: 1.0
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     *
     * @param e
     * @return
     */
    @ExceptionHandler(RateLimitException.class)
    public ResponseEntity<Map<String, Object>> handleRateLimitException(RateLimitException e) {
        logger.warn("请求被限流：{}", e.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("code", 429);
        response.put("message", e.getMessage());
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .body(response);
    }
}
