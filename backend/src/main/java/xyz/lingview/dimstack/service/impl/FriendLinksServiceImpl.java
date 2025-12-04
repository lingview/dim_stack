package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.FriendLinks;
import xyz.lingview.dimstack.dto.request.FriendLinksRequestDTO;
import xyz.lingview.dimstack.mapper.FriendLinksMapper;
import xyz.lingview.dimstack.service.FriendLinksService;
import xyz.lingview.dimstack.util.RandomUtil;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2025/12/04 19:53:58
 * @Description: 友链控制服务
 * @Version: 1.0
 */
@Service
@Slf4j
public class FriendLinksServiceImpl implements FriendLinksService {

    @Autowired
    private FriendLinksMapper friendLinksMapper;

    @Override
    public boolean applyFriendLink(FriendLinksRequestDTO requestDTO) {
        try {
            FriendLinks friendLink = new FriendLinks();
            friendLink.setUuid(RandomUtil.generateUUID());
            friendLink.setSiteName(requestDTO.getSiteName());
            friendLink.setSiteUrl(requestDTO.getSiteUrl());
            friendLink.setSiteIcon(requestDTO.getSiteIcon() != null ? requestDTO.getSiteIcon() : "");
            friendLink.setSiteDescription(requestDTO.getSiteDescription());
            friendLink.setWebmasterName(requestDTO.getWebmasterName());
            friendLink.setContact(requestDTO.getContact());
            friendLink.setStatus(2);

            int result = friendLinksMapper.insert(friendLink);
            return result > 0;
        } catch (Exception e) {
            log.error("申请友链失败", e);
            return false;
        }
    }

    @Override
    public List<FriendLinks> getApprovedFriendLinks() {
        return friendLinksMapper.selectByStatus(1);
    }

    @Override
    public Map<String, Object> getFriendLinksByPage(Integer page, Integer size, Integer status) {
        int offset = (page - 1) * size;
        List<FriendLinks> friendLinks = friendLinksMapper.selectByPage(offset, size, status);
        int total = friendLinksMapper.count(status);
        int totalPages = (int) Math.ceil((double) total / size);

        Map<String, Object> result = new HashMap<>();
        result.put("data", friendLinks);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("total_pages", totalPages);

        return result;
    }

    @Override
    public boolean updateFriendLinkStatus(Integer id, Integer status) {
        try {
            int result = friendLinksMapper.updateStatusById(id, status);
            return result > 0;
        } catch (Exception e) {
            log.error("更新友链状态失败", e);
            return false;
        }
    }

    @Override
    public boolean deleteFriendLink(Integer id) {
        try {
            FriendLinks friendLink = friendLinksMapper.selectById(id);
            if (friendLink == null) {
                log.warn("尝试删除不存在的友链，ID: {}", id);
                return false;
            }

            if (friendLink.getStatus() == 0) {
                log.info("友链已处于删除状态，ID: {}", id);
                return true;
            }

            int result = friendLinksMapper.deleteById(id);
            return result > 0;
        } catch (Exception e) {
            log.error("删除友链失败，ID: {}", id, e);
            return false;
        }
    }


    @Override
    public boolean deleteFriendLinkPermanent(Integer id) {
        try {
            int result = friendLinksMapper.deleteByIdPermanent(id);
            return result > 0;
        } catch (Exception e) {
            log.error("彻底删除友链失败", e);
            return false;
        }
    }
}
