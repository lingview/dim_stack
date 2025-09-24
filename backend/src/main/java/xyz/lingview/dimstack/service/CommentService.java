package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.request.AddCommentRequestDTO;
import xyz.lingview.dimstack.dto.request.CommentDTO;

import java.util.List;

public interface CommentService {
    List<CommentDTO> getCommentsByArticleAlias(String articleAlias, String username);
    void addComment(String username, AddCommentRequestDTO request);
    void likeComment(String username, String commentId);
    void deleteComment(String username, String commentId);
}
