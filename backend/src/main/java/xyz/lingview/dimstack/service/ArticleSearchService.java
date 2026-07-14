package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.Article;

import java.util.List;

public interface ArticleSearchService {

    List<Article> searchArticles(String keyword);
}