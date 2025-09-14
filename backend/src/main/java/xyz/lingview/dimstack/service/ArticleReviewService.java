package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.mapper.ArticleReviewMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.dto.ArticleReviewDTO;
import org.springframework.stereotype.Service;
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

    public Map<String, Object> getUnreviewedArticles(Integer page, Integer size) {
        int offset = (page - 1) * size;
        List<ArticleReviewDTO> articles = articleReviewMapper.selectUnreviewedArticles(offset, size);

        for (ArticleReviewDTO article : articles) {
            String username = userInformationMapper.getUsernameByUuid(article.getUuid());
            article.setAuthor_name(username);
        }

        int total = articleReviewMapper.countUnreviewedArticles();

        Map<String, Object> result = new HashMap<>();
        result.put("articles", articles);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public Map<String, Object> getAllArticles(Integer page, Integer size) {
        int offset = (page - 1) * size;
        List<ArticleReviewDTO> articles = articleReviewMapper.selectAllArticles(offset, size);

        for (ArticleReviewDTO article : articles) {
            String username = userInformationMapper.getUsernameByUuid(article.getUuid());
            article.setAuthor_name(username);
        }

        int total = articleReviewMapper.countAllArticles();

        Map<String, Object> result = new HashMap<>();
        result.put("articles", articles);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        return result;
    }

    public Article getArticleContent(String articleId) {
        return articleReviewMapper.selectArticleById(articleId);
    }

    public Map<String, Object> updateArticleStatus(String articleId, Byte status) {
        articleReviewMapper.updateArticleStatus(articleId, status);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "文章状态更新成功");
        return result;
    }
}
