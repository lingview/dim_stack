package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.FriendLinks;
import xyz.lingview.dimstack.dto.request.FriendLinksRequestDTO;

import java.util.List;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2025/12/04 19:53:18
 * @Description: 友链控制服务
 * @Version: 1.0
 */
public interface FriendLinksService {
    boolean applyFriendLink(FriendLinksRequestDTO requestDTO);
    List<FriendLinks> getApprovedFriendLinks();
    Map<String, Object> getFriendLinksByPage(Integer page, Integer size, Integer status);
    boolean updateFriendLinkStatus(Integer id, Integer status);
    boolean deleteFriendLink(Integer id);
    boolean deleteFriendLinkPermanent(Integer id);
    boolean updateFriendLink(Integer id, FriendLinksRequestDTO requestDTO);

}
