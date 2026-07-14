package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.ArticleTag;
import xyz.lingview.dimstack.dto.request.ArticleDTO;
import xyz.lingview.dimstack.dto.request.ArticleTagDTO;

import java.util.List;

public interface ArticleTagService {
    List<ArticleTagDTO> getAllTags();
    List<ArticleTagDTO> getActiveTags();
    ArticleTagDTO getTagById(Integer id);
    boolean createTag(ArticleTagDTO tagDTO, String founder);
    boolean updateTag(ArticleTagDTO tagDTO);
    boolean deleteTag(Integer id);
    boolean activateTag(Integer id);

    // 公开前端接口方法
    List<ArticleTag> findAllEnabledTags();
    List<ArticleDTO> findArticlesByTag(String tagName, int offset, int size);
    int countArticlesByTag(String tagName);
}
