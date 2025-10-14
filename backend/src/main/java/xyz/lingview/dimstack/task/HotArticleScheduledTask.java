package xyz.lingview.dimstack.task;

import lombok.extern.slf4j.Slf4j;
import xyz.lingview.dimstack.service.HotArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class HotArticleScheduledTask {

    @Autowired
    private HotArticleService hotArticleService;

    @Scheduled(fixedRate = 3600000)
    public void refreshHotArticlesCache() {
        log.info("开始刷新热门文章缓存...");
        hotArticleService.refreshHotArticlesCache();
        log.info("完成刷新热门文章缓存！");
    }
}
