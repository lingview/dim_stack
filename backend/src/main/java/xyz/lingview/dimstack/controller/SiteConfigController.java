package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.domain.Role;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.dto.request.HeroDTO;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.SiteConfigService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/site")
@Slf4j
public class SiteConfigController {

    @Autowired
    private SiteConfigService siteConfigService;

    @Autowired
    private SiteConfigMapper siteConfigMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @GetMapping("/hero")
    public HeroDTO getHeroConfig() {
        return siteConfigService.getHeroConfig();
    }

    @GetMapping("/copyright")
    public String getCopyright() {
        return siteConfigService.getCopyright();
    }

    @GetMapping("/name")
    public String getSiteName() {
        return siteConfigService.getSiteName();
    }

    @GetMapping("/icon")
    public String getSiteIcon() {
        return siteConfigService.getSiteIcon();
    }

    @GetMapping("/getsiteconfig")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> getsiteconfig() {
        log.info("获取站点配置信息");
        try {
            SiteConfig config = siteConfigService.getSiteConfig();
            if (config != null) {
                config.setMail_password(null);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", config
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                            "success", false,
                            "message", "未找到站点配置信息"
                        ));
            }
        } catch (Exception e) {
            log.error("获取站点配置信息失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "success", false,
                        "message", "获取站点配置信息失败: " + e.getMessage()
                    ));
        }
    }

    @PostMapping("/editsiteconfig")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> editsiteconfig(@RequestBody SiteConfig siteConfig) {
        log.info("更新站点配置信息");
        try {
            SiteConfig currentConfig = siteConfigService.getSiteConfig();
            if (currentConfig == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "message", "无法获取当前站点配置"
                        ));
            }

            if (siteConfig.getSite_name() != null && !siteConfig.getSite_name().trim().isEmpty()) {
                currentConfig.setSite_name(siteConfig.getSite_name());
            } else if (currentConfig.getSite_name() == null || currentConfig.getSite_name().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "站点名称不能为空"
                        ));
            }

            if (siteConfig.getCopyright() != null && !siteConfig.getCopyright().trim().isEmpty()) {
                currentConfig.setCopyright(siteConfig.getCopyright());
            } else if (currentConfig.getCopyright() == null || currentConfig.getCopyright().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "版权信息不能为空"
                        ));
            }

            if (siteConfig.getHero_title() != null && !siteConfig.getHero_title().trim().isEmpty()) {
                currentConfig.setHero_title(siteConfig.getHero_title());
            } else if (currentConfig.getHero_title() == null || currentConfig.getHero_title().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "首页标题不能为空"
                        ));
            }

            if (siteConfig.getHero_subtitle() != null && !siteConfig.getHero_subtitle().trim().isEmpty()) {
                currentConfig.setHero_subtitle(siteConfig.getHero_subtitle());
            } else if (currentConfig.getHero_subtitle() == null || currentConfig.getHero_subtitle().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "首页副标题不能为空"
                        ));
            }

            if (siteConfig.getRegister_user_permission() != null) {
                currentConfig.setRegister_user_permission(siteConfig.getRegister_user_permission());
            }

