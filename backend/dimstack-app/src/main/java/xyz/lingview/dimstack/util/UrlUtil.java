package xyz.lingview.dimstack.util;

/**
 * @Author: lingview
 * @Date: 2026/01/02 00:15:34
 * @Description: url处理工具
 * @Version: 1.0
 */
public class UrlUtil {

    public static String getFullUrl(String domain, String path) {
        if (path == null || path.isEmpty()) {
            return domain + "/favicon.ico";
        }

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        if (path.startsWith("/")) {
            return domain + path;
        } else {
            return domain + "/" + path;
        }
    }
}
