package xyz.lingview.dimstack.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class DashboardMenuDTO {
    private Integer id;
    private String title;
    private String icon;
    private String link;
    private List<DashboardMenuDTO> children;
    private String permission_code;
    private Integer sort_order;
    private String type;
    private List<DashboardMenuDTO> sidebarMenu;
    private List<DashboardMenuDTO> quickActions;
}
