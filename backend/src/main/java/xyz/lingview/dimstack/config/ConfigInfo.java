package xyz.lingview.dimstack.config;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * @Author: lingview
 * @Date: 2026/01/10 18:54:11
 * @Description: 配置文件检查
 * @Version: 1.0
 */
public class ConfigInfo {
    public static final Path CONFIG_DIR = Paths.get("config");
    public static final Path MAIN_CONFIG_FILE = CONFIG_DIR.resolve("application.yml");

    public static boolean isConfigComplete() {
        return MAIN_CONFIG_FILE.toFile().exists();
    }
}