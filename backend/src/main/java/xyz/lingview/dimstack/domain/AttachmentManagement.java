package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * @Author: lingview
 * @Date: 2026/02/08 16:50:52
 * @Description: 附件管理实体
 * @Version: 1.0
 */
@Data
public class AttachmentManagement {
    private String uuid;
    private String attachment_id;
    private String attachment_path;
    private String access_key;
    private LocalDateTime create_time;
    private LocalDateTime deleted_time;
    private int status;
    private String username;
}