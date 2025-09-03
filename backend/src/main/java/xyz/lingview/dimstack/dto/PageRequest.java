package xyz.lingview.dimstack.dto;

import lombok.Data;

@Data
public class PageRequest {
    private int page = 1;
    private int size = 10;
    private String category;
}
