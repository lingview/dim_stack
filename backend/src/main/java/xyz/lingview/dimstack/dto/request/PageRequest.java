package xyz.lingview.dimstack.dto.request;

import lombok.Data;

@Data
public class PageRequest {
    private int page = 1;
    private int size = 10;
    private String category;
}
