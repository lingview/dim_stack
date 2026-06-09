package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.util.Date;

@Data
public class ApiKey {
    private Integer id;
    private String user_id;
    private String key_hash;
    private String description;
    private Date create_time;
    private Date update_time;
    private Integer status;
}
