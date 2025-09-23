package xyz.lingview.dimstack.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.domain.Comment;
import xyz.lingview.dimstack.dto.request.CommentDTO;
import xyz.lingview.dimstack.mapper.ArticleMapper;
import xyz.lingview.dimstack.mapper.BackendCommentMapper;

import java.util.*;

@Slf4j
@Service
public class BackendCommentService {

    @Autowired
    private BackendCommentMapper backendCommentMapper;

    @Autowired
    private ArticleMapper articleMapper;

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

    public List<CommentDTO> getAllCommentsWithPagination(int page, int size) {
        int offset = (page - 1) * size;
        return backendCommentMapper.selectAllCommentsWithPagination(offset, size);
    }

    public String getArticleTitle(String article_id) {
        Article article = articleMapper.selectArticleByArticleId(article_id);
        return article != null ? article.getArticle_name() : "未知文章";
    }


    public Comment getCommentDetail(String comment_id) {
        return backendCommentMapper.selectCommentByCommentId(comment_id);
    }


    public boolean updateCommentContent(String comment_id, String content) {
        return backendCommentMapper.updateCommentContent(comment_id, content) > 0;
    }


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


    public int getTotalCommentsCount() {
        return backendCommentMapper.countTotalComments();
    }
}
