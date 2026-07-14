package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Music;
import xyz.lingview.dimstack.service.CurrentUserService;
import xyz.lingview.dimstack.service.MusicService;
import xyz.lingview.dimstack.service.UserService;
import xyz.lingview.dimstack.util.SiteConfigUtil;

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
    private UserService userService;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Autowired
    private CurrentUserService currentUserService;

    // 获取所有启用的音乐
    @GetMapping("/enabled")
    public ApiResponse<?> getEnabledMusics() {

        try {
            if (!siteConfigUtil.isMusicEnabled()) {
                return ApiResponse.success(java.util.Collections.emptyList());
            }
            return ApiResponse.success(musicService.getAllEnabledMusics());
        } catch (Exception e) {
            log.error("获取启用的音乐列表失败", e);
            return ApiResponse.error(500, "获取音乐列表失败: " + e.getMessage());
        }
    }

//    因为某些情况下redis的数据是没有启用悬浮播放器，所以为后台提供不依赖redis的接口
    @GetMapping("/admin/enabled")
    @RequiresPermission({"system:music:management","system:config:management"})
    public ApiResponse<?> getAdminEnabledMusics() {

        try {
            return ApiResponse.success(musicService.getAllEnabledMusics());
        } catch (Exception e) {
            log.error("获取启用的音乐列表失败", e);
            return ApiResponse.error(500, "获取音乐列表失败: " + e.getMessage());
        }
    }


    // 添加音乐
    @PostMapping("/add")
    @RequiresPermission({"system:music:management","system:config:management"})
    public ApiResponse<Void> addMusic(HttpServletRequest request ,@RequestBody Music music) {
        try {
            String username = currentUserService.getCurrentUsername();
            String currentUser = userService.getUserUUID(username);

            music.setUuid(currentUser);

            boolean result = musicService.addMusic(music);
            if (result) {
                return ApiResponse.success("音乐添加成功");
            } else {
                return ApiResponse.error(500, "音乐添加失败");
            }
        } catch (Exception e) {
            log.error("添加音乐失败", e);
            return ApiResponse.error(500, "添加音乐时发生错误: " + e.getMessage());
        }
    }

    // 更新音乐
    @PutMapping("/update/{id}")
    @RequiresPermission({"system:music:management","system:config:management"})
    public ApiResponse<Void> updateMusic(@PathVariable Integer id, @RequestBody Music music) {
        try {
            music.setId(id);

            // 验证必要字段
            if (music.getMusicName() == null || music.getMusicName().trim().isEmpty()) {
                return ApiResponse.error(400, "曲名不能为空");
            }
            if (music.getMusicAuthor() == null || music.getMusicAuthor().trim().isEmpty()) {
                return ApiResponse.error(400, "歌手名不能为空");
            }
            if (music.getMusicUrl() == null || music.getMusicUrl().trim().isEmpty()) {
                return ApiResponse.error(400, "音乐地址不能为空");
            }

            boolean result = musicService.updateMusic(music);
            if (result) {
                return ApiResponse.success("音乐更新成功");
            } else {
                return ApiResponse.error(500, "音乐更新失败");
            }
        } catch (Exception e) {
            log.error("更新音乐失败", e);
            return ApiResponse.error(500, "更新音乐时发生错误: " + e.getMessage());
        }
    }

    // 删除音乐（软删除）
    @DeleteMapping("/delete/{id}")
    @RequiresPermission({"system:music:management","system:config:management"})
    public ApiResponse<Void> deleteMusic(@PathVariable Integer id) {
        try {
            boolean result = musicService.deleteMusic(id);
            if (result) {
                return ApiResponse.success("音乐删除成功");
            } else {
                return ApiResponse.error(500, "音乐删除失败");
            }
        } catch (Exception e) {
            log.error("删除音乐失败", e);
            return ApiResponse.error(500, "删除音乐时发生错误: " + e.getMessage());
        }
    }

    // 获取所有音乐（包括已删除的）
    @GetMapping("/all")
    @RequiresPermission({"system:music:management", "system:config:management"})
    public ApiResponse<?> getAllMusics() {
        try {
            return ApiResponse.success(musicService.getAllMusics());
        } catch (Exception e) {
            log.error("获取所有音乐列表失败", e);
            return ApiResponse.error(500, "获取音乐列表失败: " + e.getMessage());
        }
    }

}