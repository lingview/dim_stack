package xyz.lingview.dimstack.mapper;

import xyz.lingview.dimstack.dto.ArticleDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface ArticleMapper {

    List<ArticleDTO> selectArticlesForHomePage(int offset, int size, String category);

    int countArticles(String category);
}
