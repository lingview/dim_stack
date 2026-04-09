package xyz.lingview.dimstack.controller;

import org.mindrot.jbcrypt.BCrypt;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RateLimit;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.dto.request.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.request.UpdateArticleDTO;
import xyz.lingview.dimstack.enums.AiReviewResult;
import xyz.lingview.dimstack.mapper.*;
import xyz.lingview.dimstack.service.*;
import xyz.lingview.dimstack.util.SiteConfigUtil;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api")
public class EditArticleController {

    @Autowired
    private EditArticleService editArticleService;

    @Autowired
    private SiteConfigMapper SiteConfigMapper;

    @Autowired
    EditArticleMapper editArticleMapper;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Autowired
    UserInformationMapper userInformationMapper;

    @Autowired
    NotificationService notificationService;

    @Autowired
    MailService mailService;
    @Autowired
    private ArticleMapper articleMapper;
    @Autowired
    private UserPermissionMapper userPermissionMapper;
    @Autowired
    private ArticleReviewMapper articleReviewMapper;
    @Autowired
    private SiteConfigService siteConfigService;

    @Autowired
    LLMService llmService;

    @GetMapping("/getarticlelist")
    @RequiresPermission({"post:view", "post:edit"})
    public ResponseEntity<Map<String, Object>> getArticleList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            Map<String, Object> result = editArticleService.getArticleListByUsername(username, page, size);

