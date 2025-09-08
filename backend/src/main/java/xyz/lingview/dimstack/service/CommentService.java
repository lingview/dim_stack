package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.AddCommentRequest;
import xyz.lingview.dimstack.dto.CommentDTO;

import java.util.List;

public interface CommentService {
    List<CommentDTO> getCommentsByArticleAlias(String articleAlias);
    void addComment(String username, AddCommentRequest request);
    void likeComment(String username, String commentId);
    void deleteComment(String username, String commentId);
}
