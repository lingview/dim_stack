package xyz.lingview.dimstack.common;

/**
 * @Author: lingview
 * @Date: 2026/03/14 22:40:25
 * @Description: 请求限流异常
 * @Version: 1.0
 */
public class RateLimitException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public RateLimitException() {
        super("请求过于频繁，请稍后再试");
    }

    public RateLimitException(String message) {
        super(message);
    }

    public RateLimitException(String message, Throwable cause) {
        super(message, cause);
    }
}
