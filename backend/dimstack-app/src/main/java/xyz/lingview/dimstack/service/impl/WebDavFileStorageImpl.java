package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import xyz.lingview.dimstack.service.FileStorage;

import java.io.IOException;
import java.io.InputStream;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.stream.Collectors;

@Slf4j
public class WebDavFileStorageImpl implements FileStorage {

    private final RestClient restClient;
    private final String baseUrl;

    public WebDavFileStorageImpl(String url, String username, String password) {
        this.baseUrl = stripTrailingSlash(url);
        this.restClient = RestClient.builder()
                .requestFactory(new JdkClientHttpRequestFactory())
                .defaultHeader(HttpHeaders.AUTHORIZATION, basicAuth(username, password))
                .build();
        verifyConnection();
    }

    private void verifyConnection() {
        try {
            restClient.method(HttpMethod.valueOf("PROPFIND"))
                    .uri(baseUrl)
                    .header("Depth", "0")
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new RuntimeException("WebDAV认证失败，请检查用户名和密码", e);
        } catch (ResourceAccessException e) {
            throw new RuntimeException("WebDAV服务器无法连接: " + e.getMessage(), e);
        } catch (Exception e) {
            log.debug("WebDAV初始化PROPFIND返回异常: {}", e.getMessage());
        }
    }

    @Override
    public void store(String objectKey, InputStream data, long contentLength, String contentType) {
        ensureParentCollections(objectKey);
        String url = resolveUrl(objectKey);
        Resource body = new InputStreamResource(data) {
            @Override
            public long contentLength() {
                return contentLength;
            }
        };
        try {
            restClient.put()
                    .uri(url)
                    .header(HttpHeaders.CONTENT_TYPE,
                            (contentType != null && !contentType.isEmpty()) ? contentType : "application/octet-stream")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.debug("WebDAV写入成功: {}", url);
        } catch (Exception e) {
            log.error("WebDAV写入失败: {}", url, e);
            throw new RuntimeException("WebDAV文件写入失败", e);
        }
    }

    @Override
    public InputStream retrieve(String objectKey) {
        String url = resolveUrl(objectKey);
        try {
            if (!exists(objectKey)) {
                throw new RuntimeException("WebDAV文件不存在: " + objectKey);
            }

            PipedInputStream in = new PipedInputStream();
            PipedOutputStream out = new PipedOutputStream(in);

            Thread runner = new Thread(() -> {
                try {
                    restClient.get()
                            .uri(url)
                            .exchange((request, response) -> {
                                // exchange 不抛 4xx/5xx，由我们手动检查
                                if (response.getStatusCode().isError()) {
                                    throw new HttpClientErrorException(
                                            response.getStatusCode(),
                                            response.getStatusText());
                                }
                                response.getBody().transferTo(out);
                                return null;
                            });
                } catch (Exception e) {
                    log.error("WebDAV流式读取失败: {}", url, e);
                } finally {
                    try { out.close(); } catch (IOException ignored) { }
                }
            });
            runner.setDaemon(true);
            runner.start();

            return in;
        } catch (Exception e) {
            log.error("WebDAV读取失败: {}", url, e);
            throw new RuntimeException("WebDAV文件读取失败", e);
        }
    }

    @Override
    public void delete(String objectKey) {
        String url = resolveUrl(objectKey);
        try {
            restClient.delete()
                    .uri(url)
                    .retrieve()
                    .toBodilessEntity();
            log.debug("WebDAV删除成功: {}", url);
        } catch (HttpClientErrorException.NotFound e) {
            log.debug("WebDAV删除目标不存在，视为已删除: {}", url);
        } catch (Exception e) {
            log.error("WebDAV删除失败: {}", url, e);
            throw new RuntimeException("WebDAV文件删除失败", e);
        }
    }

    @Override
    public boolean exists(String objectKey) {
        String url = resolveUrl(objectKey);
        try {
            restClient.method(HttpMethod.valueOf("PROPFIND"))
                    .uri(url)
                    .header("Depth", "0")
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        } catch (Exception e) {
            log.warn("WebDAV exists检查失败: {}", url, e);
            return false;
        }
    }

    @Override
    public void copy(String sourceKey, String destKey) {
        String sourceUrl = resolveUrl(sourceKey);
        String destUrl = resolveUrl(destKey);
        ensureParentCollections(destKey);
        try {
            restClient.method(HttpMethod.valueOf("COPY"))
                    .uri(sourceUrl)
                    .header("Destination", destUrl)
                    .header("Overwrite", "T")
                    .retrieve()
                    .toBodilessEntity();
            log.debug("WebDAV拷贝成功: {} -> {}", sourceUrl, destUrl);
        } catch (Exception e) {
            log.error("WebDAV拷贝失败: {} -> {}", sourceUrl, destUrl, e);
            throw new RuntimeException("WebDAV文件拷贝失败", e);
        }
    }

    @Override
    public String getType() {
        return "webdav";
    }


    private void ensureParentCollections(String objectKey) {
        String[] segments = objectKey.split("/");
        StringBuilder path = new StringBuilder();
        for (int i = 0; i < segments.length - 1; i++) {
            if (segments[i].isEmpty()) {
                continue;
            }
            if (path.length() > 0) {
                path.append("/");
            }
            path.append(segments[i]);
            mkcol(baseUrl + "/" + encodePath(path.toString()));
        }
    }

    private void mkcol(String dirUrl) {
        try {
            restClient.method(HttpMethod.valueOf("MKCOL"))
                    .uri(dirUrl)
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() != 405) {
                log.debug("MKCOL {} 返回状态 {}", dirUrl, e.getStatusCode());
            }
        } catch (Exception e) {
            log.debug("MKCOL {} 失败: {}", dirUrl, e.getMessage());
        }
    }

    private String resolveUrl(String objectKey) {
        return baseUrl + "/" + encodePath(objectKey);
    }

    private String encodePath(String path) {
        return Arrays.stream(path.split("/"))
                .map(segment -> URLEncoder.encode(segment, StandardCharsets.UTF_8).replace("+", "%20"))
                .collect(Collectors.joining("/"));
    }

    private static String stripTrailingSlash(String s) {
        if (s == null) {
            return "";
        }
        String result = s.trim();
        while (result.endsWith("/")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }

    private static String basicAuth(String username, String password) {
        String credentials = (username == null ? "" : username) + ":" + (password == null ? "" : password);
        return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }
}
