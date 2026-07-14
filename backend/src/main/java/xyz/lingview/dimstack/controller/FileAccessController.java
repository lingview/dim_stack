package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.service.FileAccessService;

/**
 * @Author: lingview
 * @Date: 2025/11/12 09:03:20
 * @Description: 文件访问控制器
 * @Version: 1.0
 */
@Slf4j
@RestController
@RequestMapping("/file")
public class FileAccessController {

    @Autowired
    private FileAccessService fileAccessService;

    @GetMapping("/{accessKey}")
    public ResponseEntity<org.springframework.core.io.Resource> getFile(
            @PathVariable String accessKey,
            @RequestParam(required = false, defaultValue = "false") Boolean download) {
        try {
            FileAccessService.FileAccessResult result = fileAccessService.getFile(accessKey, download);

            if (!result.found()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(result.contentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, result.filename())
                    .body(result.resource());

        } catch (Exception e) {
            log.error("获取文件时发生错误，访问键: {}", accessKey, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}