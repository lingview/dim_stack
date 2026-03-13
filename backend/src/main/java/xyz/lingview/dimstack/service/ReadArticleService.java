package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.mapper.ReadArticleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ReadArticleService {
    boolean isArticleNeedPassword(String alias);
    ReadArticle getArticleByAlias(String alias, String password) throws Exception;
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
