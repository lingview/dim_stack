package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.CommentLike;

@Mapper
@Repository
public interface CommentLikeMapper {
    void insertLike(CommentLike like);
    void deleteLike(String userId, String commentId);
    boolean existsLike(String userId, String commentId);
}
