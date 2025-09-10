package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.Comment;
import xyz.lingview.dimstack.dto.CommentDTO;
import java.util.List;

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
}
