//package xyz.lingview.dimstack.test;
//
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import xyz.lingview.dimstack.domain.ArticleTag;
//import xyz.lingview.dimstack.domain.ArticleCategory;
//import xyz.lingview.dimstack.mapper.ArticleCategoryMapper;
//import xyz.lingview.dimstack.mapper.ArticleTagMapper;
//
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//@SpringBootTest
//public class ArticleTagAndCategoryTest {
//
//    @Autowired
//    private ArticleTagMapper articleTagMapper;
//
//    @Autowired
//    private ArticleCategoryMapper articleCategoryMapper;
//
//    @Test
//    public void testFindAllEnabledTags() {
//        List<ArticleTag> tags = articleTagMapper.findAllEnabledTags();
//
//        assertNotNull(tags, "查询结果不应为null");
//
//        System.out.println("查询到的标签数量: " + tags.size());
//        for (ArticleTag tag : tags) {
//            System.out.println("标签ID: " + tag.getId());
//            System.out.println("标签名称: " + tag.getTag_name());
//            System.out.println("标签说明: " + tag.getTag_explain());
//            System.out.println("创建者: " + tag.getFounder());
//            System.out.println("创建时间: " + tag.getCreate_time());
//            System.out.println("状态: " + tag.getStatus());
//            System.out.println("------------------------");
//        }
//    }
//
//    @Test
//    public void testFindAllEnabledCategories() {
//        List<ArticleCategory> categories = articleCategoryMapper.findAllEnabledCategories();
//
//        assertNotNull(categories, "查询结果不应为null");
//
//        System.out.println("查询到的分类数量: " + categories.size());
//        for (ArticleCategory category : categories) {
//            System.out.println("分类ID: " + category.getId());
//            System.out.println("分类名称: " + category.getArticle_categories());
//            System.out.println("分类说明: " + category.getCategories_explain());
//            System.out.println("创建者: " + category.getFounder());
//            System.out.println("创建时间: " + category.getCreate_time());
//            System.out.println("状态: " + category.getStatus());
//            System.out.println("------------------------");
//        }
//    }
//
//    @Test
//    public void testTagsAndCategoriesNotEmpty() {
//
//        List<ArticleTag> tags = articleTagMapper.findAllEnabledTags();
//        List<ArticleCategory> categories = articleCategoryMapper.findAllEnabledCategories();
//
//        assertNotNull(tags);
//        assertNotNull(categories);
//
//        System.out.println("启用的标签数量: " + tags.size());
//        System.out.println("启用的分类数量: " + categories.size());
//    }
//}
