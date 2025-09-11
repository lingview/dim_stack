package xyz.lingview.dimstack.domain;

import lombok.Data;
import java.util.UUID;

@Data
public class Menus {
    private Integer id;
    private String menus_id;
    private String user_id;
    private String menus_name;
    private String menus_url;
    private Integer status;

    public static String generateMenusId() {
        return "menu_" + UUID.randomUUID().toString().replace("-", "");
    }
}
