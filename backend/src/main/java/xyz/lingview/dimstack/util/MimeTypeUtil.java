package xyz.lingview.dimstack.util;

import java.util.Map;

/**
 * @Author: lingview
 * @Description: 文件扩展名到MIME类型的映射工具
 * @Version: 1.0
 */
public final class MimeTypeUtil {

    private static final Map<String, String> EXTENSION_TO_MIME = Map.ofEntries(
            Map.entry(".jpg", "image/jpeg"),
            Map.entry(".jpeg", "image/jpeg"),
            Map.entry(".png", "image/png"),
            Map.entry(".gif", "image/gif"),
            Map.entry(".webp", "image/webp"),
            Map.entry(".svg", "image/svg+xml"),
            Map.entry(".bmp", "image/bmp"),
            Map.entry(".mp4", "video/mp4"),
            Map.entry(".webm", "video/webm"),
            Map.entry(".ogg", "video/ogg"),
            Map.entry(".avi", "video/avi"),
            Map.entry(".mov", "video/mov"),
            Map.entry(".mkv", "video/mkv"),
            Map.entry(".mp3", "audio/mp3"),
            Map.entry(".wav", "audio/wav"),
            Map.entry(".flac", "audio/flac"),
            Map.entry(".aac", "audio/aac"),
            Map.entry(".m4a", "audio/m4a"),
            Map.entry(".zip", "application/zip"),
            Map.entry(".rar", "application/x-rar-compressed"),
            Map.entry(".tar", "application/x-tar"),
            Map.entry(".gz", "application/gzip"),
            Map.entry(".tgz", "application/gzip"),
            Map.entry(".xz", "application/x-xz"),
            Map.entry(".7z", "application/x-7z-compressed"),
            Map.entry(".pdf", "application/pdf"),
            Map.entry(".doc", "application/msword"),
            Map.entry(".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    );

    private MimeTypeUtil() {
    }

    public static String getByExtension(String extension) {
        if (extension == null) {
            return "application/octet-stream";
        }
        return EXTENSION_TO_MIME.getOrDefault(extension.toLowerCase(), "application/octet-stream");
    }
}
