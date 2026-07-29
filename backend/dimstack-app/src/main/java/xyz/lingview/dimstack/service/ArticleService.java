package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.request.ArticleDTO;
import xyz.lingview.dimstack.dto.request.PageRequest;
import xyz.lingview.dimstack.dto.request.PageResult;

public interface ArticleService {

    PageResult<ArticleDTO> getArticlesForHomePage(PageRequest pageRequest);

    void clearArticleCache();
}