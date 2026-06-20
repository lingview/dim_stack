package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
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
import xyz.lingview.dimstack.mapper.UserPermissionMapper;
import xyz.lingview.dimstack.service.CommentService;
import xyz.lingview.dimstack.service.LLMService;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.service.NotificationService;
import xyz.lingview.dimstack.util.SiteConfigUtil;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Autowired
    private UserPermissionMapper userPermissionMapper;

    @Autowired
    private CommentLikeMapper commentLikeMapper;
    
    @Autowired
    private MailService mailService;
    
    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private LLMService llmService;

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
    public int addComment(String username, AddCommentRequestDTO request) {

        String userId = userInformationMapper.selectUserUUID(username);

        Article article = articleMapper.selectArticleByAlias(request.getArticle_alias());
        if (article == null) {
            throw new RuntimeException("文章不存在");
        }

        if (!siteConfigUtil.isCommentEnabled()) {
            throw new RuntimeException("站点评论区已关闭");
        }
        if (article.getEnable_comment() != null && article.getEnable_comment() == 0) {
            throw new RuntimeException("该文章评论区已关闭");
        }

        Comment comment = new Comment();
        comment.setUser_id(userId);
        comment.setComment_id(UUID.randomUUID().toString());
        comment.setArticle_id(article.getArticle_id());
        comment.setContent(request.getContent());
        comment.setComment_like_count(0L);
        int commentStatus;

        List<String> userPermissions = userPermissionMapper.findPermissionCodesByUserName(username);
        if (userPermissions.contains("system:comments:review") && siteConfigUtil.adminCommentNoReview()) {
            commentStatus = 1;
        } else {
            commentStatus = siteConfigUtil.getCommentStatus();
        }
        comment.setStatus(commentStatus);
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

        // AI审核
        if (commentStatus == 3 && siteConfigUtil.isLlmCommentReviewEnabled()) {
            triggerLlmCommentReview(comment, article, username);
        } else if (commentStatus == 3) {
            sendCommentReviewNotification(comment, article, username);
        } else {
            sendCommentNotification(comment, article, username);
        }

        return commentStatus;
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

            sendLikeNotification(comment, username);
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

    /**
     * 发送评论通知邮件
     * @param comment 新增的评论
     * @param article 评论所属文章
     * @param commenterName 评论者用户名
     */
    private void sendCommentNotification(Comment comment, Article article, String commenterName) {
        try {
            if (!siteConfigUtil.isNotificationEnabled()) {
                return;
            }
            
            String siteName = siteConfigUtil.getSiteName();
            String subject = siteName + " 评论通知";
            
            // 给文章作者发送邮件（如果不是自己评论自己的文章）
            if (!comment.getUser_id().equals(article.getUuid())) {
                UserInformation articleAuthor = userInformationMapper.selectUserByUUID(article.getUuid());
                if (articleAuthor != null && articleAuthor.getEmail() != null) {
                    String content = "用户：" + commenterName + " 评论了您的文章《" + article.getArticle_name() + "》：" + comment.getContent();
                    mailService.sendSimpleMail(articleAuthor.getEmail(), subject, content);
                    notificationService.sendSystemNotification(articleAuthor.getUsername(), "系统通知", content);
                }
            }
            
            // 如果是回复评论，也给原评论作者发送邮件（如果不是回复自己的评论）
            if (comment.getTo_comment_id() != null && !comment.getTo_comment_id().isEmpty()) {
                Comment originalComment = commentMapper.selectCommentByCommentId(comment.getTo_comment_id());
                if (originalComment != null && 
                    !originalComment.getUser_id().equals(article.getUuid()) && 
                    !originalComment.getUser_id().equals(comment.getUser_id())) {
                    UserInformation originalCommentAuthor = userInformationMapper.selectUserByUUID(originalComment.getUser_id());
                    if (originalCommentAuthor != null && originalCommentAuthor.getEmail() != null) {
                        String content = "用户 " + commenterName + " 回复了您的评论：" + comment.getContent();
                        mailService.sendSimpleMail(originalCommentAuthor.getEmail(), subject, content);
                        notificationService.sendSystemNotification(originalCommentAuthor.getUsername(), "系统通知", content);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("评论通知邮件发送失败{}", String.valueOf(e));
        }
    }
    
    /**
     * 发送点赞通知邮件
     * @param comment 被点赞的评论
     * @param likerUsername 点赞者用户名
     */
    private void sendLikeNotification(Comment comment, String likerUsername) {
        try {
            if (!siteConfigUtil.isNotificationEnabled()) {
                return;
            }
            
            // 获取被点赞评论的作者信息
            UserInformation commentAuthor = userInformationMapper.selectUserByUUID(comment.getUser_id());
            String likerUserId = userInformationMapper.selectUserUUID(likerUsername);
            
            // 不给自己点赞发通知
            if (commentAuthor != null && commentAuthor.getEmail() != null &&
                    likerUserId != null && !commentAuthor.getUuid().equals(likerUserId)) {
                String siteName = siteConfigUtil.getSiteName();
                String subject = siteName + " 点赞通知";
                String content = "用户 " + likerUsername + " 点赞了您的评论：" + comment.getContent();
                
                mailService.sendSimpleMail(commentAuthor.getEmail(), subject, content);
                notificationService.sendSystemNotification(commentAuthor.getUsername(), "系统通知", content);
            }
        } catch (Exception e) {
            log.warn("点赞通知邮件发送失败{}", String.valueOf(e));
        }
    }

    private void sendCommentReviewNotification(Comment comment, Article article, String commenterName) {
        try {
            if (!siteConfigUtil.isNotificationEnabled()) {
                return;
            }
            UserInformation commenter = userInformationMapper.selectUserByUUID(comment.getUser_id());
            String siteName = siteConfigUtil.getSiteName();
            String subject = siteName + " 评论审核通知";
            String content = "用户 " + commenterName + " 发表了新评论：《" + article.getArticle_name() + "》\"" + comment.getContent() + "\"，需要审核。";

            List<String> reviewers = userInformationMapper.getUsernamesByPermissionCode("system:comments:review");
            if (reviewers != null) {
                for (String reviewer : reviewers) {
                    notificationService.sendSystemNotification(reviewer, subject, content);
                }
            }

            List<String> reviewerEmails = userInformationMapper.getEmailsByPermissionCode("system:comments:review");
            if (reviewerEmails != null) {
                for (String email : reviewerEmails) {
                    mailService.sendSimpleMail(email, subject, content);
                }
            }
        } catch (Exception e) {
            log.warn("评论审核通知发送失败{}", String.valueOf(e));
        }
    }

    private void triggerLlmCommentReview(Comment comment, Article article, String commenterName) {
        new Thread(() -> {
            try {
                String result = llmService.reviewComment(comment.getContent());
                if ("PASS".equals(result)) {
                    commentMapper.updateCommentStatus(comment.getComment_id(), 1);
                    sendReviewResultToAuthor(comment, true);
                    sendCommentNotification(comment, article, commenterName);
                } else if ("REJECT".equals(result)) {
                    commentMapper.updateCommentStatus(comment.getComment_id(), 4);
                    sendReviewResultToAuthor(comment, false);
                } else {
                    sendCommentReviewNotification(comment, article, commenterName);
                }
            } catch (Exception e) {
                log.warn("LLM评论审核异常: {}", e.getMessage());
            }
        }).start();
    }

    private void sendReviewResultToAuthor(Comment comment, boolean passed) {
        try {
            if (!siteConfigUtil.isNotificationEnabled()) return;

            UserInformation author = userInformationMapper.selectUserByUUID(comment.getUser_id());
            if (author == null || author.getEmail() == null) return;

            String siteName = siteConfigUtil.getSiteName();
            String resultText = passed ? "通过审核" : "被标记为违规";
            String subject = siteName + " 评论审核结果";
            String content = "您的评论 \"" + comment.getContent() + "\" " + resultText + "。";

            notificationService.sendSystemNotification(author.getUsername(), "系统通知", content);
            mailService.sendSimpleMail(author.getEmail(), subject, content);
        } catch (Exception e) {
            log.warn("发送评论审核结果通知失败", e);
        }
    }
}