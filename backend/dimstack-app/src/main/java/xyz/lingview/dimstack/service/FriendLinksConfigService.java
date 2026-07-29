package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.FriendLinksConfig;

public interface FriendLinksConfigService {
    FriendLinksConfig getActiveConfig();
    boolean updateConfig(FriendLinksConfig config);
}