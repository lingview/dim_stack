package xyz.lingview.dimstack.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.mapper.ArticleSearchMapper;

import java.util.List;

@Service
public class ArticleSearchService {

    @Autowired
    private ArticleSearchMapper articleSearchMapper;

    public List<Article> searchArticles(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return articleSearchMapper.findAllArticles();
        }
        return articleSearchMapper.searchArticlesByKeyword(keyword);
    }
}
