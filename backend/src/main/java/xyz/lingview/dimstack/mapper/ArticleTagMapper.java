package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import xyz.lingview.dimstack.domain.ArticleTag;

import java.util.List;

@Mapper
public interface ArticleTagMapper {
    List<ArticleTag> findAllEnabledTags();
}
