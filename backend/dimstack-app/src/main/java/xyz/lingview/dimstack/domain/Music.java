package xyz.lingview.dimstack.domain;

import lombok.Data;

/**
 * @Author: lingview
 * @Date: 2026/01/24 00:39:25
 * @Description: 音乐播放器实体
 * @Version: 1.0
 */
@Data
public class Music {
    private Integer id;
    private String uuid;
    private String musicName;
    private String musicAuthor;
    private String musicUrl;
    private String createTime;
    private Integer status;
}