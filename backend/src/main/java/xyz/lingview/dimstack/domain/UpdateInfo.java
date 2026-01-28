package xyz.lingview.dimstack.domain;

import lombok.Data;

/**
 * @Author: lingview
 * @Date: 2026/01/27 20:30:36
 * @Description: 系统更新实体
 * @Version: 1.0
 */
@Data
public class UpdateInfo {
    private String version;
    private String releaseDate;
    private String downloadUrl;
    private String changelog;
    private String minJavaVersion;
    private boolean requiredDatabaseMigration;
    private String minCompatibleVersion;
    private String checksum;
    private boolean backupRecommended;
}
