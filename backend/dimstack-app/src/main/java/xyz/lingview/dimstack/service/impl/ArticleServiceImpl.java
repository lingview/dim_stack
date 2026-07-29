package xyz.lingview.dimstack.service.impl;

import xyz.lingview.dimstack.mapper.ArticleMapper;
import xyz.lingview.dimstack.dto.request.ArticleDTO;
import xyz.lingview.dimstack.dto.request.PageRequest;
import xyz.lingview.dimstack.dto.request.PageResult;
import xyz.lingview.dimstack.service.ArticleService;
import xyz.lingview.dimstack.service.CacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class ArticleServiceImpl implements ArticleService {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CacheService cacheService;

    private static final String ARTICLE_CACHE_PREFIX = "article:home:";
    private static final long CACHE_EXPIRE_HOURS = 1;

    @Override
    public PageResult<ArticleDTO> getArticlesForHomePage(PageRequest pageRequest) {
        String cacheKey = buildCacheKey(pageRequest);

        try {
            @SuppressWarnings("unchecked")
            PageResult<ArticleDTO> cachedResult = cacheService.get(cacheKey, PageResult.class);
            if (cachedResult != null) {
                log.debug("命中文章列表缓存: {}", cacheKey);
                return cachedResult;
            }
        } catch (Exception e) {
            log.warn("读取缓存失败，将从数据库查询: {}", cacheKey, e);
        }

        log.info("缓存未命中，从数据库查询文章列表: {}", cacheKey);
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

        try {
            cacheService.set(cacheKey, pageResult, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
            log.debug("文章列表已写入缓存: {}", cacheKey);
        } catch (Exception e) {
            log.warn("写入缓存失败: {}", cacheKey, e);
        }

        return pageResult;
    }

    private String buildCacheKey(PageRequest pageRequest) {
        StringBuilder key = new StringBuilder(ARTICLE_CACHE_PREFIX);
        key.append("page_").append(pageRequest.getPage());
        key.append("_size_").append(pageRequest.getSize());
        if (pageRequest.getCategory() != null && !pageRequest.getCategory().isEmpty()) {
            key.append("_category_").append(pageRequest.getCategory());
        }
        return key.toString();
    }

    @Override
    public void clearArticleCache() {
        try {
            cacheService.deleteByPrefix(ARTICLE_CACHE_PREFIX);
            log.info("已清除所有文章列表缓存");
        } catch (Exception e) {
            log.error("清除文章列表缓存失败", e);
        }
    }
}