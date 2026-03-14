package xyz.lingview.dimstack.annotation;

import java.lang.annotation.*;

/**
 * @Author: lingview
 * @Date: 2026/03/14 22:38:55
 * @Description: 请求限流
 * @Version: 1.0
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimit {

    long window() default 60;

    TimeUnit timeUnit() default TimeUnit.SECONDS;

    int maxRequests() default 10;

    String message() default "请求过于频繁，请稍后再试";

    enum TimeUnit {
        MILLISECONDS(java.util.concurrent.TimeUnit.MILLISECONDS),
        SECONDS(java.util.concurrent.TimeUnit.SECONDS),
        MINUTES(java.util.concurrent.TimeUnit.MINUTES),
        HOURS(java.util.concurrent.TimeUnit.HOURS);

        private final java.util.concurrent.TimeUnit timeUnit;

        TimeUnit(java.util.concurrent.TimeUnit timeUnit) {
            this.timeUnit = timeUnit;
        }

        public java.util.concurrent.TimeUnit toTimeUnit() {
            return timeUnit;
        }
    }
}
