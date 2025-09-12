package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface StatisticsMapper {
    Long countArticles();
    Long countUsers();
    Long countComments();
    Long sumPageViews();
}
