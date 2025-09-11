package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class Permission {
    private Integer id;
    private String code;
    private String name;
    private String module;
    private java.sql.Timestamp create_time;
}