//            if (siteConfig.getArticle_status() != 0) {
//                currentConfig.setArticle_status(siteConfig.getArticle_status());
//            }
            currentConfig.setArticle_status(siteConfig.getArticle_status());

            if (siteConfig.getHero_image() != null) {
                currentConfig.setHero_image(siteConfig.getHero_image());
            }

            if (siteConfig.getSite_icon() != null) {
                currentConfig.setSite_icon(siteConfig.getSite_icon());
            }

            if (siteConfig.getSite_theme() != null) {
                currentConfig.setSite_theme(siteConfig.getSite_theme());
            }

            if (siteConfig.getExpansion_server() != null) {
                currentConfig.setExpansion_server(siteConfig.getExpansion_server());
            }

            if (siteConfig.getEnable_notification() != null) {
                currentConfig.setEnable_notification(siteConfig.getEnable_notification());
            }

            if (siteConfig.getSmtp_host() != null) {
                currentConfig.setSmtp_host(siteConfig.getSmtp_host());
            }

            if (siteConfig.getSmtp_port() != null) {
                currentConfig.setSmtp_port(siteConfig.getSmtp_port());
            }

            if (siteConfig.getMail_sender_email() != null) {
                currentConfig.setMail_sender_email(siteConfig.getMail_sender_email());
            }

            if (siteConfig.getMail_sender_name() != null) {
                currentConfig.setMail_sender_name(siteConfig.getMail_sender_name());
            }

            if (siteConfig.getMail_username() != null) {
                currentConfig.setMail_username(siteConfig.getMail_username());
            }

            if (siteConfig.getMail_password() != null && !siteConfig.getMail_password().isEmpty()) {
                currentConfig.setMail_password(siteConfig.getMail_password());
            }

            if (siteConfig.getMail_protocol() != null) {
                currentConfig.setMail_protocol(siteConfig.getMail_protocol());
            }

            if (siteConfig.getMail_enable_tls() != null) {
                currentConfig.setMail_enable_tls(siteConfig.getMail_enable_tls());
            }

            if (siteConfig.getMail_enable_ssl() != null) {
                currentConfig.setMail_enable_ssl(siteConfig.getMail_enable_ssl());
            }

            if (siteConfig.getMail_default_encoding() != null) {
                currentConfig.setMail_default_encoding(siteConfig.getMail_default_encoding());
            }

            if (siteConfig.getIcp_record_number() != null) {
                currentConfig.setIcp_record_number(siteConfig.getIcp_record_number());
            }

            if (siteConfig.getMps_record_number() != null) {
                currentConfig.setMps_record_number(siteConfig.getMps_record_number());
            }

            if (siteConfig.getEnable_register() != null) {
                currentConfig.setEnable_register(siteConfig.getEnable_register());
            }
            if (siteConfig.getEnable_music() != null) {
                currentConfig.setEnable_music(siteConfig.getEnable_music());
            }
            if (siteConfig.getAdmin_post_no_review() != null) {
                currentConfig.setAdmin_post_no_review(siteConfig.getAdmin_post_no_review());
            }
            boolean result = siteConfigService.updateSiteConfig(currentConfig);

            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "站点配置更新成功"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "message", "更新站点配置失败"
                        ));
            }
        } catch (Exception e) {
            log.error("更新站点配置信息失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "更新站点配置时发生错误: " + e.getMessage()
                    ));
        }
    }

    @GetMapping("/roles")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> getAllRoles() {
        log.info("获取所有角色列表");
        try {
            List<Role> roles = userInformationMapper.selectAllRoles();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", roles
            ));
        } catch (Exception e) {
            log.error("获取角色列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "获取角色列表失败: " + e.getMessage()
                    ));
        }
    }

    @GetMapping("/article-status-options")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> getArticleStatusOptions() {
        log.info("获取文章状态选项");

        List<Map<String, Object>> statusOptions = List.of(
                Map.of("value", 0, "label", "删除"),
                Map.of("value", 1, "label", "正常"),
                Map.of("value", 2, "label", "未发布"),
                Map.of("value", 3, "label", "待审核"),
                Map.of("value", 4, "label", "违规")
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", statusOptions
        ));
    }

    @GetMapping("/icp-record")
    public String getIcpRecordNumber() {
        return siteConfigService.getIcpRecordNumber();
    }

    @GetMapping("/mps-record")
    public String getMpsRecordNumber() {
        return siteConfigService.getMpsRecordNumber();
    }


    @GetMapping("/enable-register")
    public ResponseEntity<Map<String, Object>> getEnableRegisterStatus() {
        try {
            Integer enableRegister = siteConfigService.getEnableRegister();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Map.of("enableRegister", enableRegister != null && enableRegister == 1)
            ));
        } catch (Exception e) {
            log.error("获取用户注册状态失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "获取用户注册状态失败: " + e.getMessage()
                    ));
        }
    }

    @GetMapping("/admin-post-no-review")
    public ResponseEntity<Map<String, Object>> getAdminPostNoReviewStatus() {
        try {
            Integer adminPostNoReview = siteConfigService.getAdminPostNoReview();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Map.of("adminPostNoReview", adminPostNoReview != null && adminPostNoReview == 1)
            ));
        } catch (Exception e) {
            log.error("获取管理员文章审核状态失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "获取管理员文章审核状态失败: " + e.getMessage()
                    ));
        }
    }

}