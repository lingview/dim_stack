package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StorageMigrationFailedItem {
    private int id;
    private int migration_id;
    private String attachment_id;
    private String file_path;
    private String error_msg;
    private LocalDateTime created_at;
}