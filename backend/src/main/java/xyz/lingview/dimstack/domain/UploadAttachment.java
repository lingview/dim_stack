package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class UploadAttachment {
    private String uuid;
    private String attachment_id;
    private String original_filename;
    private String attachment_path;
    private String access_key;
    private int status;
}
