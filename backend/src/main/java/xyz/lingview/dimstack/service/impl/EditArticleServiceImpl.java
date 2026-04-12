package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.dto.request.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.request.UpdateArticleDTO;
import xyz.lingview.dimstack.dto.request.EditArticleDTO;
import xyz.lingview.dimstack.dto.response.ArticleOperationResult;
import xyz.lingview.dimstack.enums.AiReviewResult;
import xyz.lingview.dimstack.mapper.*;
import xyz.lingview.dimstack.service.*;
import xyz.lingview.dimstack.util.CategoryPathUtil;
import xyz.lingview.dimstack.util.SiteConfigUtil;

import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
public class EditArticleServiceImpl implements EditArticleService {

    @Autowired
    private EditArticleMapper editArticleMapper;

    @Autowired
    private ArticleCategoryMapper articleCategoryMapper;

    @Autowired
    private CategoryPathUtil categoryPathUtil;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MailService mailService;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Autowired
    private SiteConfigService siteConfigService;

    @Autowired
    private ArticleReviewMapper articleReviewMapper;

    @Autowired
    private LLMService llmService;

    @Autowired
    private SiteConfigMapper siteConfigMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private UserPermissionMapper userPermissionMapper;

    @Autowired
    private ReadArticleMapper readArticleMapper;

    @Autowired
    private CacheService cacheService;

    @Autowired
    private PageViewCounterService pageViewCounterService;

    @Override
    public Map<String, Object> getArticleListByUsername(String username, Integer page, Integer size) {
        Map<String, Object> result = new HashMap<>();

        try {
            String uuid = editArticleMapper.getUuidByUsername(username);
            if (uuid == null) {
                result.put("articles", List.of());
                result.put("total", 0);
                result.put("page", page);
                result.put("size", size);
                return result;
            }

            int offset = (page - 1) * size;
            List<EditArticleDTO> articles = editArticleMapper.getArticleListByUuid(uuid, offset, size);
            int total = editArticleMapper.countArticlesByUuid(uuid);

            result.put("articles", articles);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", (int) Math.ceil((double) total / size));

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            result.put("articles", List.of());
            result.put("total", 0);
            result.put("page", page);
            result.put("size", size);
            return result;
        }
    }

