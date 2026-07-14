package xyz.lingview.dimstack.service;

import org.springframework.core.io.Resource;

public interface FileAccessService {

    /**
     * 获取文件资源
     * @param accessKey 访问密钥
     * @param download 是否下载模式
     * @return 文件访问结果
     */
    FileAccessResult getFile(String accessKey, boolean download);

    /**
     * 文件访问结果
     */
    record FileAccessResult(
            Resource resource,
            String contentType,
            String filename,
            boolean found
    ) {}
}