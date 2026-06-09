package xyz.lingview.dimstack.dto.response;

import lombok.Data;

import java.util.Date;

@Data
public class ApiKeyResponseDTO {
    private Integer id;
    private String description;
    private Date createTime;
    private Date updateTime;
    private Integer status;
}
