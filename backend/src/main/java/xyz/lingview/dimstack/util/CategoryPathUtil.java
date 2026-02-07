package xyz.lingview.dimstack.util;

import lombok.Data;
import org.springframework.stereotype.Component;

/**
 * @Author: lingview
 * @Date: 2026/02/08 01:03:10
 * @Description: 多级分类解析
 * @Version: 1.0
 */
@Component
public class CategoryPathUtil {

    public CategoryPath parsePath(String fullPath) {
        if (fullPath == null || fullPath.isEmpty()) {
            return new CategoryPath(null, null);
        }

        String[] parts = fullPath.split("/");
        if (parts.length == 1) {
            return new CategoryPath(null, parts[0].trim());
        } else if (parts.length >= 2) {
            return new CategoryPath(parts[0].trim(), parts[parts.length - 1].trim());
        }

        return new CategoryPath(null, null);
    }

    public String buildPath(String parent, String child) {
        if (parent == null || parent.isEmpty()) {
            return child;
        }
        return parent + "/" + child;
    }

    @Data
    public static class CategoryPath {
        private String parentCategory;
        private String childCategory;

        public CategoryPath(String parent, String child) {
            this.parentCategory = parent;
            this.childCategory = child;
        }
    }
}