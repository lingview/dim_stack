package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class Role {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private Byte status;
}
