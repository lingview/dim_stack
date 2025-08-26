package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import xyz.lingview.dimstack.domain.UploadArticle;
import xyz.lingview.dimstack.domain.UploadAttachment;
import xyz.lingview.dimstack.mapper.UploadMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.util.RandomUtil;

import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.file.*;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UploadController {

    @Autowired
    private UploadMapper uploadMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;
    @PostMapping("/uploadattachment")
    public ResponseEntity<Map<String, String>> uploadAttachment(HttpServletRequest request,
                                                               @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "File is empty"));
        }

        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not logged in"));
        }

        String username = (String) session.getAttribute("username");
        if (username == null || !username.matches("^[a-zA-Z0-9_]+$")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username"));
        }

        String userUUID = userInformationMapper.selectUserUUID(username);
        if (userUUID == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }


        Path uploadPath = Paths.get("upload", username, "attachment").normalize();
        Path allowedRoot = Paths.get("upload").toAbsolutePath().normalize();

        if (!uploadPath.toAbsolutePath().startsWith(allowedRoot)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Invalid upload path"));
        }

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create directory"));
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        UUID uuid = UUID.randomUUID();
        String fileUUID = uuid + "-" + timestamp + "-" + RandomUtil.generateRandomNumber(5, "1234567890qwertyuiopasdfghjklzxcvbnm");
        String fileName = fileUUID + fileExtension;

        Path filePath = uploadPath.resolve(fileName);

        UploadAttachment uploadFile = new UploadAttachment();
        uploadFile.setUuid(userUUID);
        uploadFile.setAttachment_id(fileUUID);
        uploadFile.setAttachment_path(filePath.toString());

        int insertResult = uploadMapper.insertUploadAttachment(uploadFile);
        if (insertResult != 1) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to insert into database"));
        }


        try {
            file.transferTo(filePath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save file"));
        }

        String fileUrl = "/upload/" + username + "/attachment/" + fileName;
        return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
    }

    // 初始化分片上传
    @PostMapping("/uploadattachment/init")
    public ResponseEntity<Map<String, String>> initMultipartUpload(HttpServletRequest request,
                                                                  @RequestBody Map<String, String> payload) {
        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not logged in"));
        }

        String username = (String) session.getAttribute("username");
        if (username == null || !username.matches("^[a-zA-Z0-9_]+$")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username"));
        }

        String filename = payload.get("filename");
        if (filename == null || filename.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Filename is required"));
        }

        String uploadId = UUID.randomUUID().toString();
        return ResponseEntity.ok(Map.of("uploadId", uploadId));
    }

    @PostMapping("/uploadattachment/part")
    public ResponseEntity<Map<String, String>> uploadChunk(
            HttpServletRequest request,
            @RequestHeader("Upload-Id") String uploadId,
            @RequestHeader("Chunk-Index") int chunkIndex,
            @RequestBody byte[] chunkData) {

        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not logged in"));
        }

        String username = (String) session.getAttribute("username");
        if (username == null || !username.matches("^[a-zA-Z0-9_]+$")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username"));
        }

        String userUUID = userInformationMapper.selectUserUUID(username);
        if (userUUID == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        Path uploadPath = Paths.get("upload", username, "attachment", uploadId).normalize();
        Path allowedRoot = Paths.get("upload").toAbsolutePath().normalize();

        if (!uploadPath.toAbsolutePath().startsWith(allowedRoot)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Invalid upload path"));
        }

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create directory"));
        }

        Path chunkFile = uploadPath.resolve("chunk_" + chunkIndex);

        try {
            Files.write(chunkFile, chunkData);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save chunk"));
        }

        return ResponseEntity.ok(Map.of("message", "Chunk uploaded successfully"));
    }

    // 完成分片上传
    @PostMapping("/uploadattachment/complete")
    public ResponseEntity<Map<String, String>> completeUpload(
            HttpServletRequest request,
            @RequestBody Map<String, String> payload) {

        String uploadId = payload.get("uploadId");
        String filename = payload.get("filename");

        if (uploadId == null || uploadId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "uploadId is required"));
        }

        if (filename == null || filename.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "filename is required"));
        }

        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not logged in"));
        }

        String username = (String) session.getAttribute("username");
        if (username == null || !username.matches("^[a-zA-Z0-9_]+$")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username"));
        }

        String userUUID = userInformationMapper.selectUserUUID(username);
        if (userUUID == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        Path uploadPath = Paths.get("upload", username, "attachment", uploadId).normalize();
        Path finalFilePath = uploadPath.resolve(filename);

        try {
            // 读取所有分片，按索引排序
            List<Path> chunks = Files.list(uploadPath)
                    .filter(p -> p.getFileName().toString().startsWith("chunk_"))
                    .sorted(Comparator.comparingInt(p -> {
                        String name = p.getFileName().toString();
                        return Integer.parseInt(name.replace("chunk_", ""));
                    }))
                    .toList();

            try (FileChannel outChannel = FileChannel.open(finalFilePath,
                    StandardOpenOption.CREATE, StandardOpenOption.WRITE)) {
                for (Path chunk : chunks) {
                    try (FileChannel inChannel = FileChannel.open(chunk, StandardOpenOption.READ)) {
                        inChannel.transferTo(0, inChannel.size(), outChannel);
                    }
                    Files.delete(chunk);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to merge files: " + e.getMessage()));
        }

        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        UUID uuid = UUID.randomUUID();
        String fileExtension = "";
        if (filename.contains(".")) {
            fileExtension = filename.substring(filename.lastIndexOf("."));
        }

        String fileUUID = uuid + "-" + timestamp + "-" +
                RandomUtil.generateRandomNumber(5, "1234567890qwertyuiopasdfghjklzxcvbnm");
        String newFileName = fileUUID + fileExtension;

        Path targetFilePath = Paths.get("upload", username, "attachment", newFileName).normalize();
        try {
            Files.move(finalFilePath, targetFilePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to rename merged file: " + e.getMessage()));
        }

        UploadAttachment uploadFile = new UploadAttachment();
        uploadFile.setUuid(userUUID);
        uploadFile.setAttachment_id(fileUUID);
        uploadFile.setAttachment_path(targetFilePath.toString());

        int insertResult = uploadMapper.insertUploadAttachment(uploadFile);
        if (insertResult != 1) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save file info"));
        }

        String fileUrl = "/upload/" + username + "/attachment/" + newFileName;
        return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
    }

    @PostMapping("/uploadarticle")
    public ResponseEntity<Map<String, String>> uploadArticle(
            HttpServletRequest request,
            @RequestParam("article_name") String articleName,
            @RequestParam("file") MultipartFile file) {

        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not logged in"));
        }

        String username = (String) session.getAttribute("username");
        if (username == null || !username.matches("^[a-zA-Z0-9_]+$")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username"));
        }

        String userUUID = userInformationMapper.selectUserUUID(username);
        if (userUUID == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        Path uploadPath = Paths.get("upload", username, "article").normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create directory"));
        }

        String uuid = UUID.randomUUID().toString();
        String fileName = uuid + ".md";
        Path filePath = uploadPath.resolve(fileName);

        try {
            file.transferTo(filePath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save file"));
        }

        String articleId = RandomUtil.generateRandomNumber(5, "1234567890qwertyuiopasdfghjklzxcvbnm");

        UploadArticle uploadArticle = new UploadArticle();
        uploadArticle.setUuid(userUUID);
        uploadArticle.setArticle_id(articleId);
        uploadArticle.setArticle_name(articleName);
        uploadArticle.setArticle_path(filePath.toString());
        uploadArticle.setStatus(1);

        int result = uploadMapper.insertUploadArticle(uploadArticle);
        if (result != 1) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to insert into database"));
        }

        String fileUrl = "/upload/" + username + "/article/" + fileName;
        return ResponseEntity.ok(Map.of("fileUrl", fileUrl, "articleId", articleId));
    }
}