            response.put("success", true);
            response.put("message", "获取文章列表成功");
            response.put("data", result);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取文章列表失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    // 文章更新
    @PostMapping("/updatearticle")
    @RequiresPermission({"post:update", "post:edit"})
    public ResponseEntity<Map<String, Object>> updateArticle(
            @RequestBody UpdateArticleDTO updateArticleDTO,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            ArticleDetailDTO originalArticle = editArticleService.getArticleDetailById(
                    updateArticleDTO.getArticle_id(), username);

            if (originalArticle == null) {
                response.put("success", false);
                response.put("message", "文章不存在或无权限访问");
                log.warn("检测越权攻击用户{} 尝试取消发布文章{}", username, updateArticleDTO.getArticle_id());
                return ResponseEntity.ok(response);
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

            boolean result = editArticleService.updateArticle(updateArticleDTO, username);

            if (result) {
                log.info("文章更新成功，article_id: {}", updateArticleDTO.getArticle_id());
// 修改通知逻辑，更新文章不再发送审核通知，改为只提示文章所属用户
//                if (siteConfigUtil.isNotificationEnabled()) {
//                    Date date = new Date();
//                    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//                    String formattedDate = formatter.format(date);
//
//                    String siteName = siteConfigUtil.getSiteName();
//
//                    List<String> emails = userInformationMapper.getEmailsByPermissionCode("post:review");
//
//                    if (emails == null || emails.isEmpty()) {
//                        log.warn("未找到拥有 'post:review' 权限的用户，跳过发送审核通知邮件");
//                    } else {
//                        for (String email : emails) {
//                            try {
//                                String articleId = updateArticleDTO.getArticle_id();
//                                String article_name = articleReviewMapper.getArticleNameByArticleId(articleId);
//                                mailService.sendSimpleMail(
//                                        email,
//                                        siteName + " 文章审核",
//                                        "用户：" + username + " 于 " + formattedDate + " 更新了文章：" + "《" + article_name + "》" + "可能需要您审核"
//                                );
//                                notificationService.sendSystemNotification(userInformationMapper.getUsernameByEmail(email), "系统通知", "用户：" + username + " 于 " + formattedDate + " 创建了文章：" + "《" + article_name + "》" + "可能需要您审核");
//                                log.info("已发送审核通知邮件至: {}", email);
//                            } catch (Exception e) {
//                                log.error("发送审核通知邮件失败，目标邮箱: {}", email, e);
//                            }
//                        }
//                    }
//                }
                if (siteConfigUtil.isNotificationEnabled()) {
                    log.info("发送系统通知");
                    Date date = new Date();
                    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String formattedDate = formatter.format(date);
                    String articleId = updateArticleDTO.getArticle_id();
                    String article_name = articleReviewMapper.getArticleNameByArticleId(articleId);
                    String email = userInformationMapper.getEmailByUsername(username);
                    String siteName = siteConfigUtil.getSiteName();
                    notificationService.sendSystemNotification(username, "系统通知", "您的文章" + "《" + article_name + "》" + " 于 " + formattedDate + " 进行了更新");
                    mailService.sendSimpleMail(
                            email,
                            siteName + " 文章更新",
                            "您的文章" + "《" + article_name + "》" + " 于 " + formattedDate + " 进行了更新"
                    );
//                    notificationService.sendSystemNotification(userInformationMapper.getUsernameByEmail(email), "系统通知", "您的文章" + "《" + article_name + "》" + " 于 " + formattedDate + " 进行了更新");
                    log.info("已发送更新通知至用户邮箱: {}", email);
                }
                response.put("success", true);
                response.put("message", "文章更新成功");
            } else {
                response.put("success", false);
                response.put("message", "文章更新失败：权限不足或文章不存在");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("文章更新失败", e);
            response.put("success", false);
            response.put("message", "文章更新失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/getarticle/{articleId}")
    @RequiresPermission({"post:details", "post:edit"})
    public ResponseEntity<Map<String, Object>> getArticleDetail(
            @PathVariable String articleId,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            ArticleDetailDTO article = editArticleService.getArticleDetailById(articleId, username);

//            System.out.println("article: " + article);
            if (article != null) {
                response.put("success", true);
                response.put("message", "获取文章详情成功");
                response.put("data", article);
            } else {
                response.put("success", false);
                response.put("message", "获取文章详情失败：权限不足或文章不存在");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取文章详情失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @Autowired
    ArticleCategoryMapper articleCategoryMapper;

    @PostMapping("/deletearticle")
    @RequiresPermission({"post:delete", "post:edit"})
    public ResponseEntity<Map<String, Object>> deleteArticle(
            @RequestBody Map<String, String> payload,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            String articleId = payload.get("article_id");
            if (articleId == null || articleId.isEmpty()) {
                response.put("success", false);
                response.put("message", "文章ID不能为空");
                return ResponseEntity.ok(response);
            }

            boolean result = editArticleService.deleteArticle(articleId, username);

            if (result) {
                response.put("success", true);
                response.put("message", "文章删除成功");
                String articleCategory = articleCategoryMapper.getCategoryByArticleId(articleId);
                articleCategoryMapper.decrementCount(articleCategory);
                if (siteConfigUtil.isNotificationEnabled()) {
                    Date date = new Date();
                    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String formattedDate = formatter.format(date);
                    String email = userInformationMapper.getEmailByUsername(username);
                    String siteName = siteConfigUtil.getSiteName();
                    String article_name = articleReviewMapper.getArticleNameByArticleId(articleId);
                    notificationService.sendSystemNotification(username, "系统通知", "用户：" + username + " 于 " + formattedDate + " 删除了文章：" + "《" + article_name + "》");
                    mailService.sendSimpleMail(email, siteName + " 文章删除成功", "用户：" + username + " 于 " + formattedDate + " 成功删除文章：" + "《" + article_name + "》");
                }
            } else {
                response.put("success", false);
                response.put("message", "文章删除失败：权限不足或文章不存在");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "文章删除失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/unpublisharticle")
    @RequiresPermission({"post:unpublish", "post:edit"})
    public ResponseEntity<Map<String, Object>> unpublishArticle(
            @RequestBody Map<String, String> payload,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            String articleId = payload.get("article_id");

            if (articleId == null || articleId.isEmpty()) {
                response.put("success", false);
                response.put("message", "文章ID不能为空");
                return ResponseEntity.ok(response);
            }

            String articleFromUserUuid = articleMapper.selectUserUuidByArticleId(articleId);
            String userUuid = userInformationMapper.selectUserUUID(username);
            if (!articleFromUserUuid.equals(userUuid)) {
                response.put("success", false);
                response.put("message", "这不是您的文章");
                log.warn("检测越权攻击用户{} 尝试取消发布文章{}", username, articleId);
                return ResponseEntity.ok(response);
            }

            boolean result = editArticleService.unpublishArticle(articleId, username);

            if (result) {
                response.put("success", true);
                response.put("message", "文章已取消发布");
            } else {
                response.put("success", false);
                response.put("message", "取消发布失败：权限不足或文章不存在");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "取消发布失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }


    @PostMapping("/publisharticle")
    @RateLimit(window = 60, maxRequests = 2)
    @RequiresPermission({"post:publish", "post:edit"})
    public ResponseEntity<Map<String, Object>> publishArticle(
            @RequestBody Map<String, String> payload,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            String articleId = payload.get("article_id");

            if (articleId == null || articleId.isEmpty()) {
                response.put("success", false);
                response.put("message", "文章ID不能为空");
                return ResponseEntity.ok(response);
            }

            String articleFromUserUuid = articleMapper.selectUserUuidByArticleId(articleId);
            String userUuid = userInformationMapper.selectUserUUID(username);
            if (!articleFromUserUuid.equals(userUuid)) {
                response.put("success", false);
                response.put("message", "这不是您的文章");
                log.warn("检测越权攻击用户{} 尝试取消发布文章{}", username, articleId);
                return ResponseEntity.ok(response);
            }

            boolean adminPostNoReview = siteConfigUtil.adminPostNoReview();
            boolean noReviewNotice = false;
            int articleDefault;
            List<String> userPermission = userPermissionMapper.findPermissionCodesByUserName(username);
            if (userPermission.contains("system:post:review")){
                if (adminPostNoReview) {
                    noReviewNotice = true;
                    articleDefault = 1;
                }else{
                    articleDefault = SiteConfigMapper.getArticleStatus();
                }
            }else {
                articleDefault = SiteConfigMapper.getArticleStatus();
            }

            Integer enableLlm = siteConfigService.getEnableLlm();
            Integer enableLlmArticleReview = siteConfigService.getEnableLlmArticleReview();
            boolean aiReviewEnabled = (enableLlm != null && enableLlm == 1 && enableLlmArticleReview != null && enableLlmArticleReview == 1);
            
            if (!noReviewNotice && aiReviewEnabled) {
                log.info("文章 {} 使用大模型审核，设为待审核状态", articleId);
                articleDefault = 3;

                String articleContent = editArticleService.getArticleContent(articleId);
                if (articleContent != null && !articleContent.trim().isEmpty()) {
                    List<String> reviewerUsernames = userInformationMapper.getUsernamesByPermissionCode("system:post:review");
                    List<String> reviewerEmails = userInformationMapper.getEmailsByPermissionCode("system:post:review");
                    String articleName = articleReviewMapper.getArticleNameByArticleId(articleId);
                    String authorEmail = userInformationMapper.getEmailByUsername(username);
                    String siteName = siteConfigUtil.getSiteName();
                    boolean notificationEnabled = siteConfigUtil.isNotificationEnabled();

                    ReviewContext context = new ReviewContext();
                    context.articleId = articleId;
                    context.articleName = articleName;
                    context.authorUsername = username;
                    context.authorEmail = authorEmail;
                    context.reviewerUsernames = reviewerUsernames;
                    context.reviewerEmails = reviewerEmails;
                    context.siteName = siteName;
                    context.notificationEnabled = notificationEnabled;
                    context.articleContent = articleContent;

                    asyncAiReview(context);
                } else {
                    log.warn("文章 {} 内容为空，跳过大模型审核，保持待审核状态", articleId);
                }
            }

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("uuid", editArticleService.getArticleUuid(articleId));
            params.put("status", articleDefault);

            int result = editArticleMapper.publishArticle(params);

            if (!aiReviewEnabled || noReviewNotice) {
                if (noReviewNotice) {
                    sendAutoApprovalNotification(username, articleId);
                } else if (articleDefault == 4) {
                    sendViolationNotification(username, articleId);
                } else {
                    sendReviewNotification(username, articleId);
                }
            }

            if (result > 0) {
                response.put("success", true);
                response.put("message", "文章已发布");
            } else {
                response.put("success", false);
                response.put("message", "发布失败：权限不足或文章不存在");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "发布失败: " + e.getMessage());
            return ResponseEntity.ok(response);
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

    @PostMapping("/removearticlepassword")
    @RequiresPermission({"post:removepassword", "post:edit"})
    public ResponseEntity<Map<String, Object>> removeArticlePassword(
            @RequestBody Map<String, String> payload,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            String articleId = payload.get("article_id");
            if (articleId == null || articleId.isEmpty()) {
                response.put("success", false);
                response.put("message", "文章ID不能为空");
                return ResponseEntity.ok(response);
            }

            String articleUuid = editArticleService.getArticleUuid(articleId);
            if (articleUuid == null) {
                response.put("success", false);
                response.put("message", "文章不存在");
                return ResponseEntity.ok(response);
            }

            String articleOwner = editArticleMapper.getUsernameByUuid(articleUuid);
            if (articleOwner == null || !articleOwner.equals(username)) {
                response.put("success", false);
                response.put("message", "权限不足，无法操作该文章");
                return ResponseEntity.ok(response);
            }

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("password", null);

            int result = editArticleMapper.removeArticlePassword(params);

            if (result > 0) {
                response.put("success", true);
                response.put("message", "文章密码已移除");
            } else {
                response.put("success", false);
                response.put("message", "移除文章密码失败");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "移除文章密码失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
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
                    sendAutoApprovalNotificationWithInfo(context);
                } else if (reviewResult == AiReviewResult.REJECT) {
                    log.warn("文章 {} 大模型审核不通过，标记为违规", context.articleId);
                    editArticleMapper.updateArticleStatus(context.articleId, 4);
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

}
