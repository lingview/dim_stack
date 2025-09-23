package xyz.lingview.dimstack.service;

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
}
