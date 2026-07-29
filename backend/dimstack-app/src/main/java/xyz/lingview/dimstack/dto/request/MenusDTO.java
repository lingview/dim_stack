package xyz.lingview.dimstack.dto.request;

import lombok.Data;

@Data
public class MenusDTO {
    private String menus_id;
    private String user_id;
    private String username;
    private String menus_name;
    private String menus_url;
    private Integer sort_order;
    private Integer status;
}
