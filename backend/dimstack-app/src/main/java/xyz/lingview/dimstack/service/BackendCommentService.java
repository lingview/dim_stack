package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.Comment;
import xyz.lingview.dimstack.dto.request.CommentDTO;

import java.util.List;
import java.util.Map;

public interface BackendCommentService {

    List<CommentDTO> getCommentsByArticleId(String article_id);

    List<CommentDTO> getAllCommentsWithPagination(int page, int size);

    String getArticleTitle(String article_id);

    Comment getCommentDetail(String comment_id);

    boolean updateCommentContent(String comment_id, String content);

    boolean deleteComment(String comment_id);

    int getTotalCommentsCount();

    boolean updateCommentTime(String comment_id, String create_time);

    boolean updateCommentUser(String comment_id, String username);

    List<Map<String, Object>> searchUsers(String prefix);

    List<CommentDTO> getCommentsByStatus(int status, int page, int size);

    int countByStatus(int status);

    List<CommentDTO> getAllReviewComments(int page, int size);

    int countAllReview();

    boolean updateCommentReviewStatus(String comment_id, int status);
}