package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.FriendLinks;
import xyz.lingview.dimstack.dto.request.FriendLinksRequestDTO;
import xyz.lingview.dimstack.mapper.FriendLinksMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.FriendLinksService;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.util.RandomUtil;
import xyz.lingview.dimstack.util.SiteConfigUtil;

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

    @Autowired
    private MailService mailService;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Autowired
    private UserInformationMapper userInformationMapper;

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

            if (result > 0) {
                sendFriendLinkNotification(requestDTO);
            } else {
                log.warn("友链申请保存到数据库失败");
            }

            return result > 0;
        } catch (Exception e) {
            log.error("申请友链失败", e);
            return false;
        }
    }

    @Async
    public void sendFriendLinkNotification(FriendLinksRequestDTO requestDTO) {
        try {
            String siteName = siteConfigUtil.getSiteName();
            List<String> emails = userInformationMapper.getEmailsByPermissionCode("post:review");

            if (emails == null || emails.isEmpty()) {
                log.warn("未找到拥有 'post:review' 权限的用户，跳过发送审核通知邮件");
                return;
            }

            String emailContent = "站点名称：" + requestDTO.getSiteName() + "\n" +
                    "站点地址：" + requestDTO.getSiteUrl() + "\n" +
                    "站长姓名：" + requestDTO.getWebmasterName() + "\n" +
                    "联系方式：" + requestDTO.getContact() + "\n" +
                    "站点描述：" + requestDTO.getSiteDescription() + "\n\n" +
                    "请尽快审核该友链申请";

            for (String email : emails) {
                try {
                    mailService.sendSimpleMail(email, siteName + " 友链申请", emailContent);
                    log.info("已发送审核通知邮件至: {}", email);
                } catch (Exception e) {
                    log.error("发送审核通知邮件失败，目标邮箱: {}", email, e);
                }
            }
        } catch (Exception e) {
            log.error("发送友链申请通知邮件时发生异常", e);
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


    @Override
    public boolean updateFriendLink(Integer id, FriendLinksRequestDTO requestDTO) {
        try {
            FriendLinks existingLink = friendLinksMapper.selectById(id);
            if (existingLink == null) {
                log.warn("尝试更新不存在的友链，ID: {}", id);
                return false;
            }

            existingLink.setSiteName(requestDTO.getSiteName());
            existingLink.setSiteUrl(requestDTO.getSiteUrl());
            existingLink.setSiteIcon(requestDTO.getSiteIcon() != null ? requestDTO.getSiteIcon() : "");
            existingLink.setSiteDescription(requestDTO.getSiteDescription());
            existingLink.setWebmasterName(requestDTO.getWebmasterName());
            existingLink.setContact(requestDTO.getContact());

            int result = friendLinksMapper.updateById(existingLink);
            return result > 0;
        } catch (Exception e) {
            log.error("更新友链失败", e);
            return false;
        }
    }
}
