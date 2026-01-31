package xyz.lingview.dimstack.service;

import org.springframework.beans.factory.annotation.Autowired;
import xyz.lingview.dimstack.dto.response.ArticleReviewListResponseDTO;
import xyz.lingview.dimstack.dto.response.ArticleReviewStatusResponseDTO;
import xyz.lingview.dimstack.mapper.ArticleReviewMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.dto.request.ArticleReviewDTO;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.util.SiteConfigUtil;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ArticleReviewService {

    private final ArticleReviewMapper articleReviewMapper;
    private final UserInformationMapper userInformationMapper;

    public ArticleReviewService(ArticleReviewMapper articleReviewMapper,
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

    public Article getArticleContent(String articleId) {
        return articleReviewMapper.selectArticleById(articleId);
    }



    public ArticleReviewStatusResponseDTO updateArticleStatus(String articleId, Byte status) {
        articleReviewMapper.updateArticleStatus(articleId, status);
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
                    "您的文章：" + "《" + article_name + "》" +" 于 " + formattedDate + " 完成审核，审核结果为：" + statusDescription
            );
            notificationService.sendSystemNotification(username, "系统通知", "您的文章：" + "《" + article_name + "》" +" 于 " + formattedDate + " 完成审核，审核结果为：" + statusDescription);
        }
        return result;
    }
}