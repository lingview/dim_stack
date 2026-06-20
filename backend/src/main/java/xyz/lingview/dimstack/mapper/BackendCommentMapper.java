package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.Comment;
import xyz.lingview.dimstack.dto.request.CommentDTO;
import java.util.List;
import java.util.Map;

@Mapper
@Repository
public interface BackendCommentMapper {
    // 查询文章的所有评论
    List<CommentDTO> selectCommentsWithUserInfoByArticleId(@Param("article_id") String article_id);

    // 根据评论id获取评论详情
    Comment selectCommentByCommentId(@Param("comment_id") String comment_id);

    // 更新评论内容
    int updateCommentContent(@Param("comment_id") String comment_id, @Param("content") String content);

    // 删除评论
    int deleteComment(@Param("comment_id") String comment_id);

    // 获取所有评论
    List<CommentDTO> selectAllCommentsWithPagination(@Param("offset") int offset, @Param("limit") int limit);

    // 根据文章id获取文章标题
    String selectArticleTitleByArticleId(@Param("article_id") String article_id);

    int countTotalComments();

    int updateCommentTime(@Param("comment_id") String comment_id, @Param("create_time") String create_time);

    int updateCommentUser(@Param("comment_id") String comment_id, @Param("user_id") String user_id);

    List<Map<String, Object>> searchUsersByPrefix(@Param("prefix") String prefix);

    List<CommentDTO> selectCommentsByStatus(@Param("status") int status, @Param("offset") int offset, @Param("limit") int limit);

    int countByStatus(@Param("status") int status);

    List<CommentDTO> selectAllReviewComments(@Param("offset") int offset, @Param("limit") int limit);

    int countAllReview();

    int updateCommentStatus(@Param("comment_id") String comment_id, @Param("status") int status);
}
