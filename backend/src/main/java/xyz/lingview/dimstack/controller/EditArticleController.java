package xyz.lingview.dimstack.controller;

import cn.hutool.crypto.digest.BCrypt;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.dto.request.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.request.UpdateArticleDTO;
import xyz.lingview.dimstack.mapper.*;
import xyz.lingview.dimstack.service.EditArticleService;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.service.NotificationService;
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

    @GetMapping("/getarticlelist")
    @RequiresPermission("post:create")
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
    @RequiresPermission("post:create")
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

                if (siteConfigUtil.isNotificationEnabled()) {
                    Date date = new Date();
                    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String formattedDate = formatter.format(date);

                    String siteName = siteConfigUtil.getSiteName();

                    List<String> emails = userInformationMapper.getEmailsByPermissionCode("post:review");

                    if (emails == null || emails.isEmpty()) {
                        log.warn("未找到拥有 'post:review' 权限的用户，跳过发送审核通知邮件");
                    } else {
                        for (String email : emails) {
                            try {
                                String articleId = updateArticleDTO.getArticle_id();
                                String article_name = articleReviewMapper.getArticleNameByArticleId(articleId);
                                mailService.sendSimpleMail(
                                        email,
                                        siteName + " 文章审核",
                                        "用户：" + username + " 于 " + formattedDate + " 更新了文章：" + "《" + article_name + "》" + "可能需要您审核"
                                );
                                notificationService.sendSystemNotification(userInformationMapper.getUsernameByEmail(email), "系统通知", "用户：" + username + " 于 " + formattedDate + " 创建了文章：" + "《" + article_name + "》" + "可能需要您审核");
                                log.info("已发送审核通知邮件至: {}", email);
                            } catch (Exception e) {
                                log.error("发送审核通知邮件失败，目标邮箱: {}", email, e);
                            }
                        }
                    }
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
    @RequiresPermission("post:create")
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
    @RequiresPermission("post:create")
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
                    mailService.sendSimpleMail(email, siteName + " 文章删除成功", "用户：" + username + " 于 " + formattedDate + " 成功删除文章：" + "《" + article_name + "》");
                    notificationService.sendSystemNotification(userInformationMapper.getUsernameByEmail(email), "系统通知", "用户：" + username + " 于 " + formattedDate + " 删除了文章：" + "《" + article_name + "》");
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
    @RequiresPermission("post:create")
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

    @Autowired
    ArticleReviewMapper articleReviewMapper;

    @PostMapping("/publisharticle")
    @RequiresPermission("post:create")
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

            int articleDefault = SiteConfigMapper.getArticleStatus();

            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("uuid", editArticleService.getArticleUuid(articleId));
            params.put("status", articleDefault);

            int result = editArticleMapper.publishArticle(params);

            if (siteConfigUtil.isNotificationEnabled()) {
                Date date = new Date();
                SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                String formattedDate = formatter.format(date);

                String siteName = siteConfigUtil.getSiteName();

                List<String> emails = userInformationMapper.getEmailsByPermissionCode("post:review");

                if (emails == null || emails.isEmpty()) {
                    log.warn("未找到拥有 'post:review' 权限的用户，跳过发送审核通知邮件");
                } else {
                    for (String email : emails) {
                        try {
                            String article_name = articleReviewMapper.getArticleNameByArticleId(articleId);
                            mailService.sendSimpleMail(
                                    email,
                                    siteName + " 文章审核",
                                    "用户：" + username + " 于 " + formattedDate + " 发布了新文章：" + "《" + article_name + "》" + "可能需要您审核"
                            );
                            notificationService.sendSystemNotification(userInformationMapper.getUsernameByEmail(email), "系统通知", "用户：" + username + " 于 " + formattedDate + " 发布了新文章：" + "《" + article_name + "》" + "可能需要您审核");
                            log.info("已发送审核通知邮件至: {}", email);
                        } catch (Exception e) {
                            log.error("发送审核通知邮件失败，目标邮箱: {}", email, e);
                        }
                    }
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


    @PostMapping("/removearticlepassword")
    @RequiresPermission("post:create")
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

            // 验证文章是否属于该用户
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

            // 移除文章密码
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

}
