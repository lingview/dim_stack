package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.security.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.domain.Music;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.MusicService;
import xyz.lingview.dimstack.util.SiteConfigUtil;

import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/01/24 00:42:28
 * @Description: 站点音乐控制器
 * @Version: 1.0
 */

@RestController
@RequestMapping("/api/music")
@Slf4j
public class MusicController {

    @Autowired
    private MusicService musicService;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    // 获取所有启用的音乐
    @GetMapping("/enabled")
    public ResponseEntity<Map<String, Object>> getEnabledMusics() {

        try {
            if (!siteConfigUtil.isMusicEnabled()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", java.util.Collections.emptyList()
                ));
            }
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", musicService.getAllEnabledMusics()
            ));
        } catch (Exception e) {
            log.error("获取启用的音乐列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "获取音乐列表失败: " + e.getMessage()
                    ));
        }
    }

    // 添加音乐
    @PostMapping("/add")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> addMusic(HttpServletRequest request ,@RequestBody Music music) {
        try {
            HttpSession session = request.getSession(false);
            String username = (String) session.getAttribute("username");
            String currentUser = userInformationMapper.selectUserUUID(username);

            music.setUuid(currentUser);

            boolean result = musicService.addMusic(music);
            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "音乐添加成功"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "message", "音乐添加失败"
                        ));
            }
        } catch (Exception e) {
            log.error("添加音乐失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "添加音乐时发生错误: " + e.getMessage()
                    ));
        }
    }

    // 更新音乐
    @PutMapping("/update/{id}")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> updateMusic(@PathVariable Integer id, @RequestBody Music music) {
        try {
            music.setId(id);

            // 验证必要字段
            if (music.getMusicName() == null || music.getMusicName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "曲名不能为空"
                        ));
            }
            if (music.getMusicAuthor() == null || music.getMusicAuthor().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "歌手名不能为空"
                        ));
            }
            if (music.getMusicUrl() == null || music.getMusicUrl().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "音乐地址不能为空"
                        ));
            }

            boolean result = musicService.updateMusic(music);
            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "音乐更新成功"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "message", "音乐更新失败"
                        ));
            }
        } catch (Exception e) {
            log.error("更新音乐失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "更新音乐时发生错误: " + e.getMessage()
                    ));
        }
    }

    // 删除音乐（软删除）
    @DeleteMapping("/delete/{id}")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> deleteMusic(@PathVariable Integer id) {
        try {
            boolean result = musicService.deleteMusic(id);
            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "音乐删除成功"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "message", "音乐删除失败"
                        ));
            }
        } catch (Exception e) {
            log.error("删除音乐失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "删除音乐时发生错误: " + e.getMessage()
                    ));
        }
    }

    // 获取所有音乐（包括已删除的）
    @GetMapping("/all")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> getAllMusics() {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", musicService.getAllMusics()
            ));
        } catch (Exception e) {
            log.error("获取所有音乐列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "获取音乐列表失败: " + e.getMessage()
                    ));
        }
    }

}