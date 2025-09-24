package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.domain.Comment;
import xyz.lingview.dimstack.domain.CommentLike;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.request.AddCommentRequestDTO;
import xyz.lingview.dimstack.dto.request.CommentDTO;
import xyz.lingview.dimstack.mapper.ArticleMapper;
import xyz.lingview.dimstack.mapper.CommentLikeMapper;
import xyz.lingview.dimstack.mapper.CommentMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.CommentService;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Autowired
    private CommentLikeMapper commentLikeMapper;

    @Override
    public List<CommentDTO> getCommentsByArticleAlias(String articleAlias, String username) {
        Article article = articleMapper.selectArticleByAlias(articleAlias);
        if (article == null) {
            return new ArrayList<>();
        }

        List<Comment> comments = commentMapper.selectCommentsByArticleId(article.getArticle_id());

        String currentUserUuid = null;
        if (username != null) {
            currentUserUuid = userInformationMapper.selectUserUUID(username);
        }

        return buildCommentTree(comments, currentUserUuid);
    }
    @Override
    public void addComment(String username, AddCommentRequestDTO request) {

        String userId = userInformationMapper.selectUserUUID(username);

        Article article = articleMapper.selectArticleByAlias(request.getArticle_alias());
        if (article == null) {
            throw new RuntimeException("文章不存在");
        }

        Comment comment = new Comment();
        comment.setUser_id(userId);
        comment.setComment_id(UUID.randomUUID().toString());
        comment.setArticle_id(article.getArticle_id());
        comment.setContent(request.getContent());
        comment.setComment_like_count(0L);
        comment.setStatus(1);
        comment.setCreate_time(LocalDateTime.now());
        comment.setUpdate_time(LocalDateTime.now());

        if (request.getTo_comment_id() != null && !request.getTo_comment_id().isEmpty()) {
            Comment toComment = commentMapper.selectCommentByCommentId(request.getTo_comment_id());
            if (toComment != null) {
                comment.setTo_comment_id(request.getTo_comment_id());

                if (toComment.getRoot_comment_id() != null) {
                    comment.setRoot_comment_id(toComment.getRoot_comment_id());
                } else {
                    comment.setRoot_comment_id(toComment.getComment_id());
                }
            }
        }

        commentMapper.insertComment(comment);
    }

    @Override
    public void likeComment(String username, String commentId) {
        String userId = userInformationMapper.selectUserUUID(username);

        Comment comment = commentMapper.selectCommentByCommentId(commentId);
        if (comment == null) {
            throw new RuntimeException("评论不存在");
        }

        // 检查用户是否已经点赞过该评论
        if (commentLikeMapper.existsLike(userId, commentId)) {
            // 如果已点赞，则取消点赞
            commentLikeMapper.deleteLike(userId, commentId);
            Long newLikeCount = comment.getComment_like_count() - 1;
            commentMapper.updateCommentLikeCount(commentId, newLikeCount);
        } else {
            CommentLike like = new CommentLike();
            like.setUser_id(userId);
            like.setComment_id(commentId);
            like.setCreate_time(LocalDateTime.now());
            commentLikeMapper.insertLike(like);

            Long newLikeCount = comment.getComment_like_count() + 1;
            commentMapper.updateCommentLikeCount(commentId, newLikeCount);
        }
    }


    @Override
    public void deleteComment(String username, String commentId) {
        String userId = userInformationMapper.selectUserUUID(username);

        Comment comment = commentMapper.selectCommentByCommentId(commentId);
        if (comment == null) {
            throw new RuntimeException("评论不存在");
        }

        if (!comment.getUser_id().equals(userId)) {
            throw new RuntimeException("无权限删除该评论");
        }

        commentMapper.deleteComment(commentId);
    }

    private List<CommentDTO> buildCommentTree(List<Comment> comments, String currentUserUuid) {
        if (comments == null || comments.isEmpty()) {
            return new ArrayList<>();
        }

        Map<String, UserInformation> userMap = new HashMap<>();
        for (Comment comment : comments) {
            String userId = comment.getUser_id();
            if (userId != null && !userMap.containsKey(userId)) {
                UserInformation user = userInformationMapper.selectUserByUUID(userId);
                if (user != null) {
                    userMap.put(userId, user);
                }
            }
        }

        List<CommentDTO> allCommentDTOs = new ArrayList<>();
        Map<String, CommentDTO> dtoMap = new HashMap<>();

        for (Comment comment : comments) {
            CommentDTO dto = convertToDTO(comment, userMap, currentUserUuid);
            allCommentDTOs.add(dto);
            dtoMap.put(comment.getComment_id(), dto);
        }

        List<CommentDTO> rootComments = new ArrayList<>();

        for (CommentDTO dto : allCommentDTOs) {
            if (dto.getTo_comment_id() == null || dto.getTo_comment_id().isEmpty()) {
                rootComments.add(dto);
            } else {
                CommentDTO parentDTO = dtoMap.get(dto.getTo_comment_id());
                if (parentDTO != null) {
                    if (parentDTO.getChildren() == null) {
                        parentDTO.setChildren(new ArrayList<>());
                    }
                    parentDTO.getChildren().add(dto);
                }
            }
        }

        return rootComments;
    }

    private CommentDTO convertToDTO(Comment comment, Map<String, UserInformation> userMap, String currentUserUuid) {
        CommentDTO dto = new CommentDTO();
        dto.setComment_id(comment.getComment_id());
        dto.setUser_id(comment.getUser_id());
        dto.setContent(comment.getContent());
        dto.setCreate_time(comment.getCreate_time());
        dto.setComment_like_count(comment.getComment_like_count());
        dto.setTo_comment_id(comment.getTo_comment_id());

        String userId = comment.getUser_id();
        if (userId != null && userMap.containsKey(userId)) {
            UserInformation user = userMap.get(userId);
            if (user != null) {
                dto.setUsername(user.getUsername());
                dto.setAvatar(user.getAvatar());
            } else {
                dto.setUsername("未知用户");
                dto.setAvatar(null);
            }
        } else {
            dto.setUsername("未知用户");
            dto.setAvatar(null);
        }

        // 检查当前用户是否已点赞该评论
        if (currentUserUuid != null) {
            dto.setIs_liked(commentLikeMapper.existsLike(currentUserUuid, comment.getComment_id()));
        }

        dto.setChildren(new ArrayList<>());

        return dto;
    }
}
