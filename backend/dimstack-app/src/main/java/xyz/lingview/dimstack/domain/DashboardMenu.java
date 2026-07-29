package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DashboardMenu {
    private Integer id;
    private String title;
    private String icon;
    private String link;
    private Integer parent_id;
    private String permission_code;
    private Integer sort_order;
    private LocalDateTime create_time;
    private String type;
}
