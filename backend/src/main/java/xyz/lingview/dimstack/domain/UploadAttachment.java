package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class UploadAttachment {
    private String uuid;
    private String attachment_id;
    private String attachment_path;
    private int status;
}
