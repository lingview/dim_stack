package xyz.lingview.dimstack.dto;

import lombok.Data;
import java.util.List;

@Data
public class PageResult<T> {
    private List<T> data;
    private int total;
    private int page;
    private int size;
    private int total_pages;
}
