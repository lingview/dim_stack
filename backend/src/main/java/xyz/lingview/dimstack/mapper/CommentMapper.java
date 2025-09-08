package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.Comment;

import java.util.List;

@Mapper
@Repository
public interface CommentMapper {
    void insertComment(Comment comment);
    List<Comment> selectCommentsByArticleId(String articleId);
    Comment selectCommentByCommentId(String commentId);
    void updateCommentLikeCount(String commentId, Long likeCount);
    void deleteComment(String commentId);
}
