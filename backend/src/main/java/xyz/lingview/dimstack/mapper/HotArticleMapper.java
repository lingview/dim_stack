package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import xyz.lingview.dimstack.dto.HotArticleDTO;
import java.util.List;

@Mapper
public interface HotArticleMapper {
    List<HotArticleDTO> selectHotArticles();
}
