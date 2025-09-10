package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.dto.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.UpdateArticleDTO;
import xyz.lingview.dimstack.mapper.ArticleMapper;
import xyz.lingview.dimstack.dto.EditArticleDTO;
import xyz.lingview.dimstack.mapper.EditArticleMapper;
import xyz.lingview.dimstack.service.ArticleService;
import xyz.lingview.dimstack.service.EditArticleService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EditArticleServiceImpl implements EditArticleService {

    @Autowired
    private EditArticleMapper editArticleMapper;

    @Override
    public List<EditArticleDTO> getArticleListByUsername(String username) {
        String uuid = editArticleMapper.getUuidByUsername(username);
        if (uuid == null) {
            return List.of();
        }
        return editArticleMapper.getArticleListByUuid(uuid);
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

            int result = editArticleMapper.updateArticle(updateArticleDTO);
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
