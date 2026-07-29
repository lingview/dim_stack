package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import xyz.lingview.dimstack.dto.response.ArticleReviewListResponseDTO;
import xyz.lingview.dimstack.dto.response.ArticleReviewStatusResponseDTO;
import xyz.lingview.dimstack.mapper.ArticleCategoryMapper;
import xyz.lingview.dimstack.mapper.ArticleReviewMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.mapper.ReadArticleMapper;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.dto.request.ArticleReviewDTO;
import xyz.lingview.dimstack.service.ArticleReviewService;
import xyz.lingview.dimstack.service.ArticleService;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.service.NotificationService;
import xyz.lingview.dimstack.service.PageViewCounterService;
import xyz.lingview.dimstack.util.SiteConfigUtil;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class ArticleReviewServiceImpl implements ArticleReviewService {

    private final ArticleReviewMapper articleReviewMapper;
    private final UserInformationMapper userInformationMapper;

    public ArticleReviewServiceImpl(ArticleReviewMapper articleReviewMapper,
                                    UserInformationMapper userInformationMapper) {
        this.articleReviewMapper = articleReviewMapper;
        this.userInformationMapper = userInformationMapper;
    }

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    MailService mailService;

    @Autowired
    private CacheService cacheService;

    @Autowired
    private ReadArticleMapper readArticleMapper;

    @Autowired
    private PageViewCounterService pageViewCounterService;

    @Autowired
    private ArticleService articleService;

    @Autowired
    private ArticleCategoryMapper articleCategoryMapper;

    @Override
    public ArticleReviewListResponseDTO getUnreviewedArticles(Integer page, Integer size) {
        int offset = (page - 1) * size;
        List<ArticleReviewDTO> articles = articleReviewMapper.selectUnreviewedArticles(offset, size);

        for (ArticleReviewDTO article : articles) {
            String username = userInformationMapper.getUsernameByUuid(article.getUuid());
            article.setAuthor_name(username);
        }

        int total = articleReviewMapper.countUnreviewedArticles();

        ArticleReviewListResponseDTO result = new ArticleReviewListResponseDTO();
        result.setArticles(articles);
        result.setTotal(total);
        result.setPage(page);
        result.setSize(size);
        result.setTotalPages((int) Math.ceil((double) total / size));
        return result;
    }

    @Override
    public ArticleReviewListResponseDTO getAllArticles(Integer page, Integer size) {
        int offset = (page - 1) * size;
        List<ArticleReviewDTO> articles = articleReviewMapper.selectAllArticles(offset, size);

        for (ArticleReviewDTO article : articles) {
            String username = userInformationMapper.getUsernameByUuid(article.getUuid());
            article.setAuthor_name(username);
        }

        int total = articleReviewMapper.countAllArticles();

        ArticleReviewListResponseDTO result = new ArticleReviewListResponseDTO();
        result.setArticles(articles);
        result.setTotal(total);
        result.setPage(page);
        result.setSize(size);
        result.setTotalPages((int) Math.ceil((double) total / size));
        return result;
    }

    @Override
    public Article getArticleContent(String articleId) {
        return articleReviewMapper.selectArticleById(articleId);
    }

    @Override
    public ArticleReviewStatusResponseDTO deleteArticle(String articleId) {
        Byte status = 0;
        articleReviewMapper.updateArticleStatus(articleId, status);
        invalidateArticleCache(articleId);
        String category = articleCategoryMapper.getCategoryByArticleId(articleId);
        articleCategoryMapper.decrementCount(category);
        log.info("文章审核模块删除文章成功，文章id：{}", articleId);
        try {
            articleService.clearArticleCache();
            log.info("文章状态变更为{}，已清除首页文章列表缓存", status);
        } catch (Exception e) {
            log.warn("清除首页文章列表缓存失败", e);
        }
        ArticleReviewStatusResponseDTO result = new ArticleReviewStatusResponseDTO();
        result.setSuccess(true);
        result.setMessage("文章删除成功");
        return result;
    }

    @Override
    public ArticleReviewStatusResponseDTO updateArticleStatus(String articleId, Byte status) {
        articleReviewMapper.updateArticleStatus(articleId, status);

        invalidateArticleCache(articleId);

        try {
            articleService.clearArticleCache();
            log.info("文章状态变更为{}，已清除首页文章列表缓存", status);
        } catch (Exception e) {
            log.warn("清除首页文章列表缓存失败", e);
        }

        ArticleReviewStatusResponseDTO result = new ArticleReviewStatusResponseDTO();
        result.setSuccess(true);
        result.setMessage("文章状态更新成功");
        if (siteConfigUtil.isNotificationEnabled()) {
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String formattedDate = formatter.format(date);
            String username = userInformationMapper.getUsernameByArticleId(articleId);
            String email = userInformationMapper.getEmailByUsername(username);
            String siteName = siteConfigUtil.getSiteName();
            String article_name = articleReviewMapper.getArticleNameByArticleId(articleId);
            String statusDescription = switch (status) {
                case 1 -> "通过审核";
                case 3 -> "待审核";
                case 4 -> "违规";
                default -> "未知状态";
            };
            mailService.sendSimpleMail(
                    email,
                    siteName + " 审核结果通知",
                    "您的文章：" + "《" + article_name + "》" + " 于 " + formattedDate + " 完成审核，审核结果为：" + statusDescription
            );
            notificationService.sendSystemNotification(username, "系统通知", "您的文章：" + "《" + article_name + "》" + " 于 " + formattedDate + " 完成审核，审核结果为：" + statusDescription);
        }
        return result;
    }

    private void invalidateArticleCache(String articleId) {
        try {
            xyz.lingview.dimstack.domain.ReadArticle article = readArticleMapper.selectByArticleId(articleId);
            if (article != null && article.getAlias() != null) {
                String cacheKey = "dimstack:article:" + article.getAlias();
                cacheService.delete(cacheKey);
                pageViewCounterService.removePageView(article.getAlias());
                log.info("审核操作已清除文章缓存和浏览量计数器: {}", cacheKey);
            }
        } catch (Exception e) {
            log.warn("清除文章缓存失败，articleId: {}", articleId, e);
        }
    }
}