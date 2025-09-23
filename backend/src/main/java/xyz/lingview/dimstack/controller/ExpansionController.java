package xyz.lingview.dimstack.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import xyz.lingview.dimstack.service.SiteConfigService;

import java.io.*;
import java.net.URL;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.zip.ZipInputStream;

@RestController
@RequestMapping("/api")
public class ExpansionController {

    @Autowired
    private SiteConfigService siteConfigService;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // 主题名字只允许字母、数字、连字符和下划线
    private static final Pattern THEME_SLUG_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]+$");

    @PostMapping("/getthemeslist")
    public Map<String, Object> getThemesList() {
        Map<String, Object> response = new HashMap<>();
        try {
            // 从数据库获取扩展服务器地址
            String expansionServer = siteConfigService.getExpansionServer();

            if (expansionServer == null || expansionServer.isEmpty()) {
                response.put("success", false);
                response.put("message", "扩展服务器地址未配置");
                return response;
            }

            // 从扩展服务器获取主题列表
            String themesJson = restTemplate.getForObject(expansionServer, String.class);

            if (themesJson != null) {
                JsonNode themes = objectMapper.readTree(themesJson);
                response.put("success", true);
                response.put("data", themes);
            } else {
                response.put("success", false);
                response.put("message", "无法从扩展服务器获取主题列表");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取主题列表失败: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/gettheme")
    public Map<String, Object> getTheme(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String slug = request.get("slug");
            if (slug == null || slug.isEmpty()) {
                response.put("success", false);
                response.put("message", "主题标识(slug)不能为空");
                return response;
            }

            // 验证主题标识的合法性
            if (!isValidThemeSlug(slug)) {
                response.put("success", false);
                response.put("message", "主题标识包含非法字符，只允许字母、数字、连字符和下划线");
                return response;
            }

            // 从数据库获取扩展服务器地址
            String expansionServer = siteConfigService.getExpansionServer();
            if (expansionServer == null || expansionServer.isEmpty()) {
                response.put("success", false);
                response.put("message", "扩展服务器地址未配置");
                return response;
            }

            // 从扩展服务器获取主题列表
            String themesJson = restTemplate.getForObject(expansionServer, String.class);
            if (themesJson == null) {
                response.put("success", false);
                response.put("message", "无法从扩展服务器获取主题列表");
                return response;
            }

            JsonNode themes = objectMapper.readTree(themesJson);
            JsonNode targetTheme = null;

            // 查找匹配的主题
            if (themes.isArray()) {
                for (JsonNode theme : themes) {
                    if (slug.equals(theme.get("slug").asText())) {
                        targetTheme = theme;
                        break;
                    }
                }
            }

            if (targetTheme == null) {
                response.put("success", false);
                response.put("message", "未找到标识为 '" + slug + "' 的主题");
                return response;
            }

            // 获取下载URL
            String downloadUrl = targetTheme.get("download_url").asText();
            if (downloadUrl == null || downloadUrl.isEmpty()) {
                response.put("success", false);
                response.put("message", "主题下载链接无效");
                return response;
            }

            // 下载并解压主题
            boolean downloadSuccess = downloadAndExtractTheme(downloadUrl, slug);
            if (downloadSuccess) {
                response.put("success", true);
                response.put("message", "主题 '" + slug + "' 下载并安装成功");
                response.put("data", targetTheme);
            } else {
                response.put("success", false);
                response.put("message", "主题 '" + slug + "' 下载或解压失败");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取主题失败: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/deletetheme")
    public Map<String, Object> deleteTheme(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String slug = request.get("slug");
            if (slug == null || slug.isEmpty()) {
                response.put("success", false);
                response.put("message", "主题标识(slug)不能为空");
                return response;
            }

            // 验证主题标识的合法性
            if (!isValidThemeSlug(slug)) {
                response.put("success", false);
                response.put("message", "主题标识包含非法字符，只允许字母、数字、连字符和下划线");
                return response;
            }

            // 检查是否是当前激活的主题
            String activeTheme = siteConfigService.getSiteTheme();
            if (slug.equals(activeTheme)) {
                response.put("success", false);
                response.put("message", "不能删除当前激活的主题");
                return response;
            }

            // 构建主题路径
            String themesPath = "themes";
            Path themeDir = Paths.get(themesPath, slug).normalize();

            // 验证路径是否在themes目录内，防止路径遍历攻击
            Path themesBasePath = Paths.get(themesPath).toAbsolutePath().normalize();
            if (!themeDir.toAbsolutePath().normalize().startsWith(themesBasePath)) {
                response.put("success", false);
                response.put("message", "非法的主题路径");
                return response;
            }

            // 检查主题目录是否存在
            if (!Files.exists(themeDir)) {
                response.put("success", false);
                response.put("message", "主题目录 '" + slug + "' 不存在");
                return response;
            }

            // 确保这是一个目录而不是文件
            if (!Files.isDirectory(themeDir)) {
                response.put("success", false);
                response.put("message", "'" + slug + "' 不是一个有效的主题目录");
                return response;
            }

            // 删除主题目录
            deleteDirectory(themeDir);
            response.put("success", true);
            response.put("message", "主题 '" + slug + "' 删除成功");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "删除主题失败: " + e.getMessage());
        }
        return response;
    }

    /**
     * 验证主题标识是否合法
     * @param slug 主题标识
     * @return 是否合法
     */
    private boolean isValidThemeSlug(String slug) {
        if (slug == null || slug.isEmpty()) {
            return false;
        }

        if (slug.contains("..") || slug.contains("/") || slug.contains("\\") || slug.contains(":")) {
            return false;
        }

        return THEME_SLUG_PATTERN.matcher(slug).matches();
    }

    /**
     * 下载并解压主题
     * @param downloadUrl 下载链接
     * @param themeSlug 主题标识
     * @return 是否成功
     */
    private boolean downloadAndExtractTheme(String downloadUrl, String themeSlug) {
        try {
            String themesPath = "themes";
            Path themesDir = Paths.get(themesPath);
            if (!Files.exists(themesDir)) {
                Files.createDirectories(themesDir);
            }

            Path themeDir = Paths.get(themesPath, themeSlug).normalize();

            Path themesBasePath = Paths.get(themesPath).toAbsolutePath().normalize();
            if (!themeDir.toAbsolutePath().normalize().startsWith(themesBasePath)) {
                throw new IOException("非法的主题路径");
            }

            if (Files.exists(themeDir)) {
                deleteDirectory(themeDir);
            }

            Path tempFile = Files.createTempFile("theme_", ".zip");
            try (InputStream in = new URL(downloadUrl).openStream()) {
                Files.copy(in, tempFile, StandardCopyOption.REPLACE_EXISTING);
            }

            unzipFile(tempFile, themeDir);

            Files.deleteIfExists(tempFile);

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 解压ZIP文件
     * @param zipFile ZIP文件路径
     * @param destDir 目标目录
     * @throws IOException IO异常
     */
    private void unzipFile(Path zipFile, Path destDir) throws IOException {
        try (InputStream in = Files.newInputStream(zipFile);
             ZipInputStream zipIn = new ZipInputStream(in)) {

            if (!Files.exists(destDir)) {
                Files.createDirectories(destDir);
            }

            java.util.zip.ZipEntry entry = zipIn.getNextEntry();
            while (entry != null) {
                String entryName = entry.getName();
                if (entryName.contains("..")) {
                    throw new IOException("ZIP条目包含非法路径: " + entryName);
                }

                Path entryPath = destDir.resolve(entryName).normalize();

                if (!entryPath.startsWith(destDir)) {
                    throw new IOException("非法路径: " + entry.getName());
                }

                if (entry.isDirectory()) {
                    if (!Files.exists(entryPath)) {
                        Files.createDirectories(entryPath);
                    }
                } else {
                    Path parent = entryPath.getParent();
                    if (!Files.exists(parent)) {
                        Files.createDirectories(parent);
                    }

                    try (OutputStream out = Files.newOutputStream(entryPath)) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = zipIn.read(buffer)) > 0) {
                            out.write(buffer, 0, len);
                        }
                    }
                }

                zipIn.closeEntry();
                entry = zipIn.getNextEntry();
            }
        }
    }

    /**
     * 递归删除目录
     * @param dir 目录路径
     * @throws IOException IO异常
     */
    private void deleteDirectory(Path dir) throws IOException {
        if (Files.exists(dir)) {
            Path themesBasePath = Paths.get("themes").toAbsolutePath().normalize();
            if (!dir.toAbsolutePath().normalize().startsWith(themesBasePath)) {
                throw new IOException("非法的删除路径: " + dir);
            }

            Files.walk(dir)
                .sorted(java.util.Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
        }
    }


}
