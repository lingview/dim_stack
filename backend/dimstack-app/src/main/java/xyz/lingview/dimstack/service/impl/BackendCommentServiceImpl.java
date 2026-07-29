package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.domain.Comment;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.request.CommentDTO;
import xyz.lingview.dimstack.mapper.ArticleMapper;
import xyz.lingview.dimstack.mapper.BackendCommentMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.BackendCommentService;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.service.NotificationService;
import xyz.lingview.dimstack.util.SiteConfigUtil;

import java.util.*;

@Slf4j
@Service
public class BackendCommentServiceImpl implements BackendCommentService {

    @Autowired
    private BackendCommentMapper backendCommentMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Autowired
    private MailService mailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Override
    public List<CommentDTO> getCommentsByArticleId(String article_id) {
        log.info("查询文章评论，article_id = {}", article_id);

        List<CommentDTO> comments = backendCommentMapper.selectCommentsWithUserInfoByArticleId(article_id);
        log.info("查询到 {} 条评论", comments.size());

        for (CommentDTO c : comments) {
            log.info("comment_id={}, to_comment_id={}, content={}", c.getComment_id(), c.getTo_comment_id(), c.getContent().substring(0, Math.min(20, c.getContent().length())));
        }

        List<CommentDTO> tree = buildCommentTree(comments);
        log.info("构建树形结构完成，根节点数：{}", tree.size());

        return tree;
    }

    @Override
    public List<CommentDTO> getAllCommentsWithPagination(int page, int size) {
        int offset = (page - 1) * size;
        return backendCommentMapper.selectAllCommentsWithPagination(offset, size);
    }

    @Override
    public String getArticleTitle(String article_id) {
        Article article = articleMapper.selectArticleByArticleId(article_id);
        return article != null ? article.getArticle_name() : "未知文章";
    }

    @Override
    public Comment getCommentDetail(String comment_id) {
        return backendCommentMapper.selectCommentByCommentId(comment_id);
    }

    @Override
    public boolean updateCommentContent(String comment_id, String content) {
        return backendCommentMapper.updateCommentContent(comment_id, content) > 0;
    }

    @Override
    public boolean deleteComment(String comment_id) {
        return backendCommentMapper.deleteComment(comment_id) > 0;
    }

    private List<CommentDTO> buildCommentTree(List<CommentDTO> comments) {
        if (comments == null || comments.isEmpty()) {
            return new ArrayList<>();
        }

        for (CommentDTO comment : comments) {
            if (comment.getChildren() == null) {
                comment.setChildren(new ArrayList<>());
            }
        }

        Map<String, CommentDTO> commentMap = new HashMap<>();
        for (CommentDTO comment : comments) {
            commentMap.put(comment.getComment_id(), comment);
        }

        List<CommentDTO> rootComments = new ArrayList<>();

        for (CommentDTO comment : comments) {
            if (comment.getTo_comment_id() == null || comment.getTo_comment_id().trim().isEmpty()) {
                rootComments.add(comment);
            } else {
                CommentDTO parent = commentMap.get(comment.getTo_comment_id());
                if (parent != null) {
                    parent.getChildren().add(comment);
                } else {
                    rootComments.add(comment);
                }
            }
        }

        rootComments.sort(Comparator.comparing(CommentDTO::getCreate_time));
        for (CommentDTO root : rootComments) {
            root.getChildren().sort(Comparator.comparing(CommentDTO::getCreate_time));
        }

        return rootComments;
    }

    @Override
    public int getTotalCommentsCount() {
        return backendCommentMapper.countTotalComments();
    }

    @Override
    public boolean updateCommentTime(String comment_id, String create_time) {
        return backendCommentMapper.updateCommentTime(comment_id, create_time) > 0;
    }

    @Override
    public boolean updateCommentUser(String comment_id, String username) {
        String user_id = userInformationMapper.selectUserUUID(username);
        if (user_id == null) {
            return false;
        }
        return backendCommentMapper.updateCommentUser(comment_id, user_id) > 0;
    }

    @Override
    public List<Map<String, Object>> searchUsers(String prefix) {
        return backendCommentMapper.searchUsersByPrefix(prefix);
    }

    @Override
    public List<CommentDTO> getCommentsByStatus(int status, int page, int size) {
        int offset = (page - 1) * size;
        return backendCommentMapper.selectCommentsByStatus(status, offset, size);
    }

    @Override
    public int countByStatus(int status) {
        return backendCommentMapper.countByStatus(status);
    }

    @Override
    public List<CommentDTO> getAllReviewComments(int page, int size) {
        int offset = (page - 1) * size;
        return backendCommentMapper.selectAllReviewComments(offset, size);
    }

    @Override
    public int countAllReview() {
        return backendCommentMapper.countAllReview();
    }

    @Override
    public boolean updateCommentReviewStatus(String comment_id, int status) {
        boolean result = backendCommentMapper.updateCommentStatus(comment_id, status) > 0;
        if (result && (status == 1 || status == 4)) {
            sendReviewResultNotification(comment_id, status);
        }
        return result;
    }

    private void sendReviewResultNotification(String comment_id, int status) {
        try {
            if (!siteConfigUtil.isNotificationEnabled()) return;

            Comment comment = backendCommentMapper.selectCommentByCommentId(comment_id);
            if (comment == null) return;

            UserInformation author = userInformationMapper.selectUserByUUID(comment.getUser_id());
            if (author == null || author.getEmail() == null) return;

            String siteName = siteConfigUtil.getSiteName();
            String resultText = status == 1 ? "通过审核" : "被标记为违规";
            String subject = siteName + " 评论审核结果";
            String content = "您的评论 \"" + comment.getContent() + "\" " + resultText + "。";

            notificationService.sendSystemNotification(author.getUsername(), "系统通知", content);
            mailService.sendSimpleMail(author.getEmail(), subject, content);

            // 审核通过时，同时通知文章作者有新评论
            if (status == 1) {
                Article article = articleMapper.selectArticleByArticleId(comment.getArticle_id());
                if (article != null && !comment.getUser_id().equals(article.getUuid())) {
                    UserInformation articleAuthor = userInformationMapper.selectUserByUUID(article.getUuid());
                    if (articleAuthor != null && articleAuthor.getEmail() != null) {
                        String commentSubject = siteName + " 评论通知";
                        String commentContent = "用户：" + author.getUsername() + " 评论了您的文章《" + article.getArticle_name() + "》：" + comment.getContent();
                        notificationService.sendSystemNotification(articleAuthor.getUsername(), "系统通知", commentContent);
                        mailService.sendSimpleMail(articleAuthor.getEmail(), commentSubject, commentContent);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("发送评论审核结果通知失败", e);
        }
    }
}