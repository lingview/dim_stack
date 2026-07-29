package xyz.lingview.dimstack.mapper;

import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.SiteConfig;
import org.apache.ibatis.annotations.Mapper;

@Mapper
@Repository
public interface SiteConfigMapper {
    // 查询站点配置信息
    SiteConfig getSiteConfig();

    // 查询站点名称
    String getSiteName();

    // 查询注册用户默认角色代码
    int getRegisterUserPermission();

    // 查询版权信息
    String getCopyright();

    // 获取文章默认状态
    int getArticleStatus();

    // 获取站点图标
    String getSiteIcon();

    // 获取ICP备案号
    String getIcpRecordNumber();

    // 获取公安联网备案号
    String getMpsRecordNumber();

    // 更新站点配置信息
    int updateSiteConfig(SiteConfig siteConfig);

    // 获取是否允许用户注册
    Integer getEnableRegister();
    
    // 获取管理员文章是否无需审核
    Integer getAdminPostNoReview();
}