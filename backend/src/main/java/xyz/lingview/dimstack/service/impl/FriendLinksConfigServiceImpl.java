package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.FriendLinksConfig;
import xyz.lingview.dimstack.mapper.FriendLinksConfigMapper;
import xyz.lingview.dimstack.service.FriendLinksConfigService;

@Service
@Slf4j
public class FriendLinksConfigServiceImpl implements FriendLinksConfigService {

    @Autowired
    private FriendLinksConfigMapper friendLinksConfigMapper;

    @Override
    public FriendLinksConfig getActiveConfig() {
        try {
            return friendLinksConfigMapper.selectActiveConfig();
        } catch (Exception e) {
            log.error("获取本站友链配置失败", e);
            return null;
        }
    }

    @Override
    public boolean updateConfig(FriendLinksConfig config) {
        try {
            FriendLinksConfig existing = friendLinksConfigMapper.selectActiveConfig();
            if (existing != null) {
                config.setId(existing.getId());
                return friendLinksConfigMapper.updateConfig(config) > 0;
            } else {
                config.setStatus(1);
                return friendLinksConfigMapper.insertConfig(config) > 0;
            }
        } catch (Exception e) {
            log.error("更新本站友链配置失败", e);
            return false;
        }
    }
}