package xyz.lingview.dimstack.service.impl;

import xyz.lingview.dimstack.dto.HotArticleDTO;
import xyz.lingview.dimstack.mapper.HotArticleMapper;
import xyz.lingview.dimstack.service.HotArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HotArticleServiceImpl implements HotArticleService {

    @Autowired
    private HotArticleMapper hotArticleMapper;

    @Override
    public List<HotArticleDTO> getHotArticles() {
        return hotArticleMapper.selectHotArticles();
    }
}