    @Override
    public ArticleDetailDTO getArticleDetailById(String articleId, String username) {
        try {
            String articleUuid = editArticleMapper.getUuidByArticleId(articleId);
            if (articleUuid == null) {
                return null;
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null) {
                return null;
            }

            if (!articleOwner.equals(username)) {
                return null;
            }

            return editArticleMapper.getArticleDetailById(articleId);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public boolean updateArticle(UpdateArticleDTO updateArticleDTO, String sessionUsername) {
        try {
            String articleUuid = editArticleMapper.getUuidByArticleId(updateArticleDTO.getArticle_id());
            if (articleUuid == null) {
                return false;
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null) {
                return false;
            }

            if (!articleOwner.equals(sessionUsername)) {
                return false;
            }

            // 获取更新前的文章分类
            String oldCategory = editArticleMapper.getCategoryByArticleId(updateArticleDTO.getArticle_id());

            editArticleMapper.deleteArticleTagRelations(updateArticleDTO.getArticle_id());

            String tagsString = updateArticleDTO.getTag();
            if (tagsString != null && !tagsString.isEmpty()) {
                String[] tags = tagsString.split(",");
                for (String tag : tags) {
                    if (!tag.trim().isEmpty()) {
                        editArticleMapper.insertArticleTagRelation(updateArticleDTO.getArticle_id(), tag.trim());
                    }
                }
            }

            CategoryPathUtil.CategoryPath categoryPath = categoryPathUtil.parsePath(updateArticleDTO.getCategory());
            
            Map<String, Object> paramMap = new HashMap<>();
            paramMap.put("article_id", updateArticleDTO.getArticle_id());
            paramMap.put("article_name", updateArticleDTO.getArticle_name());
            paramMap.put("article_cover", updateArticleDTO.getArticle_cover());
            paramMap.put("excerpt", updateArticleDTO.getExcerpt());
            paramMap.put("article_content", updateArticleDTO.getArticle_content());
            paramMap.put("password", updateArticleDTO.getPassword());
            paramMap.put("parentCategory", categoryPath.getParentCategory());
            paramMap.put("childCategory", categoryPath.getChildCategory());
            paramMap.put("alias", updateArticleDTO.getAlias());
            paramMap.put("status", updateArticleDTO.getStatus());
            
            int result = editArticleMapper.updateArticleWithCategory(paramMap);

            // 更新分类计数
            if (result > 0) {
                String newCategory = updateArticleDTO.getCategory();
                if (oldCategory != null && !oldCategory.equals(newCategory)) {
                    CategoryPathUtil.CategoryPath oldPath = categoryPathUtil.parsePath(oldCategory);
                    String oldFullPath = oldPath.getParentCategory() != null 
                        ? oldPath.getParentCategory() + "/" + oldPath.getChildCategory()
                        : oldPath.getChildCategory();
                    articleCategoryMapper.decrementCount(oldFullPath);
                    
                    if (newCategory != null) {
                        CategoryPathUtil.CategoryPath newPath = categoryPathUtil.parsePath(newCategory);
                        String newFullPath = newPath.getParentCategory() != null 
                            ? newPath.getParentCategory() + "/" + newPath.getChildCategory()
                            : newPath.getChildCategory();
                        articleCategoryMapper.incrementCount(newFullPath);
                    }
                }
            }

            return result > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }



    @Override
    public boolean deleteArticle(String articleId, String sessionUsername) {
        try {
            String articleUuid = editArticleMapper.getUuidByArticleId(articleId);
            if (articleUuid == null) {
                return false;
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null || !articleOwner.equals(sessionUsername)) {
                return false;
            }

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("uuid", articleUuid);

            int result = editArticleMapper.deleteArticle(params);
            return result > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean unpublishArticle(String articleId, String sessionUsername) {
        try {
            String articleUuid = editArticleMapper.getUuidByArticleId(articleId);
            if (articleUuid == null) {
                return false;
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null || !articleOwner.equals(sessionUsername)) {
                return false;
            }

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("uuid", articleUuid);

            int result = editArticleMapper.unpublishArticle(params);
            return result > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean publishArticle(String articleId, String sessionUsername) {
        try {
            String articleUuid = editArticleMapper.getUuidByArticleId(articleId);
            if (articleUuid == null) {
                return false;
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null || !articleOwner.equals(sessionUsername)) {
                return false;
            }

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("uuid", articleUuid);

            int result = editArticleMapper.publishArticle(params);
            return result > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public String getArticleUuid(String articleId) {
        return editArticleMapper.getUuidByArticleId(articleId);
    }

    @Override
    public String getArticleContent(String articleId) {
        try {
            return editArticleMapper.getArticleContentById(articleId);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public ArticleOperationResult updateArticleWithNotification(UpdateArticleDTO updateArticleDTO, String sessionUsername) {
        try {
            ArticleDetailDTO originalArticle = getArticleDetailById(updateArticleDTO.getArticle_id(), sessionUsername);
            if (originalArticle == null) {
                return ArticleOperationResult.builder()
                    .success(false)
                    .message("文章不存在或无权限访问")
                    .build();
            }

            log.info("原文章密码: {}", originalArticle.getPassword() != null ? "存在(长度:" + originalArticle.getPassword().length() + ")" : "null");
            log.info("前端传入密码: '{}'", updateArticleDTO.getPassword());

            String incomingPassword = updateArticleDTO.getPassword();
            if (incomingPassword != null && !incomingPassword.trim().isEmpty()) {
                log.info("用户设置新密码，进行加密");
                String hashedPassword = BCrypt.hashpw(incomingPassword.trim(), BCrypt.gensalt());
                updateArticleDTO.setPassword(hashedPassword);
            } else {
                log.info("保持原密码不变");
                updateArticleDTO.setPassword(originalArticle.getPassword());
            }

            updateArticleDTO.setStatus(2);

            boolean result = updateArticle(updateArticleDTO, sessionUsername);

            if (result) {
                log.info("文章更新成功，article_id: {}", updateArticleDTO.getArticle_id());
                invalidateArticleCache(updateArticleDTO.getArticle_id());
                sendUpdateNotification(sessionUsername, updateArticleDTO.getArticle_id());
                
                return ArticleOperationResult.builder()
                    .success(true)
                    .message("文章更新成功")
                    .build();
            } else {
                return ArticleOperationResult.builder()
                    .success(false)
                    .message("文章更新失败：权限不足或文章不存在")
                    .build();
            }
        } catch (Exception e) {
            log.error("文章更新失败", e);
            return ArticleOperationResult.builder()
                .success(false)
                .message("文章更新失败: " + e.getMessage())
                .build();
        }
    }

    @Override
    public ArticleOperationResult deleteArticleWithNotification(String articleId, String sessionUsername) {
        try {
            boolean result = deleteArticle(articleId, sessionUsername);

            if (result) {
                String articleCategory = articleCategoryMapper.getCategoryByArticleId(articleId);
                articleCategoryMapper.decrementCount(articleCategory);
                invalidateArticleCache(articleId);
                sendDeleteNotification(sessionUsername, articleId);
                
                return ArticleOperationResult.builder()
                    .success(true)
                    .message("文章删除成功")
                    .build();
            } else {
                return ArticleOperationResult.builder()
                    .success(false)
                    .message("文章删除失败：权限不足或文章不存在")
                    .build();
            }
        } catch (Exception e) {
            log.error("文章删除失败", e);
            return ArticleOperationResult.builder()
                .success(false)
                .message("文章删除失败: " + e.getMessage())
                .build();
        }
    }

    @Override
    public ArticleOperationResult unpublishArticleWithValidation(String articleId, String sessionUsername) {
        try {
            String articleFromUserUuid = articleMapper.selectUserUuidByArticleId(articleId);
            String userUuid = userInformationMapper.selectUserUUID(sessionUsername);
            if (!articleFromUserUuid.equals(userUuid)) {
                log.warn("检测越权攻击用户{} 尝试取消发布文章{}", sessionUsername, articleId);
                return ArticleOperationResult.builder()
                    .success(false)
                    .message("这不是您的文章")
                    .build();
            }

            boolean result = unpublishArticle(articleId, sessionUsername);

            if (result) {
                invalidateArticleCache(articleId);
                return ArticleOperationResult.builder()
                    .success(true)
                    .message("文章已取消发布")
                    .build();
            } else {
                return ArticleOperationResult.builder()
                    .success(false)
                    .message("取消发布失败：权限不足或文章不存在")
                    .build();
            }
        } catch (Exception e) {
            log.error("取消发布失败", e);
            return ArticleOperationResult.builder()
                .success(false)
                .message("取消发布失败: " + e.getMessage())
                .build();
        }
    }

    @Override
    public ArticleOperationResult publishArticleWithReview(String articleId, String sessionUsername) {
        try {
            String articleFromUserUuid = articleMapper.selectUserUuidByArticleId(articleId);
            String userUuid = userInformationMapper.selectUserUUID(sessionUsername);
            if (!articleFromUserUuid.equals(userUuid)) {
                log.warn("检测越权攻击用户{} 尝试发布文章{}", sessionUsername, articleId);
                return ArticleOperationResult.builder()
                    .success(false)
                    .message("这不是您的文章")
                    .build();
            }

            boolean adminPostNoReview = siteConfigUtil.adminPostNoReview();
            boolean noReviewNotice = false;
            int articleDefault;
            List<String> userPermission = userPermissionMapper.findPermissionCodesByUserName(sessionUsername);
            if (userPermission.contains("system:post:review")){
                if (adminPostNoReview) {
                    noReviewNotice = true;
                    articleDefault = 1;
                }else{
                    articleDefault = siteConfigMapper.getArticleStatus();
                }
            }else {
                articleDefault = siteConfigMapper.getArticleStatus();
            }

            Integer enableLlm = siteConfigService.getEnableLlm();
            Integer enableLlmArticleReview = siteConfigService.getEnableLlmArticleReview();
            boolean aiReviewEnabled = (enableLlm != null && enableLlm == 1 && enableLlmArticleReview != null && enableLlmArticleReview == 1);
            
            if (!noReviewNotice && aiReviewEnabled) {
                log.info("文章 {} 使用大模型审核，设为待审核状态", articleId);
                articleDefault = 3;

                String articleContent = getArticleContent(articleId);
                if (articleContent != null && !articleContent.trim().isEmpty()) {
                    ReviewContext context = buildReviewContext(articleId, sessionUsername);
                    asyncAiReview(context);
                } else {
                    log.warn("文章 {} 内容为空，跳过大模型审核，保持待审核状态", articleId);
                }
            }

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("uuid", getArticleUuid(articleId));
            params.put("status", articleDefault);

            int result = editArticleMapper.publishArticle(params);

            if (!aiReviewEnabled || noReviewNotice) {
                if (noReviewNotice) {
                    sendAutoApprovalNotification(sessionUsername, articleId);
                } else if (articleDefault == 4) {
                    sendViolationNotification(sessionUsername, articleId);
                } else {
                    sendReviewNotification(sessionUsername, articleId);
                }
            }

            if (result > 0) {
                invalidateArticleCache(articleId);
                return ArticleOperationResult.builder()
                    .success(true)
                    .message("文章已发布")
                    .build();
            } else {
                return ArticleOperationResult.builder()
                    .success(false)
                    .message("发布失败：权限不足或文章不存在")
                    .build();
            }
        } catch (Exception e) {
            log.error("发布失败", e);
            return ArticleOperationResult.builder()
                .success(false)
                .message("发布失败: " + e.getMessage())
                .build();
        }
    }

    @Override
    public ArticleOperationResult removeArticlePasswordWithValidation(String articleId, String sessionUsername) {
        try {
            String articleUuid = getArticleUuid(articleId);
            if (articleUuid == null) {
                return ArticleOperationResult.builder()
                    .success(false)
                    .message("文章不存在")
                    .build();
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null || !articleOwner.equals(sessionUsername)) {
                return ArticleOperationResult.builder()
                    .success(false)
                    .message("权限不足，无法操作该文章")
                    .build();
            }

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("password", null);

            int result = editArticleMapper.removeArticlePassword(params);

            if (result > 0) {
                invalidateArticleCache(articleId);
                return ArticleOperationResult.builder()
                    .success(true)
                    .message("文章密码已移除")
                    .build();
            } else {
                return ArticleOperationResult.builder()
                    .success(false)
                    .message("移除文章密码失败")
                    .build();
            }
        } catch (Exception e) {
            log.error("移除文章密码失败", e);
            return ArticleOperationResult.builder()
                .success(false)
                .message("移除文章密码失败: " + e.getMessage())
                .build();
        }
    }

    private void sendUpdateNotification(String username, String articleId) {
        if (!siteConfigUtil.isNotificationEnabled()) {
            return;
        }
        
        try {
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String formattedDate = formatter.format(date);
            String articleName = articleReviewMapper.getArticleNameByArticleId(articleId);
            String email = userInformationMapper.getEmailByUsername(username);
            String siteName = siteConfigUtil.getSiteName();
            
            notificationService.sendSystemNotification(username, "系统通知", 
                "您的文章" + "《" + articleName + "》" + " 于 " + formattedDate + " 进行了更新");
            mailService.sendSimpleMail(email, siteName + " 文章更新",
                "您的文章" + "《" + articleName + "》" + " 于 " + formattedDate + " 进行了更新");
            log.info("已发送更新通知至用户邮箱: {}", email);
        } catch (Exception e) {
            log.error("发送更新通知失败", e);
        }
    }

    private void sendDeleteNotification(String username, String articleId) {
        if (!siteConfigUtil.isNotificationEnabled()) {
            return;
        }
        
        try {
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String formattedDate = formatter.format(date);
            String email = userInformationMapper.getEmailByUsername(username);
            String siteName = siteConfigUtil.getSiteName();
            String articleName = articleReviewMapper.getArticleNameByArticleId(articleId);
            
            notificationService.sendSystemNotification(username, "系统通知", 
                "用户：" + username + " 于 " + formattedDate + " 删除了文章：" + "《" + articleName + "》");
            mailService.sendSimpleMail(email, siteName + " 文章删除成功", 
                "用户：" + username + " 于 " + formattedDate + " 成功删除文章：" + "《" + articleName + "》");
        } catch (Exception e) {
            log.error("发送删除通知失败", e);
        }
    }

    private void sendAutoApprovalNotification(String authorUsername, String articleId) {
        if (!siteConfigUtil.isNotificationEnabled()) {
            return;
        }

        try {
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String formattedDate = formatter.format(date);

            String siteName = siteConfigUtil.getSiteName();
            String articleName = articleReviewMapper.getArticleNameByArticleId(articleId);
            String email = userInformationMapper.getEmailByUsername(authorUsername);

            notificationService.sendSystemNotification(
                authorUsername, 
                "系统通知", 
                "您的文章：《" + articleName + "》已自动审核通过"
            );
            
            mailService.sendSimpleMail(
                email,
                siteName + " 文章审核",
                "您的文章：《" + articleName + "》已自动审核通过"
            );
            
            log.info("用户 {} 的文章《{}》已自动审核通过，审核时间：{}", authorUsername, articleName, formattedDate);
        } catch (Exception e) {
            log.error("发送自动审核通知失败，文章ID: {}, 作者: {}", articleId, authorUsername, e);
        }
    }

    private void sendViolationNotification(String authorUsername, String articleId) {
        if (!siteConfigUtil.isNotificationEnabled()) {
            return;
        }

        try {
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String formattedDate = formatter.format(date);

            String siteName = siteConfigUtil.getSiteName();
            String articleName = articleReviewMapper.getArticleNameByArticleId(articleId);
            String email = userInformationMapper.getEmailByUsername(authorUsername);

            notificationService.sendSystemNotification(
                authorUsername, 
                "系统通知", 
                "您的文章：《" + articleName + "》经大模型审核发现违规内容，已被标记为违规"
            );
            
            mailService.sendSimpleMail(
                email,
                siteName + " 文章审核",
                "您的文章：《" + articleName + "》经大模型审核发现违规内容，已被标记为违规，请联系管理员处理"
            );
            
            log.warn("用户 {} 的文章《{}》大模型审核不通过，标记为违规，时间：{}", authorUsername, articleName, formattedDate);
        } catch (Exception e) {
            log.error("发送违规通知失败，文章ID: {}, 作者: {}", articleId, authorUsername, e);
        }
    }

    private void sendReviewNotification(String authorUsername, String articleId) {
        if (!siteConfigUtil.isNotificationEnabled()) {
            return;
        }

        try {
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String formattedDate = formatter.format(date);

            String siteName = siteConfigUtil.getSiteName();
            String articleName = articleReviewMapper.getArticleNameByArticleId(articleId);

            List<String> reviewerUsernames = userInformationMapper.getUsernamesByPermissionCode("system:post:review");
            List<String> reviewerEmails = userInformationMapper.getEmailsByPermissionCode("system:post:review");

            if (reviewerUsernames == null || reviewerUsernames.isEmpty()) {
                log.warn("未找到拥有 'system:post:review' 权限的用户，跳过发送审核通知");
            } else {
                for (String reviewerUsername : reviewerUsernames) {
                    try {
                        notificationService.sendSystemNotification(
                            reviewerUsername, 
                            "系统通知", 
                            "用户：" + authorUsername + " 于 " + formattedDate + " 发布了新文章：《" + articleName + "》可能需要您审核"
                        );
                        log.info("已发送审核通知至: {}", reviewerUsername);
                    } catch (Exception e) {
                        log.error("发送审核通知失败，目标用户: {}", reviewerUsername, e);
                    }
                }
            }

            if (reviewerEmails == null || reviewerEmails.isEmpty()) {
                log.warn("未找到拥有 'system:post:review' 权限的用户，跳过发送审核通知邮件");
            } else {
                for (String email : reviewerEmails) {
                    try {
                        mailService.sendSimpleMail(
                            email,
                            siteName + " 文章审核",
                            "用户：" + authorUsername + " 于 " + formattedDate + " 发布了新文章：《" + articleName + "》可能需要您审核"
                        );
                        log.info("已发送审核通知邮件至: {}", email);
                    } catch (Exception e) {
                        log.error("发送审核通知邮件失败，目标邮箱: {}", email, e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("发送审核通知失败，文章ID: {}, 作者: {}", articleId, authorUsername, e);
        }
    }

    private ReviewContext buildReviewContext(String articleId, String username) {
        ReviewContext context = new ReviewContext();
        context.articleId = articleId;
        context.articleName = articleReviewMapper.getArticleNameByArticleId(articleId);
        context.authorUsername = username;
        context.authorEmail = userInformationMapper.getEmailByUsername(username);
        context.reviewerUsernames = userInformationMapper.getUsernamesByPermissionCode("system:post:review");
        context.reviewerEmails = userInformationMapper.getEmailsByPermissionCode("system:post:review");
        context.siteName = siteConfigUtil.getSiteName();
        context.notificationEnabled = siteConfigUtil.isNotificationEnabled();
        context.articleContent = getArticleContent(articleId);
        return context;
    }

    private static class ReviewContext {
        String articleId;
        String articleName;
        String authorUsername;
        String authorEmail;
        List<String> reviewerUsernames;
        List<String> reviewerEmails;
        String siteName;
        boolean notificationEnabled;
        String articleContent;
    }

    private void asyncAiReview(ReviewContext context) {
        new Thread(() -> {
            try {
                log.debug("开始对文章 {} 进行异步大模型审核", context.articleId);
                AiReviewResult reviewResult = llmService.reviewArticle(context.articleContent);
                
                if (reviewResult == AiReviewResult.PASS) {
                    log.info("文章 {} 大模型审核通过，自动发布", context.articleId);
                    editArticleMapper.updateArticleStatus(context.articleId, 1);
                    invalidateArticleCache(context.articleId);
                    sendAutoApprovalNotificationWithInfo(context);
                } else if (reviewResult == AiReviewResult.REJECT) {
                    log.warn("文章 {} 大模型审核不通过，标记为违规", context.articleId);
                    editArticleMapper.updateArticleStatus(context.articleId, 4);
                    invalidateArticleCache(context.articleId);
                    sendViolationNotificationWithInfo(context);
                } else {
                    log.warn("文章 {} 大模型审核异常，保持待审核状态，等待人工审核", context.articleId);
                    sendReviewNotificationWithInfo(context);
                }
            } catch (Exception e) {
                log.error("文章 {} 大模型审核发生未预期异常，保持待审核状态，等待人工审核", context.articleId, e);
                sendReviewNotificationWithInfo(context);
            }
        }).start();
    }

    private void sendAutoApprovalNotificationWithInfo(ReviewContext context) {
        if (!context.notificationEnabled) {
            return;
        }

        try {
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String formattedDate = formatter.format(date);

            notificationService.sendSystemNotification(
                context.authorUsername, 
                "系统通知", 
                "您的文章：《" + context.articleName + "》已自动审核通过"
            );
            
            mailService.sendSimpleMail(
                context.authorEmail,
                context.siteName + " 文章审核",
                "您的文章：《" + context.articleName + "》已自动审核通过"
            );
            
            log.info("用户 {} 的文章《{}》已自动审核通过，审核时间：{}", context.authorUsername, context.articleName, formattedDate);
        } catch (Exception e) {
            log.error("发送自动审核通知失败，文章ID: {}, 作者: {}", context.articleId, context.authorUsername, e);
        }
    }

    private void sendViolationNotificationWithInfo(ReviewContext context) {
        if (!context.notificationEnabled) {
            return;
        }

        try {
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String formattedDate = formatter.format(date);

            notificationService.sendSystemNotification(
                context.authorUsername, 
                "系统通知", 
                "您的文章：《" + context.articleName + "》经大模型审核发现违规内容，已被标记为违规"
            );
            
            mailService.sendSimpleMail(
                context.authorEmail,
                context.siteName + " 文章审核",
                "您的文章：《" + context.articleName + "》经大模型审核发现违规内容，已被标记为违规，请联系管理员处理"
            );
            
            log.warn("用户 {} 的文章《{}》大模型审核不通过，标记为违规，时间：{}", context.authorUsername, context.articleName, formattedDate);
        } catch (Exception e) {
            log.error("发送违规通知失败，文章ID: {}, 作者: {}", context.articleId, context.authorUsername, e);
        }
    }

    private void sendReviewNotificationWithInfo(ReviewContext context) {
        if (!context.notificationEnabled) {
            return;
        }

        try {
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String formattedDate = formatter.format(date);

            if (context.reviewerUsernames == null || context.reviewerUsernames.isEmpty()) {
                log.warn("未找到拥有 'system:post:review' 权限的用户，跳过发送审核通知");
            } else {
                for (String reviewerUsername : context.reviewerUsernames) {
                    try {
                        notificationService.sendSystemNotification(
                            reviewerUsername, 
                            "系统通知", 
                            "用户：" + context.authorUsername + " 于 " + formattedDate + " 发布了新文章：《" + context.articleName + "》可能需要您审核"
                        );
                        log.info("已发送审核通知至: {}", reviewerUsername);
                    } catch (Exception e) {
                        log.error("发送审核通知失败，目标用户: {}", reviewerUsername, e);
                    }
                }
            }

            if (context.reviewerEmails == null || context.reviewerEmails.isEmpty()) {
                log.warn("未找到拥有 'system:post:review' 权限的用户，跳过发送审核通知邮件");
            } else {
                for (String email : context.reviewerEmails) {
                    try {
                        mailService.sendSimpleMail(
                            email,
                            context.siteName + " 文章审核",
                            "用户：" + context.authorUsername + " 于 " + formattedDate + " 发布了新文章：《" + context.articleName + "》可能需要您审核"
                        );
                        log.info("已发送审核通知邮件至: {}", email);
                    } catch (Exception e) {
                        log.error("发送审核通知邮件失败，目标邮箱: {}", email, e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("发送审核通知失败，文章ID: {}, 作者: {}", context.articleId, context.authorUsername, e);
        }
    }

    private void invalidateArticleCache(String articleId) {
        try {
            xyz.lingview.dimstack.domain.ReadArticle article = readArticleMapper.selectByArticleId(articleId);
            if (article != null && article.getAlias() != null) {
                String cacheKey = "dimstack:article:" + article.getAlias();
                cacheService.delete(cacheKey);
                pageViewCounterService.removePageView(article.getAlias());
                log.info("已清除文章缓存和浏览量计数器: {}", cacheKey);
            }
        } catch (Exception e) {
            log.warn("清除文章缓存失败，articleId: {}", articleId, e);
        }
    }
}
