package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * @Author: lingview
 * @Date: 2026/07/17 20:00:00
 * @Description: 存储方式实体
 * @Version: 1.0
 */
@Data
public class StorageMethod {
    private String uuid;
    private String user_uuid;
    private String name;
    private String type;
    private String config;
    private int status;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
}