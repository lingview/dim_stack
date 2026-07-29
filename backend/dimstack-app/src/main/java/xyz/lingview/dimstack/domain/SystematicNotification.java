package xyz.lingview.dimstack.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * @Author: lingview
 * @Date: 2026/01/31 12:42:42
 * @Description: 系统通知实体
 * @Version: 1.0
 */
@Data
public class SystematicNotification {

    private Integer id;
    private String uuid;
    private String content;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime create_time;
    private String type;
    private Integer status;

}
