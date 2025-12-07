package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.ArticleTag;
import xyz.lingview.dimstack.dto.request.ArticleTagDTO;
import xyz.lingview.dimstack.mapper.ArticleTagMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.ArticleTagService;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ArticleTagServiceImpl implements ArticleTagService {

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Override
    public List<ArticleTagDTO> getAllTags() {
        List<ArticleTag> tags = articleTagMapper.findAll();
        return convertToDTOList(tags);
    }

    @Override
    public List<ArticleTagDTO> getActiveTags() {
        List<ArticleTag> tags = articleTagMapper.findByStatus(1);
        return convertToDTOList(tags);
    }

    @Override
    public ArticleTagDTO getTagById(Integer id) {
        ArticleTag tag = articleTagMapper.findById(id);
        return tag != null ? convertToDTO(tag) : null;
    }

    @Override
    public boolean createTag(ArticleTagDTO tagDTO, String founderUsername) {
        try {
            String tagName = tagDTO.getTag_name().trim();

            ArticleTag existingTag = articleTagMapper.findByName(tagName);
            if (existingTag != null) {
                throw new RuntimeException("标签名称已存在");
            }

            String founderUUID = userInformationMapper.selectUserUUID(founderUsername);
            if (founderUUID == null) {
                throw new RuntimeException("未找到用户信息");
            }

            ArticleTag tag = new ArticleTag();
            tag.setTag_name(tagName);
            tag.setTag_explain(tagDTO.getTag_explain());
            tag.setFounder(founderUUID);
            tag.setStatus(1);

            int result = articleTagMapper.insert(tag);
            return result > 0;
        } catch (Exception e) {
            log.error("创建标签失败", e);
            return false;
        }
    }

    @Override
    public boolean updateTag(ArticleTagDTO tagDTO) {
        try {
            ArticleTag tag = articleTagMapper.findById(tagDTO.getId());
            if (tag == null) {
                throw new RuntimeException("标签不存在");
            }

            String tagName = tagDTO.getTag_name().trim();

            ArticleTag existingTag = articleTagMapper.findByName(tagName);
            if (existingTag != null && !existingTag.getId().equals(tagDTO.getId())) {
                throw new RuntimeException("标签名称已存在");
            }

            tag.setTag_name(tagName);
            tag.setTag_explain(tagDTO.getTag_explain());

            int result = articleTagMapper.update(tag);
            return result > 0;
        } catch (Exception e) {
            log.error("更新标签失败", e);
            return false;
        }
    }

    @Override
    public boolean deleteTag(Integer id) {
        try {
            int result = articleTagMapper.updateStatus(id, 0);
            return result > 0;
        } catch (Exception e) {
            log.error("删除标签失败", e);
            return false;
        }
    }

    @Override
    public boolean activateTag(Integer id) {
        try {
            int result = articleTagMapper.updateStatus(id, 1);
            return result > 0;
        } catch (Exception e) {
            log.error("激活标签失败", e);
            return false;
        }
    }

    private List<ArticleTagDTO> convertToDTOList(List<ArticleTag> tags) {
        return tags.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private ArticleTagDTO convertToDTO(ArticleTag tag) {
        ArticleTagDTO dto = new ArticleTagDTO();
        dto.setId(tag.getId());
        dto.setTag_name(tag.getTag_name());
        dto.setTag_explain(tag.getTag_explain());

        if (tag.getFounder() != null) {
            String founderName = userInformationMapper.getUsernameByUuid(tag.getFounder());
            dto.setFounder(founderName != null ? founderName : tag.getFounder());
        } else {
            dto.setFounder(null);
        }

        dto.setStatus(tag.getStatus());
        if (tag.getCreate_time() != null) {
            dto.setCreate_time(tag.getCreate_time().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        return dto;
    }
}
