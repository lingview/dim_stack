package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.domain.UploadArticle;
import xyz.lingview.dimstack.domain.UploadAttachment;
import xyz.lingview.dimstack.mapper.UploadMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.util.RandomUtil;

import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
public class UploadController {

    @Autowired
    private UploadMapper uploadMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;

    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024;

    private static final Map<String, List<String>> SUPPORTED_FILE_TYPES = Map.of(
            "image", List.of(
                    "image/jpeg", "image/jpg", "image/png", "image/gif",
                    "image/webp", "image/svg+xml", "image/bmp"
            ),
            "video", List.of(
                    "video/mp4", "video/webm", "video/ogg",
                    "video/avi", "video/mov", "video/mkv"
            ),
            "audio", List.of(
                    "audio/mp3", "audio/mpeg", "audio/wav",
                    "audio/ogg", "audio/m4a", "audio/aac",
                    "audio/flac", "audio/x-flac"
            )
    );

    private static final Set<String> SUPPORTED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp",
            ".mp4", ".webm", ".ogg", ".avi", ".mov", ".mkv",
            ".mp3", ".wav", ".flac", ".aac", ".m4a"
    );

    private String getUsername(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            log.debug("未找到用户会话或用户未登录");
            return null;
        }
        String username = (String) session.getAttribute("username");
        if (username == null || !username.matches("^[a-zA-Z0-9_]+$")) {
            log.debug("会话中的用户名无效: {}", username);
            return null;
        }
        return username;
    }

    private String getUserUUID(String username) {
        String uuid = userInformationMapper.selectUserUUID(username);
        if (uuid == null) {
            log.warn("未找到用户名 {} 的UUID", username);
        }
        return uuid;
    }

    private boolean isMimeAllowed(String mimeType) {
        boolean allowed = SUPPORTED_FILE_TYPES.values().stream()
                .flatMap(List::stream)
                .anyMatch(type -> type.equalsIgnoreCase(mimeType));
        if (!allowed) {
            log.debug("MIME类型不被允许: {}", mimeType);
        }
        return allowed;
    }

    private boolean isExtensionAllowed(String extension) {
        boolean allowed = SUPPORTED_EXTENSIONS.contains(extension.toLowerCase());
        if (!allowed) {
            log.debug("文件扩展名不被允许: {}", extension);
        }
        return allowed;
    }

    private String getFolderByMime(String mimeType) {
        for (Map.Entry<String, List<String>> entry : SUPPORTED_FILE_TYPES.entrySet()) {
            if (entry.getValue().contains(mimeType)) {
                return entry.getKey();
            }
        }
        return "attachment";
    }


    private String getMimeTypeByExtension(String extension) {
        Map<String, String> extensionToMime = new HashMap<>();

        extensionToMime.put(".jpg", "image/jpeg");
        extensionToMime.put(".jpeg", "image/jpeg");
        extensionToMime.put(".png", "image/png");
        extensionToMime.put(".gif", "image/gif");
        extensionToMime.put(".webp", "image/webp");
        extensionToMime.put(".svg", "image/svg+xml");
        extensionToMime.put(".bmp", "image/bmp");

        extensionToMime.put(".mp4", "video/mp4");
        extensionToMime.put(".webm", "video/webm");
        extensionToMime.put(".ogg", "video/ogg");
        extensionToMime.put(".avi", "video/avi");
        extensionToMime.put(".mov", "video/mov");
        extensionToMime.put(".mkv", "video/mkv");

        extensionToMime.put(".mp3", "audio/mp3");
        extensionToMime.put(".wav", "audio/wav");
        extensionToMime.put(".flac", "audio/flac");
        extensionToMime.put(".aac", "audio/aac");
        extensionToMime.put(".m4a", "audio/m4a");

        return extensionToMime.getOrDefault(extension.toLowerCase(), "application/octet-stream");
    }

    private String detectMimeTypeFromFile(Path filePath) {
        try {
            String mimeType = Files.probeContentType(filePath);

            if (mimeType == null || mimeType.equals("application/octet-stream")) {
                String fileName = filePath.getFileName().toString();
                if (fileName.contains(".")) {
                    String extension = fileName.substring(fileName.lastIndexOf("."));
                    mimeType = getMimeTypeByExtension(extension);
                }
            }

            log.debug("检测到文件 {} 的MIME类型: {}", filePath.getFileName(), mimeType);
            return mimeType != null ? mimeType : "application/octet-stream";
        } catch (IOException e) {
            log.warn("检测文件 {} 的MIME类型时出错", filePath.getFileName(), e);
            String fileName = filePath.getFileName().toString();
            if (fileName.contains(".")) {
                String extension = fileName.substring(fileName.lastIndexOf("."));
                return getMimeTypeByExtension(extension);
            }
            return "application/octet-stream";
        }
    }


    @PostMapping("/uploadattachment")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> uploadAttachment(HttpServletRequest request,
                                                                @RequestParam("file") MultipartFile file) {

        log.info("开始附件上传流程");

        if (file.isEmpty()) {
            log.warn("尝试上传空文件");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "文件为空"));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("尝试上传过大文件: {} 字节", file.getSize());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "文件过大"));
        }

        String username = getUsername(request);
        if (username == null) {
            log.warn("未授权的上传尝试");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "用户未登录或用户名无效"));
        }

        String userUUID = getUserUUID(username);
        if (userUUID == null) {
            log.error("未找到用户名 {} 的UUID", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "未找到用户"));
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        String extension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }

        if (!isMimeAllowed(contentType) || !isExtensionAllowed(extension)) {
            log.warn("尝试上传被禁止的文件类型。MIME: {}, 扩展名: {}", contentType, extension);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "文件类型不被允许"));
        }

        String subFolder = getFolderByMime(contentType);
        Path uploadPath = Paths.get("upload", username, "attachment", subFolder).normalize();
        Path allowedRoot = Paths.get("upload").toAbsolutePath().normalize();

        if (!uploadPath.toAbsolutePath().startsWith(allowedRoot)) {
            log.error("检测到无效的上传路径: {}", uploadPath);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "上传路径无效"));
        }

        try {
            Files.createDirectories(uploadPath);
            log.debug("创建目录: {}", uploadPath);
        } catch (IOException e) {
            log.error("创建目录失败: {}", uploadPath, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "创建目录失败"));
        }

        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        UUID uuid = UUID.randomUUID();
        String fileUUID = uuid + "-" + timestamp + "-" +
                RandomUtil.generateRandomNumber(5, "1234567890qwertyuiopasdfghjklzxcvbnm");
        String fileName = fileUUID + extension;

        Path filePath = uploadPath.resolve(fileName);

        UploadAttachment uploadFile = new UploadAttachment();
        uploadFile.setUuid(userUUID);
        uploadFile.setAttachment_id(fileUUID);
        uploadFile.setAttachment_path(filePath.toString());

        int insertResult = uploadMapper.insertUploadAttachment(uploadFile);
        if (insertResult != 1) {
            log.error("插入附件记录到数据库失败。文件: {}", fileName);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "插入数据库失败"));
        }

        try {
            file.transferTo(filePath);
            log.info("文件上传成功。路径: {}", filePath);
        } catch (IOException e) {
            log.error("保存文件失败: {}", filePath, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "保存文件失败"));
        }

        String fileUrl = "/upload/" + username + "/attachment/" + subFolder + "/" + fileName;
        log.info("附件上传完成。URL: {}", fileUrl);
        return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
    }

    @PostMapping("/uploadattachment/init")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> initMultipartUpload(HttpServletRequest request,
                                                                   @RequestBody Map<String, String> payload) {

        log.info("初始化分片上传");

        String username = getUsername(request);
        if (username == null) {
            log.warn("未授权的分片上传初始化尝试");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "用户未登录或用户名无效"));
        }

        String filename = payload.get("filename");
        if (filename == null || filename.isEmpty()) {
            log.warn("分片上传初始化时未提供文件名");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "文件名是必需的"));
        }

        String extension = "";
        if (filename.contains(".")) {
            extension = filename.substring(filename.lastIndexOf(".")).toLowerCase();
        }

        if (!isExtensionAllowed(extension)) {
            log.warn("分片上传初始化时使用了被禁止的扩展名: {}", extension);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "文件扩展名不被允许"));
        }

        String uploadId = UUID.randomUUID().toString();
        log.info("分片上传初始化成功。上传ID: {}", uploadId);
        return ResponseEntity.ok(Map.of("uploadId", uploadId));
    }


    @PostMapping("/uploadattachment/part")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> uploadChunk(
            HttpServletRequest request,
            @RequestHeader("Upload-Id") String uploadId,
            @RequestHeader("Chunk-Index") int chunkIndex,
            @RequestBody byte[] chunkData) {

        log.debug("上传分片 {}/{}，上传ID: {}", chunkIndex, uploadId);

        String username = getUsername(request);
        if (username == null) {
            log.warn("未授权的分片上传尝试");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "用户未登录或用户名无效"));
        }

        Path uploadPath = Paths.get("upload", username, "temp", uploadId).normalize();
        Path allowedRoot = Paths.get("upload").toAbsolutePath().normalize();

        if (!uploadPath.toAbsolutePath().startsWith(allowedRoot)) {
            log.error("分片的上传路径无效: {}", uploadPath);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "上传路径无效"));
        }

        try {
            Files.createDirectories(uploadPath);
            Path chunkFile = uploadPath.resolve(String.format("%05d.part", chunkIndex));
            Files.write(chunkFile, chunkData, StandardOpenOption.CREATE, StandardOpenOption.WRITE);
            log.debug("分片 {}/{} 上传成功", chunkIndex, uploadId);
        } catch (IOException e) {
            log.error("保存分片 {}/{} 失败", chunkIndex, uploadId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "保存分片失败"));
        }

        return ResponseEntity.ok(Map.of("message", "分片上传成功"));
    }

     @PostMapping("/uploadattachment/complete")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> completeUpload(
            HttpServletRequest request,
            @RequestBody Map<String, String> payload) {

        log.info("完成分片上传");

        String uploadId = payload.get("uploadId");
        String filename = payload.get("filename");

        if (uploadId == null || uploadId.isEmpty() || filename == null || filename.isEmpty()) {
            log.warn("完成上传请求缺少必要参数");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "uploadId和文件名是必需的"));
        }

        String username = getUsername(request);
        if (username == null) {
            log.warn("未授权的分片上传完成尝试");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "用户未登录或用户名无效"));
        }

        String userUUID = getUserUUID(username);
        if (userUUID == null) {
            log.error("未找到用户名 {} 的UUID", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "未找到用户"));
        }

        String extension = "";
        if (filename.contains(".")) {
            extension = filename.substring(filename.lastIndexOf(".")).toLowerCase();
        }

        if (!isExtensionAllowed(extension)) {
            log.warn("分片上传完成时使用了被禁止的扩展名: {}", extension);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "文件扩展名不被允许"));
        }

        Path tempDir = Paths.get("upload", username, "temp", uploadId).normalize();
        Path allowedRoot = Paths.get("upload").toAbsolutePath().normalize();
        if (!tempDir.toAbsolutePath().startsWith(allowedRoot)) {
            log.error("完成操作的上传路径无效: {}", tempDir);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "上传路径无效"));
        }

        if (!Files.exists(tempDir)) {
            log.error("临时目录不存在: {}", tempDir);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "临时目录不存在"));
        }

        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        UUID uuid = UUID.randomUUID();
        String fileUUID = uuid + "-" + timestamp + "-" +
                RandomUtil.generateRandomNumber(5, "1234567890qwertyuiopasdfghjklzxcvbnm");
        String newFileName = fileUUID + extension;

        String mimeType = getMimeTypeByExtension(extension);
        String subFolder = getFolderByMime(mimeType);

        Path finalDir = Paths.get("upload", username, "attachment", subFolder).normalize();
        Path finalFilePath = finalDir.resolve(newFileName);

        try {
            Files.createDirectories(finalDir);
            log.debug("为最终文件创建目录: {}", finalDir);

            List<Path> chunks = Files.list(tempDir)
                    .filter(p -> p.getFileName().toString().endsWith(".part"))
                    .sorted(Comparator.comparing(Path::getFileName))
                    .toList();

            if (chunks.isEmpty()) {
                log.warn("未找到任何分片文件在目录: {}", tempDir);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "未找到任何分片文件"));
            }

            log.debug("找到 {} 个分片文件准备合并", chunks.size());

            try (FileChannel outChannel = FileChannel.open(finalFilePath,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.WRITE,
                    StandardOpenOption.TRUNCATE_EXISTING)) {

                for (Path chunk : chunks) {
                    log.debug("正在处理分片: {}", chunk.getFileName());
                    try (FileChannel inChannel = FileChannel.open(chunk, StandardOpenOption.READ)) {
                        inChannel.transferTo(0, inChannel.size(), outChannel);
                    } catch (IOException e) {
                        log.error("处理分片文件 {} 时出错", chunk, e);
                        throw e;
                    }
                }
            }

            log.debug("分片合并完成，开始清理临时文件");

            for (Path chunk : chunks) {
                try {
                    Files.deleteIfExists(chunk);
                    log.debug("已删除分片文件: {}", chunk.getFileName());
                } catch (IOException e) {
                    log.warn("删除分片文件 {} 失败", chunk, e);
                }
            }

            try {
                Files.deleteIfExists(tempDir);
                log.debug("已删除临时目录: {}", tempDir.getFileName());
            } catch (IOException e) {
                log.warn("删除临时目录 {} 失败", tempDir, e);
            }

            log.info("分片合并成功。最终文件: {}", finalFilePath);

        } catch (IOException e) {
            log.error("合并上传ID为 {} 的分片失败，临时目录: {}", uploadId, tempDir, e);

            try {
                Files.deleteIfExists(finalFilePath);
            } catch (IOException cleanupEx) {
                log.warn("清理不完整的文件 {} 失败", finalFilePath, cleanupEx);
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "合并分片失败: " + e.getMessage()));
        } catch (Exception e) {
            log.error("合并上传ID为 {} 的分片时发生未预期错误", uploadId, e);

            try {
                Files.deleteIfExists(finalFilePath);
            } catch (IOException cleanupEx) {
                log.warn("清理不完整的文件 {} 失败", finalFilePath, cleanupEx);
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "合并分片时发生错误: " + e.getMessage()));
        }

        String detectedMimeType = detectMimeTypeFromFile(finalFilePath);

        if (!isMimeAllowed(detectedMimeType)) {
            try {
                Files.deleteIfExists(finalFilePath);
            } catch (IOException e) {
                log.warn("删除MIME类型被禁止的文件失败: {}", finalFilePath, e);
            }

            log.warn("检测后发现文件类型不被允许: {}", detectedMimeType);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "文件类型不被允许: " + detectedMimeType));
        }

        UploadAttachment uploadFile = new UploadAttachment();
        uploadFile.setUuid(userUUID);
        uploadFile.setAttachment_id(fileUUID);
        uploadFile.setAttachment_path(finalFilePath.toString());

        int insertResult = uploadMapper.insertUploadAttachment(uploadFile);
        if (insertResult != 1) {
            log.error("保存文件信息到数据库失败。文件: {}", newFileName);
            try {
                Files.deleteIfExists(finalFilePath);
            } catch (IOException e) {
                log.warn("清理文件 {} 失败", finalFilePath, e);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "保存文件信息失败"));
        }

        String fileUrl = "/upload/" + username + "/attachment/" + subFolder + "/" + newFileName;
        log.info("分片上传完成。URL: {}", fileUrl);
        return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
    }


    @PostMapping("/uploadarticle")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, Object>> uploadArticle(HttpServletRequest request,
                                                             @RequestBody UploadArticle uploadArticle) {
        log.info("开始文章上传流程");

        String username = getUsername(request);
        if (username == null) {
            log.warn("未授权的文章上传尝试");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "用户未登录或用户名无效"));
        }

        String userUUID = getUserUUID(username);
        if (userUUID == null) {
            log.error("未找到用户名 {} 的UUID", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "未找到用户"));
        }

        if (uploadArticle.getArticle_name() == null || uploadArticle.getArticle_name().trim().isEmpty()) {
            log.warn("文章标题为空");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "文章标题不能为空"));
        }

        if (uploadArticle.getArticle_content() == null || uploadArticle.getArticle_content().trim().isEmpty()) {
            log.warn("文章内容为空");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "文章内容不能为空"));
        }

        if (uploadArticle.getCategory() == null || uploadArticle.getCategory().trim().isEmpty()) {
            log.warn("文章分类为空");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "文章分类不能为空"));
        }

        if (uploadArticle.getPassword() != null && !uploadArticle.getPassword().trim().isEmpty()) {
            String hashedPassword = BCrypt.hashpw(uploadArticle.getPassword(), BCrypt.gensalt());
            uploadArticle.setPassword(hashedPassword);
            log.debug("文章密码已使用BCrypt加密");
        } else {
            uploadArticle.setPassword(null);
        }

        uploadArticle.setUuid(userUUID);

        if (uploadArticle.getArticle_id() == null || uploadArticle.getArticle_id().trim().isEmpty()) {
            String articleId = UUID.randomUUID().toString();
            uploadArticle.setArticle_id(articleId);
        }

        if (uploadArticle.getStatus() != 1 && uploadArticle.getStatus() != 3) {
            uploadArticle.setStatus(2);
        }

        try {
            int result = uploadMapper.insertUploadArticle(uploadArticle);
            if (result == 1) {
                log.info("文章上传成功，文章ID: {}", uploadArticle.getArticle_id());
                return ResponseEntity.ok(Map.of(
                        "message", "文章保存成功",
                        "articleId", uploadArticle.getArticle_id()
                ));
            } else {
                log.error("插入文章记录到数据库失败");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "保存文章失败"));
            }
        } catch (Exception e) {
            log.error("保存文章时发生错误", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "保存文章时发生错误: " + e.getMessage()));
        }
    }

}
