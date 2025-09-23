package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.response.ArticleReviewListResponseDTO;
import xyz.lingview.dimstack.dto.response.ArticleReviewStatusResponseDTO;
import xyz.lingview.dimstack.mapper.ArticleReviewMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.dto.request.ArticleReviewDTO;
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
        return result;
    }
}
