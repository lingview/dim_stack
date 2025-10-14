package xyz.lingview.dimstack.config;

import xyz.lingview.dimstack.service.HotArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

@Component
public class HotArticleCacheInitializer implements ApplicationListener<ContextRefreshedEvent> {

    @Autowired
    private HotArticleService hotArticleService;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (event.getApplicationContext().getParent() == null) {
            hotArticleService.refreshHotArticlesCache();
        }
    }
}
