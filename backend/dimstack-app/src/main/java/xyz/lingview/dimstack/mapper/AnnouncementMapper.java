package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.Announcement;

@Mapper
@Repository
public interface AnnouncementMapper {

    Announcement selectLatest();

    int insert(@Param("content") String content);
}
