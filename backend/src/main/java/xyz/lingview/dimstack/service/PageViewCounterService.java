package xyz.lingview.dimstack.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.mapper.ReadArticleMapper;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class PageViewCounterService {

    @Autowired
    private ReadArticleMapper readArticleMapper;

    private final Map<String, Long> pageViewCounters = new ConcurrentHashMap<>();
    
    private ScheduledExecutorService scheduler;
    
    private static final long SYNC_INTERVAL_SECONDS = 10;

    @PostConstruct
    public void init() {
        scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r, "page-view-sync");
            thread.setDaemon(true);
            return thread;
        });
        
        scheduler.scheduleAtFixedRate(
            this::syncPageViewsToDatabase,
            SYNC_INTERVAL_SECONDS,
            SYNC_INTERVAL_SECONDS,
            TimeUnit.SECONDS
        );
        
        log.info("浏览量同步定时器已启动，每{}秒同步一次", SYNC_INTERVAL_SECONDS);
    }

    @PreDestroy
    public void destroy() {
        if (scheduler != null) {
            log.info("正在关闭浏览量同步定时器...");
            scheduler.shutdown();
            try {
                if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                    scheduler.shutdownNow();
                }
            } catch (InterruptedException e) {
                scheduler.shutdownNow();
                Thread.currentThread().interrupt();
            }
            syncPageViewsToDatabase();
            log.info("浏览量同步定时器已关闭");
        }
    }

    public void initializePageView(String alias, Long dbPageViews) {
        pageViewCounters.put(alias, dbPageViews);
    }

    public void incrementPageView(String alias) {
        pageViewCounters.merge(alias, 1L, Long::sum);
    }

    public Long getPageView(String alias) {
        return pageViewCounters.get(alias);
    }

    public void removePageView(String alias) {
        pageViewCounters.remove(alias);
        log.debug("已清除文章浏览量计数器: {}", alias);
    }

    private void syncPageViewsToDatabase() {
        if (pageViewCounters.isEmpty()) {
            return;
        }

        Map<String, Long> snapshot = new ConcurrentHashMap<>(pageViewCounters);
        
        int successCount = 0;
        int failCount = 0;

        for (Map.Entry<String, Long> entry : snapshot.entrySet()) {
            String alias = entry.getKey();
            Long currentValue = entry.getValue();
            
            try {
                ReadArticle article = readArticleMapper.selectByAlias(alias);
                if (article != null) {
                    Long dbValue = article.getPage_views();
                    Long increment = currentValue - dbValue;
                    
                    if (increment > 0) {
                        readArticleMapper.batchUpdatePageViews(alias, increment);
                        pageViewCounters.put(alias, currentValue);
                        successCount++;
                    }
                }
            } catch (Exception e) {
                failCount++;
                log.error("同步文章浏览量失败: alias={}, currentValue={}", alias, currentValue, e);
            }
        }

        if (successCount > 0 || failCount > 0) {
            log.debug("浏览量同步完成: 成功={}, 失败={}, 总计数器={}", 
                successCount, failCount, pageViewCounters.size());
        }
    }
}
