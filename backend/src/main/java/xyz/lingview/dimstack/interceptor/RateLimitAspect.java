package xyz.lingview.dimstack.interceptor;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import xyz.lingview.dimstack.annotation.RateLimit;
import xyz.lingview.dimstack.common.RateLimitException;
import xyz.lingview.dimstack.service.CacheService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

/**
 * @Author: lingview
 * @Date: 2026/03/14 22:43:07
 * @Description: 请求限流切面
 * @Version: 1.0
 */
@Aspect
@Component
public class RateLimitAspect {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitAspect.class);

    private static final String RATE_LIMIT_PREFIX = "rate_limit:";

    @Autowired
    private CacheService cacheService;

    @Around("@annotation(xyz.lingview.dimstack.annotation.RateLimit)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        RateLimit rateLimit = method.getAnnotation(RateLimit.class);
        if (rateLimit == null) {
            return joinPoint.proceed();
        }

        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw new RateLimitException("无法获取请求上下文");
        }

        HttpServletRequest request = attributes.getRequest();
        HttpSession session = request.getSession(false);

        String sessionId = session != null ? session.getId() : getClientIp(request);
        String rateLimitKey = buildRateLimitKey(method, sessionId);

        long windowInSeconds = convertToSeconds(rateLimit.window(), rateLimit.timeUnit());
        int maxRequests = rateLimit.maxRequests();

        if (isRateLimited(rateLimitKey, windowInSeconds, maxRequests)) {
            logger.warn("请求被限流：key={}, window={}s, maxRequests={}",
                    rateLimitKey, windowInSeconds, maxRequests);
            throw new RateLimitException(rateLimit.message());
        }

        return joinPoint.proceed();
    }

    /**
     *
     * @param key
     * @param windowInSeconds
     * @param maxRequests
     * @return
     */
    private boolean isRateLimited(String key, long windowInSeconds, int maxRequests) {
        synchronized (key.intern()) {
            RateLimitInfo info = cacheService.get(key + "_info", RateLimitInfo.class);
            long currentTime = System.currentTimeMillis();

            if (info == null || currentTime > info.expireTime) {
                info = new RateLimitInfo(1, currentTime + windowInSeconds * 1000);
                cacheService.set(key + "_info", info, windowInSeconds, TimeUnit.SECONDS);
                return false;
            }

            if (info.count >= maxRequests) {
                return true;
            }

            info.count++;
            cacheService.set(key + "_info", info, windowInSeconds, TimeUnit.SECONDS);
            return false;
        }
    }


    private static class RateLimitInfo implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
        public long count;
        public long expireTime;

        public RateLimitInfo() {}

        public RateLimitInfo(long count, long expireTime) {
            this.count = count;
            this.expireTime = expireTime;
        }
    }


    private String buildRateLimitKey(Method method, String sessionId) {
        String className = method.getDeclaringClass().getName();
        String methodName = method.getName();
        return RATE_LIMIT_PREFIX + className + ":" + methodName + ":" + sessionId;
    }


    private long convertToSeconds(long time, RateLimit.TimeUnit timeUnit) {
        return switch (timeUnit) {
            case MILLISECONDS -> Math.max(1, time / 1000);
            case SECONDS -> time;
            case MINUTES -> time * 60;
            case HOURS -> time * 3600;
        };
    }


    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
