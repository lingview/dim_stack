package xyz.lingview.dimstack.service.impl;

import xyz.lingview.dimstack.dto.request.HotArticleDTO;
import xyz.lingview.dimstack.mapper.HotArticleMapper;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.HotArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class HotArticleServiceImpl implements HotArticleService {

    @Autowired
    private HotArticleMapper hotArticleMapper;

    @Autowired
    private CacheService cacheService;

    private static final String HOT_ARTICLES_KEY = "dimstack:hot_articles";

    @Override
    public List<HotArticleDTO> getHotArticles() {

        @SuppressWarnings("unchecked")
        List<HotArticleDTO> articles = (List<HotArticleDTO>) cacheService.get(HOT_ARTICLES_KEY, List.class);

        if (articles == null || articles.isEmpty()) {
            articles = hotArticleMapper.selectHotArticles();
            cacheService.set(HOT_ARTICLES_KEY, articles, 1, TimeUnit.HOURS);
        }
        return articles;
    }

    @Override
    public void refreshHotArticlesCache() {
        List<HotArticleDTO> articles = hotArticleMapper.selectHotArticles();
        cacheService.set(HOT_ARTICLES_KEY, articles, 1, TimeUnit.HOURS);
    }
}
