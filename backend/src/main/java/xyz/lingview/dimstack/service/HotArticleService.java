package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.HotArticleDTO;
import java.util.List;

public interface HotArticleService {
    List<HotArticleDTO> getHotArticles();
}
