package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class StorageMigrationLog {
    private int id;
    private String source_storage_id;
    private String target_storage_id;
    private int total;
    private int success;
    private int failed;
    private int status;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
    private List<StorageMigrationFailedItem> failedItems;
}