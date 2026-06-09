package xyz.lingview.dimstack.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApiKeyCreateRequestDTO {
    @Size(max = 255, message = "备注描述长度不能超过255个字符")
    private String description;
}
