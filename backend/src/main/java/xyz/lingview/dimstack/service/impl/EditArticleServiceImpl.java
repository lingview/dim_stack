package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.dto.request.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.request.UpdateArticleDTO;
import xyz.lingview.dimstack.dto.request.EditArticleDTO;
import xyz.lingview.dimstack.mapper.ArticleCategoryMapper;
import xyz.lingview.dimstack.mapper.EditArticleMapper;
import xyz.lingview.dimstack.service.EditArticleService;
import xyz.lingview.dimstack.util.CategoryPathUtil;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EditArticleServiceImpl implements EditArticleService {

    @Autowired
    private EditArticleMapper editArticleMapper;

    @Autowired
    private ArticleCategoryMapper articleCategoryMapper;

    @Autowired
    private CategoryPathUtil categoryPathUtil;

    @Override
    public Map<String, Object> getArticleListByUsername(String username, Integer page, Integer size) {
        Map<String, Object> result = new HashMap<>();

        try {
            String uuid = editArticleMapper.getUuidByUsername(username);
            if (uuid == null) {
                result.put("articles", List.of());
                result.put("total", 0);
                result.put("page", page);
                result.put("size", size);
                return result;
            }

            int offset = (page - 1) * size;
            List<EditArticleDTO> articles = editArticleMapper.getArticleListByUuid(uuid, offset, size);
            int total = editArticleMapper.countArticlesByUuid(uuid);

            result.put("articles", articles);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", (int) Math.ceil((double) total / size));

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            result.put("articles", List.of());
            result.put("total", 0);
            result.put("page", page);
            result.put("size", size);
            return result;
        }
    }

    @Override
    public ArticleDetailDTO getArticleDetailById(String articleId, String username) {
        try {
            String articleUuid = editArticleMapper.getUuidByArticleId(articleId);
            if (articleUuid == null) {
                return null;
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null) {
                return null;
            }

            if (!articleOwner.equals(username)) {
                return null;
            }

            return editArticleMapper.getArticleDetailById(articleId);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public boolean updateArticle(UpdateArticleDTO updateArticleDTO, String sessionUsername) {
        try {
            String articleUuid = editArticleMapper.getUuidByArticleId(updateArticleDTO.getArticle_id());
            if (articleUuid == null) {
                return false;
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null) {
                return false;
            }

            if (!articleOwner.equals(sessionUsername)) {
                return false;
            }

            // 获取更新前的文章分类
            String oldCategory = editArticleMapper.getCategoryByArticleId(updateArticleDTO.getArticle_id());

            editArticleMapper.deleteArticleTagRelations(updateArticleDTO.getArticle_id());

            String tagsString = updateArticleDTO.getTag();
            if (tagsString != null && !tagsString.isEmpty()) {
                String[] tags = tagsString.split(",");
                for (String tag : tags) {
                    if (!tag.trim().isEmpty()) {
                        editArticleMapper.insertArticleTagRelation(updateArticleDTO.getArticle_id(), tag.trim());
                    }
                }
            }

            CategoryPathUtil.CategoryPath categoryPath = categoryPathUtil.parsePath(updateArticleDTO.getCategory());
            
            Map<String, Object> paramMap = new HashMap<>();
            paramMap.put("article_id", updateArticleDTO.getArticle_id());
            paramMap.put("article_name", updateArticleDTO.getArticle_name());
            paramMap.put("article_cover", updateArticleDTO.getArticle_cover());
            paramMap.put("excerpt", updateArticleDTO.getExcerpt());
            paramMap.put("article_content", updateArticleDTO.getArticle_content());
            paramMap.put("password", updateArticleDTO.getPassword());
            paramMap.put("parentCategory", categoryPath.getParentCategory());
            paramMap.put("childCategory", categoryPath.getChildCategory());
            paramMap.put("alias", updateArticleDTO.getAlias());
            paramMap.put("status", updateArticleDTO.getStatus());
            
            int result = editArticleMapper.updateArticleWithCategory(paramMap);

            // 更新分类计数
            if (result > 0) {
                String newCategory = updateArticleDTO.getCategory();
                if (oldCategory != null && !oldCategory.equals(newCategory)) {
                    CategoryPathUtil.CategoryPath oldPath = categoryPathUtil.parsePath(oldCategory);
                    String oldFullPath = oldPath.getParentCategory() != null 
                        ? oldPath.getParentCategory() + "/" + oldPath.getChildCategory()
                        : oldPath.getChildCategory();
                    articleCategoryMapper.decrementCount(oldFullPath);
                    
                    if (newCategory != null) {
                        CategoryPathUtil.CategoryPath newPath = categoryPathUtil.parsePath(newCategory);
                        String newFullPath = newPath.getParentCategory() != null 
                            ? newPath.getParentCategory() + "/" + newPath.getChildCategory()
                            : newPath.getChildCategory();
                        articleCategoryMapper.incrementCount(newFullPath);
                    }
                }
            }

            return result > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }



    @Override
    public boolean deleteArticle(String articleId, String sessionUsername) {
        try {
            String articleUuid = editArticleMapper.getUuidByArticleId(articleId);
            if (articleUuid == null) {
                return false;
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null || !articleOwner.equals(sessionUsername)) {
                return false;
            }

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("uuid", articleUuid);

            int result = editArticleMapper.deleteArticle(params);
            return result > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean unpublishArticle(String articleId, String sessionUsername) {
        try {
            String articleUuid = editArticleMapper.getUuidByArticleId(articleId);
            if (articleUuid == null) {
                return false;
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null || !articleOwner.equals(sessionUsername)) {
                return false;
            }

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("uuid", articleUuid);

            int result = editArticleMapper.unpublishArticle(params);
            return result > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean publishArticle(String articleId, String sessionUsername) {
        try {
            String articleUuid = editArticleMapper.getUuidByArticleId(articleId);
            if (articleUuid == null) {
                return false;
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null || !articleOwner.equals(sessionUsername)) {
                return false;
            }

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("uuid", articleUuid);

            int result = editArticleMapper.publishArticle(params);
            return result > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public String getArticleUuid(String articleId) {
        return editArticleMapper.getUuidByArticleId(articleId);
    }
}
