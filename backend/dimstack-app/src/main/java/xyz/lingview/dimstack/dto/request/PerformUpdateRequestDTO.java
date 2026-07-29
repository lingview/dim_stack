package xyz.lingview.dimstack.dto.request;

import lombok.Data;

/**
 * @Author: lingview
 * @Date: 2026/01/28 14:09:08
 * @Description: 是否更新重启请求体
 * @Version: 1.0
 */
@Data
public class PerformUpdateRequestDTO {
    private boolean restartAfterUpdate;
}
