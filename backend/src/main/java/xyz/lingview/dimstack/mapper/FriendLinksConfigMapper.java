package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.FriendLinksConfig;

@Mapper
@Repository
public interface FriendLinksConfigMapper {
    FriendLinksConfig selectActiveConfig();
    int updateConfig(FriendLinksConfig config);
    int insertConfig(FriendLinksConfig config);
}