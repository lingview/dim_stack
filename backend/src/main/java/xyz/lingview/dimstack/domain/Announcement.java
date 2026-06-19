package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.util.Date;

@Data
public class Announcement {
    private Integer id;
    private String content;
    private Date create_time;
    private Date update_time;
}
