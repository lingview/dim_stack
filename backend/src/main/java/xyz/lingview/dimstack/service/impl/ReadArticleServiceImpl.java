package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ValueOperations;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.domain.ArticleLike;
import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.mapper.ArticleLikeMapper;
import xyz.lingview.dimstack.mapper.ArticleMapper;
import xyz.lingview.dimstack.mapper.ReadArticleMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.service.NotificationService;
import xyz.lingview.dimstack.service.ReadArticleService;
import xyz.lingview.dimstack.service.PageViewCounterService;
import xyz.lingview.dimstack.util.SiteConfigUtil;
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

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MailService mailService;

    @Autowired
    private PageViewCounterService pageViewCounterService;

    @Override
    public boolean isArticleNeedPassword(String alias) {
        return readArticleMapper.isArticleNeedPassword(alias);
    }

    @Override
    public ReadArticle getArticleByAlias(String alias, String password) throws Exception {
        String cacheKey = "dimstack:article:" + alias;
        ReadArticle article = cacheService.get(cacheKey, ReadArticle.class);
        
        if (article != null) {
            log.debug("文章缓存命中: {}", alias);
            if (article.getPassword() != null && !article.getPassword().isEmpty()) {
                if (password == null) {
                    throw new Exception("文章密码错误");
                }
                if (!BCrypt.checkpw(password, article.getPassword())) {
                    throw new Exception("文章密码错误");
                }
            }
            
            Long currentPageViews = pageViewCounterService.getPageView(alias);
            if (currentPageViews == null) {
                pageViewCounterService.initializePageView(alias, article.getPage_views());
            }
            pageViewCounterService.incrementPageView(alias);
            
            ReadArticle result = new ReadArticle();
            org.springframework.beans.BeanUtils.copyProperties(article, result);
            Long pageViews = pageViewCounterService.getPageView(alias);
            if (pageViews != null) {
                result.setPage_views(pageViews);
            }
            return result;
        }
        
        log.info("文章缓存未命中，从数据库加载: {}", alias);
        article = readArticleMapper.selectByAlias(alias);
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
        
        pageViewCounterService.initializePageView(alias, article.getPage_views());
        pageViewCounterService.incrementPageView(alias);
        
        ReadArticle result = new ReadArticle();
        org.springframework.beans.BeanUtils.copyProperties(article, result);
        Long pageViews = pageViewCounterService.getPageView(alias);
        if (pageViews != null) {
            result.setPage_views(pageViews);
        }
        
        cacheService.set(cacheKey, article, 30, TimeUnit.MINUTES);
        log.info("文章已缓存: {}, 键: {}", alias, cacheKey);

        return result;
    }

    @Override
    public void updatePageViews(String alias) {
        pageViewCounterService.incrementPageView(alias);
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
            sendLikeNotification(article, username);
        }
        
        String cacheKey = "dimstack:article:" + articleAlias;
        cacheService.delete(cacheKey);
        pageViewCounterService.removePageView(articleAlias);
        log.info("点赞操作已清除文章缓存和浏览量计数器: {}", cacheKey);
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


    private void sendLikeNotification(Article article, String likerUsername) {
        try {
            if (!siteConfigUtil.isNotificationEnabled()) {
                return;
            }

            UserInformation articleAuthor = userInformationMapper.selectUserByUUID(article.getUuid());
            String likerUserId = userInformationMapper.selectUserUUID(likerUsername);

            if (articleAuthor != null && articleAuthor.getEmail() != null &&
                    likerUserId != null && !articleAuthor.getUuid().equals(likerUserId)) {
                String siteName = siteConfigUtil.getSiteName();
                String subject = siteName + " 点赞通知";
                String content = "用户 " + likerUsername + " 点赞了您的文章《" + article.getArticle_name() + "》";

                mailService.sendSimpleMail(articleAuthor.getEmail(), subject, content);
                notificationService.sendSystemNotification(articleAuthor.getUsername(), "系统通知", content);
            }
        } catch (Exception e) {
            log.warn("文章点赞通知邮件发送失败{}", String.valueOf(e));
        }
    }

}
