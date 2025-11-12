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
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.mapper.ArticleCategoryMapper;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
import xyz.lingview.dimstack.mapper.UploadMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.UploadService;
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
    private UploadService uploadService;

    @PostMapping("/uploadattachment")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> uploadAttachment(HttpServletRequest request,
                                                                @RequestParam("file") MultipartFile file) {
        return uploadService.uploadAttachment(request, file);
    }

    @PostMapping("/uploadattachment/init")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> initMultipartUpload(HttpServletRequest request,
                                                                   @RequestBody Map<String, String> payload) {
        return uploadService.initMultipartUpload(request, payload);
    }

    @PostMapping("/uploadattachment/part")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> uploadChunk(
            HttpServletRequest request,
            @RequestHeader("Upload-Id") String uploadId,
            @RequestHeader("Chunk-Index") int chunkIndex,
            @RequestBody byte[] chunkData) {
        return uploadService.uploadChunk(request, uploadId, chunkIndex, chunkData);
    }

    @PostMapping("/uploadattachment/complete")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> completeUpload(
            HttpServletRequest request,
            @RequestBody Map<String, String> payload) {
        return uploadService.completeUpload(request, payload);
    }

    @PostMapping("/uploadarticle")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, Object>> uploadArticle(HttpServletRequest request,
                                                             @RequestBody UploadArticle uploadArticle) {
        return uploadService.uploadArticle(request, uploadArticle);
    }

    @PostMapping("/uploadavatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(HttpServletRequest request,
                                                            @RequestParam("file") MultipartFile file) {
        return uploadService.uploadAvatar(request, file);
    }


}
