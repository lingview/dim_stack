package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.ReadArticle;

import java.util.List;

public interface ReadArticleService {
    boolean isArticleNeedPassword(String alias);
    ReadArticle getArticleByAlias(String alias, String password) throws Exception;
    ReadArticle getRandomArticle();
    void updatePageViews(String alias);

    // seo用
    List<ReadArticle> listAllArticles();
    List<String> listAllCategories();
    List<String> listAllTags();

    // 文章点赞
    void likeArticle(String username, String articleAlias);

    // 获取用户是否已点赞
    boolean isUserLikedArticle(String username, String articleAlias);

}
