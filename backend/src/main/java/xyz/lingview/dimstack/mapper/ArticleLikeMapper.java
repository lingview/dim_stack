package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.ArticleLike;

@Mapper
@Repository
public interface ArticleLikeMapper {
    void insertLike(ArticleLike like);
    void deleteLike(String userId, String articleId);
    boolean existsLike(String userId, String articleId);
}
