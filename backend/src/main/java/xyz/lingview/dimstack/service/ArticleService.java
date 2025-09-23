package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.mapper.ArticleMapper;
import xyz.lingview.dimstack.dto.request.ArticleDTO;
import xyz.lingview.dimstack.dto.request.PageRequest;
import xyz.lingview.dimstack.dto.request.PageResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ArticleService {

    @Autowired
    private ArticleMapper articleMapper;

    public PageResult<ArticleDTO> getArticlesForHomePage(PageRequest pageRequest) {
        int offset = (pageRequest.getPage() - 1) * pageRequest.getSize();

        List<ArticleDTO> articles = articleMapper.selectArticlesForHomePage(
                offset,
                pageRequest.getSize(),
                pageRequest.getCategory()
        );

        int total = articleMapper.countArticles(pageRequest.getCategory());

        PageResult<ArticleDTO> pageResult = new PageResult<>();
        pageResult.setData(articles);
        pageResult.setTotal(total);
        pageResult.setPage(pageRequest.getPage());
        pageResult.setSize(pageRequest.getSize());
        pageResult.setTotal_pages((total + pageRequest.getSize() - 1) / pageRequest.getSize());

        return pageResult;
    }
}
