package xyz.lingview.dimstack.service.impl;

import xyz.lingview.dimstack.dto.request.HotArticleDTO;
import xyz.lingview.dimstack.mapper.HotArticleMapper;
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
    private RedisTemplate<String, Object> redisTemplate;

    private static final String HOT_ARTICLES_KEY = "dimstack:hot_articles";

    @Override
    public List<HotArticleDTO> getHotArticles() {

        List<HotArticleDTO> articles = (List<HotArticleDTO>) redisTemplate.opsForValue().get(HOT_ARTICLES_KEY);
        if (articles == null) {
            articles = hotArticleMapper.selectHotArticles();
            redisTemplate.opsForValue().set(HOT_ARTICLES_KEY, articles, 1, TimeUnit.HOURS);
        }
        return articles;
    }

    @Override
    public void refreshHotArticlesCache() {
        List<HotArticleDTO> articles = hotArticleMapper.selectHotArticles();
        redisTemplate.opsForValue().set(HOT_ARTICLES_KEY, articles, 1, TimeUnit.HOURS);
    }
}
