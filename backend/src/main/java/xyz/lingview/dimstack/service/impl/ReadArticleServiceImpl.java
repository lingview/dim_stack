package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ValueOperations;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.domain.ArticleLike;
import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.mapper.ArticleLikeMapper;
import xyz.lingview.dimstack.mapper.ArticleMapper;
import xyz.lingview.dimstack.mapper.ReadArticleMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.ReadArticleService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class ReadArticleServiceImpl implements ReadArticleService {

    @Autowired
    private ReadArticleMapper readArticleMapper;


    @Autowired
    private CacheService cacheService;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArticleLikeMapper articleLikeMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;

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

        @SuppressWarnings("unchecked")
        List<ReadArticle> articles = (List<ReadArticle>) cacheService.get(key, List.class);

        if (articles == null || articles.isEmpty()) {
            log.info("文章sitemap缓存未命中，从数据库加载");
            articles = readArticleMapper.listAllArticles();

            if (articles == null) {
                articles = Collections.emptyList();
            }

            cacheService.set(key, articles, 1, TimeUnit.HOURS);
            log.info("已将{}篇文章缓存，键为: {}", articles.size(), key);
        } else {
            log.info("文章sitemap缓存命中，从缓存返回{}篇文章", articles.size());
        }
        return articles;
    }

    @Override
    public List<String> listAllCategories() {
        String key = "dimstack:sitemap:categories";

        @SuppressWarnings("unchecked")
        List<String> categories = (List<String>) cacheService.get(key, List.class);

        if (categories == null || categories.isEmpty()) {
            log.info("分类sitemap缓存未命中，从数据库加载");
            categories = readArticleMapper.listAllCategories();
            if (categories == null) {
                categories = Collections.emptyList();
            }
            cacheService.set(key, categories, 1, TimeUnit.HOURS);
            log.info("已将{}个分类缓存，键为: {}", categories.size(), key);
        } else {
            log.info("分类sitemap缓存命中，从缓存返回{}个分类", categories.size());
        }
        return categories;
    }

    @Override
    public List<String> listAllTags() {
        String key = "dimstack:sitemap:tags";

        @SuppressWarnings("unchecked")
        List<String> tags = (List<String>) cacheService.get(key, List.class);

        if (tags == null || tags.isEmpty()) {
            log.info("标签sitemap缓存未命中，从数据库加载");
            tags = readArticleMapper.listAllTags();
            if (tags == null) {
                tags = Collections.emptyList();
            }
            cacheService.set(key, tags, 1, TimeUnit.HOURS);
            log.info("已将{}个标签缓存，键为: {}", tags.size(), key);
        } else {
            log.info("标签sitemap缓存命中，从缓存返回{}个标签", tags.size());
        }
        return tags;
    }

    @Override
    public void likeArticle(String username, String articleAlias) {
        String userId = userInformationMapper.selectUserUUID(username);

        Article article = articleMapper.selectArticleByAlias(articleAlias);
        if (article == null) {
            throw new RuntimeException("文章不存在");
        }

        if (articleLikeMapper.existsLike(userId, article.getArticle_id())) {
            articleLikeMapper.deleteLike(userId, article.getArticle_id());
            Long newLikeCount = article.getLike_count() - 1;
            articleMapper.updateArticleLikeCount(article.getArticle_id(), newLikeCount);
        } else {
            ArticleLike like = new ArticleLike();
            like.setUser_id(userId);
            like.setArticle_id(article.getArticle_id());
            like.setCreate_time(LocalDateTime.now());
            articleLikeMapper.insertLike(like);

            Long newLikeCount = article.getLike_count() + 1;
            articleMapper.updateArticleLikeCount(article.getArticle_id(), newLikeCount);
        }
    }

    @Override
    public boolean isUserLikedArticle(String username, String articleAlias) {
        String userId = userInformationMapper.selectUserUUID(username);

        Article article = articleMapper.selectArticleByAlias(articleAlias);
        if (article == null) {
            return false;
        }

        return articleLikeMapper.existsLike(userId, article.getArticle_id());
    }

}
