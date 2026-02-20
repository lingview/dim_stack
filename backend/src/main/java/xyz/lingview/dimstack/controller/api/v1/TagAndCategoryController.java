package xyz.lingview.dimstack.controller.api.v1;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.domain.ArticleCategory;
import xyz.lingview.dimstack.domain.ArticleCategoryAndCount;
import xyz.lingview.dimstack.domain.ArticleTag;
import xyz.lingview.dimstack.dto.request.ArticleDTO;
import xyz.lingview.dimstack.mapper.ArticleCategoryMapper;
import xyz.lingview.dimstack.mapper.ArticleTagMapper;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import xyz.lingview.dimstack.dto.request.PageResult;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TagAndCategoryController {

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Autowired
    private ArticleCategoryMapper articleCategoryMapper;

    @GetMapping("/tags")
    public List<ArticleTag> getAllEnabledTags() {
        return articleTagMapper.findAllEnabledTags();
    }

    @GetMapping("/categories")
    public List<ArticleCategory> getAllEnabledCategories() {
        return articleCategoryMapper.findAllEnabledCategories();
    }

    @GetMapping("/categoriesandcount")
    public List<ArticleCategoryAndCount> getAllEnabledCategoriesAndCount() {
        return articleCategoryMapper.findAllEnabledCategoriesAndCount();
    }

    @GetMapping("/categories/articles")
    public PageResult<ArticleDTO> getArticlesByCategory(
            @RequestParam String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        int offset = (page - 1) * size;

        // 获取文章列表
        List<ArticleDTO> articles = articleCategoryMapper.findArticlesByCategory(category, offset, size);

        // 获取总数
        int total = articleCategoryMapper.countArticlesByCategory(category);

        // 计算总页数
        int total_pages = (int) Math.ceil((double) total / size);

        PageResult<ArticleDTO> pageResult = new PageResult<>();
        pageResult.setData(articles);
        pageResult.setTotal(total);
        pageResult.setPage(page);
        pageResult.setSize(size);
        pageResult.setTotal_pages(total_pages);

        return pageResult;
    }


    @GetMapping("/tags/{tag}/articles")
    public PageResult<ArticleDTO> getArticlesByTag(
            @PathVariable String tag,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        int offset = (page - 1) * size;

        List<ArticleDTO> articles = articleTagMapper.findArticlesByTag(tag, offset, size);

        int total = articleTagMapper.countArticlesByTag(tag);

        int total_pages = (int) Math.ceil((double) total / size);

        PageResult<ArticleDTO> pageResult = new PageResult<>();
        pageResult.setData(articles);
        pageResult.setTotal(total);
        pageResult.setPage(page);
        pageResult.setSize(size);
        pageResult.setTotal_pages(total_pages);

        return pageResult;
    }
}
