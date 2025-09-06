package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.domain.ArticleCategory;
import xyz.lingview.dimstack.domain.ArticleCategoryAndCount;
import xyz.lingview.dimstack.domain.ArticleTag;
import xyz.lingview.dimstack.mapper.ArticleCategoryMapper;
import xyz.lingview.dimstack.mapper.ArticleTagMapper;

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
}