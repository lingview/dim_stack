package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.mapper.ReadArticleMapper;
import xyz.lingview.dimstack.service.ReadArticleService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class ReadArticleServiceImpl implements ReadArticleService {

    @Autowired
    private ReadArticleMapper readArticleMapper;


    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public boolean isArticleNeedPassword(String alias) {
        return readArticleMapper.isArticleNeedPassword(alias);
    }

    @Override
    public ReadArticle getArticleByAlias(String alias, String password) throws Exception {
        ReadArticle article = readArticleMapper.selectByAlias(alias);
        if (article == null) {
            throw new Exception("文章不存在");
        }

        if (article.getPassword() != null && !article.getPassword().isEmpty()) {
            if (password == null) {
                throw new Exception("文章密码错误");
            }
            if (!BCrypt.checkpw(password, article.getPassword())) {
                throw new Exception("文章密码错误");
            }
        }
        readArticleMapper.updatePageViews(alias);

        return article;
    }

    @Override
    public void updatePageViews(String alias) {
        readArticleMapper.updatePageViews(alias);
    }


    @Override
    public List<ReadArticle> listAllArticles() {
        String key = "dimstack:sitemap:articles";
        ValueOperations<String, Object> operations = redisTemplate.opsForValue();
        List<ReadArticle> articles = (List<ReadArticle>) operations.get(key);

        if (articles == null) {
            log.info("文章sitemap缓存未命中，从数据库加载");
            articles = readArticleMapper.listAllArticles();
            operations.set(key, articles, 1, TimeUnit.HOURS);
            log.info("已将{}篇文章缓存到Redis，键为: {}", articles.size(), key);
        } else {
            log.info("文章sitemap缓存命中，从缓存返回{}篇文章", articles.size());
        }
        return articles;
    }

    @Override
    public List<String> listAllCategories() {
        String key = "dimstack:sitemap:categories";
        ValueOperations<String, Object> operations = redisTemplate.opsForValue();
        List<String> categories = (List<String>) operations.get(key);

        if (categories == null) {
            log.info("分类sitemap缓存未命中，从数据库加载");
            categories = readArticleMapper.listAllCategories();
            operations.set(key, categories, 1, TimeUnit.HOURS);
            log.info("已将{}个分类缓存到Redis，键为: {}", categories.size(), key);
        } else {
            log.info("分类sitemap缓存命中，从缓存返回{}个分类", categories.size());
        }
        return categories;
    }

    @Override
    public List<String> listAllTags() {
        String key = "dimstack:sitemap:tags";
        ValueOperations<String, Object> operations = redisTemplate.opsForValue();
        List<String> tags = (List<String>) operations.get(key);

        if (tags == null) {
            log.info("标签sitemap缓存未命中，从数据库加载");
            tags = readArticleMapper.listAllTags();
            operations.set(key, tags, 1, TimeUnit.HOURS);
            log.info("已将{}个标签缓存到Redis，键为: {}", tags.size(), key);
        } else {
            log.info("标签sitemap缓存命中，从缓存返回{}个标签", tags.size());
        }
        return tags;
    }

}
