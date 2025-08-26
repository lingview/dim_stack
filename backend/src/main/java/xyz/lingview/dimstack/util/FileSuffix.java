package xyz.lingview.dimstack.util;

import java.nio.file.Path;

// 文件扩展名获取类
public class FileSuffix {

    public static String getFileExtension(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return "";
        }

        int dotIndex = filePath.lastIndexOf(".");
        if (dotIndex > 0 && dotIndex < filePath.length() - 1) {
            return filePath.substring(dotIndex).toLowerCase();
        }
        return "";
    }

    public static String getFileExtension(Path file) {
        return getFileExtension(file.getFileName().toString());
    }
}
