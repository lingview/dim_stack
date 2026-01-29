package xyz.lingview.dimstack.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Optional;

@Service
@Slf4j
public class UpdateService {
    private static final String VERSION_FILE_PATH = "/system_version.txt";

    public String getCurrentVersion() {
        try (InputStream inputStream = getClass().getResourceAsStream(VERSION_FILE_PATH)) {
            if (inputStream != null) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
                return reader.readLine();
            } else {
                log.error("无法找到版本文件: {}", VERSION_FILE_PATH);
                return "unknown";
            }
        } catch (IOException e) {
            log.error("读取版本文件失败", e);
            return "unknown";
        }
    }

    public String fetchUpdateInfo(String updateUrl) {
        try {
            URL url = new URL(updateUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(30000);

            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();
                String inputLine;

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine).append("\n");
                }
                in.close();

                return response.toString().trim();
            } else {
                log.error("获取更新信息失败，响应码: {}", responseCode);
                return null;
            }
        } catch (Exception e) {
            log.error("获取更新信息时发生错误", e);
            return null;
        }
    }

    public boolean downloadNewJar(String downloadUrl, String targetPath) {
        try {
            URL url = new URL(downloadUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(120000);

            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                Path targetFilePath = Path.of(targetPath);
                Files.createDirectories(targetFilePath.getParent());

                try (InputStream inputStream = connection.getInputStream();
                     FileOutputStream outputStream = new FileOutputStream(targetPath)) {

                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    long totalBytesRead = 0;

                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                        totalBytesRead += bytesRead;
                        log.debug("已下载字节: {}", totalBytesRead);
                    }

                    log.info("成功下载新版本JAR到: {}", targetPath);
                    return true;
                }
            } else {
                log.error("下载JAR失败，响应码: {}", responseCode);
                return false;
            }
        } catch (Exception e) {
            log.error("下载JAR文件时发生错误", e);
            return false;
        }
    }

    public boolean verifyChecksum(String filePath, String expectedChecksum) {
        try (InputStream in = Files.newInputStream(Path.of(filePath))) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int len;
            while ((len = in.read(buffer)) != -1) {
                digest.update(buffer, 0, len);
            }

            byte[] hash = digest.digest();
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append("%02x".formatted(b));
            }
            return hex.toString().equalsIgnoreCase(expectedChecksum);
        } catch (Exception e) {
            log.error("验证校验和失败", e);
            return false;
        }
    }

    public String getExpectedChecksum() throws IOException {
        Path checksumPath = Path.of(
                System.getProperty("user.dir"),
                ".update",
                "dimstack_update.sha256"
        );
        if (!Files.exists(checksumPath)) {
            return null;
        }
        return Files.readString(checksumPath).trim();
    }

    public boolean performUpdate(String newJarPath) {
        try {
            String currentJarPath = getCurrentJarPath();
            if (currentJarPath == null) {
                log.error("无法获取当前JAR路径");
                return false;
            }

            File newFile = new File(newJarPath);
            if (!newFile.exists()) {
                log.error("新JAR文件不存在: {}", newJarPath);
                return false;
            }

            Path targetPath = Path.of(currentJarPath);
            Files.createDirectories(targetPath.getParent());

            if (Files.exists(targetPath)) {
                String backupPath = currentJarPath + ".update_backup";
                Path backupPathObj = Path.of(backupPath);
                Files.copy(targetPath, backupPathObj, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                log.info("当前JAR已备份到: {}", backupPath);
            }

            Files.copy(newFile.toPath(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            log.info("更新完成，新JAR已替换到: {}", currentJarPath);

            return true;
        } catch (Exception e) {
            log.error("执行更新时发生错误", e);
            return false;
        }
    }

    /**
     * 仅执行更新，不重启
     */
    public boolean performUpdateOnly(String newJarPath) {
        log.info("执行仅更新操作，不重启应用");
        return performUpdate(newJarPath);
    }

    /**
     * 执行更新并重启
     */
    public boolean performUpdateAndRestart(String newJarPath) {
        try {
            boolean updateSuccess = performUpdate(newJarPath);
            if (!updateSuccess) {
                log.error("更新失败,无法重启");
                return false;
            }



            long currentPid = ProcessHandle.current().pid();
            String jarPath = getCurrentJarPath();

            if (jarPath == null) {
                log.error("无法获取当前JAR路径");
                return false;
            }

            log.info("当前进程PID: {}", currentPid);
            log.info("JAR路径: {}", jarPath);

            String scriptPath = createRestartScript(jarPath, currentPid);
            if (scriptPath == null) {
                log.error("创建重启脚本失败");
                return false;
            }

            log.info("重启脚本已创建: {}", scriptPath);

            new Thread(() -> {
                try {
                    log.info("等待1秒让HTTP响应返回...");
                    Thread.sleep(1000);

                    log.info("启动重启脚本...");

                    Runtime.getRuntime().exec(new String[]{
                            "bash", "-c",
                            "nohup bash " + scriptPath + " > /tmp/restart_script.log 2>&1 &"
                    });

                    log.info("重启脚本已启动");

                    Thread.sleep(2000);

                    log.info("当前进程即将退出");
                    System.exit(0);

                } catch (Exception e) {
                    log.error("启动重启脚本失败", e);
                }
            }, "restart-script-launcher").start();

            return true;

        } catch (Exception e) {
            log.error("执行更新并重启时发生错误", e);
            return false;
        }
    }

    /**
     * 创建重启脚本
     */
    private String createRestartScript(String jarPath, long currentPid) {
        try {
            String javaExe = getJavaExecutable();

            String scriptContent = """
                    #!/bin/bash
                    echo '[Restart Script] Waiting for application to exit...'
                    sleep 3
                    echo '[Restart Script] Ensuring old process is terminated...'
                    kill -9 %d 2>/dev/null || true
                    sleep 2
                    echo '[Restart Script] Starting new application...'
                    cd '%s'
                    nohup '%s' -jar '%s' > app.log 2>&1 &
                    echo '[Restart Script] Application restarted, PID: '$!
                    exit 0
                    """.formatted(
                    currentPid,
                    System.getProperty("user.dir"),
                    javaExe,
                    jarPath
            );

            String scriptPath = "/tmp/dimstack_restart.sh";

            Path scriptFile = Path.of(scriptPath);
            Files.write(scriptFile, scriptContent.getBytes());
            scriptFile.toFile().setExecutable(true);

            log.info("重启脚本已创建:");
            log.info("路径: {}", scriptPath);
            log.info("内容:\n{}", scriptContent);

            return scriptPath;

        } catch (Exception e) {
            log.error("创建重启脚本失败", e);
            return null;
        }
    }

    /**
     * 获取Java可执行文件路径
     */
    private String getJavaExecutable() {
        String javaHome = System.getProperty("java.home");
        String javaExe = javaHome + "/bin/java";

        File javaFile = new File(javaExe);
        if (javaFile.exists()) {
            log.info("使用Java路径: {}", javaExe);
            return javaExe;
        }

        log.warn("未找到Java可执行文件,使用PATH中的java");
        return "java";
    }

    /**
     * 获取当前运行的JAR文件路径
     */
    private String getCurrentJarPath() {
        try {
            Optional<String> jarFromCmd = ProcessHandle.current()
                    .info()
                    .commandLine()
                    .flatMap(cmd -> {
                        String[] parts = cmd.split("\\s+");
                        for (int i = 0; i < parts.length - 1; i++) {
                            if ("-jar".equals(parts[i])) {
                                return Optional.of(parts[i + 1]);
                            }
                        }
                        return Optional.empty();
                    });

            if (jarFromCmd.isPresent()) {
                File jar = new File(jarFromCmd.get()).getAbsoluteFile();
                if (jar.exists() && jar.getName().endsWith(".jar")) {
                    log.info("从 JVM 启动参数解析到主 JAR: {}", jar);
                    return jar.getAbsolutePath();
                }
            }

            URL location = getClass()
                    .getProtectionDomain()
                    .getCodeSource()
                    .getLocation();

            if (location != null) {
                Path path = Path.of(location.toURI()).toAbsolutePath();

                if (Files.isRegularFile(path) && path.toString().endsWith(".jar")) {
                    log.info("从保护域获取 JAR: {}", path);
                    return path.toString();
                }
            }

            log.error("当前不是以 jar 方式运行，禁止执行自更新");
            return null;

        } catch (Exception e) {
            log.error("获取当前 JAR 路径失败", e);
            return null;
        }
    }


    public boolean isNewerVersion(String currentVersion, String newVersion) {
        try {
            String[] currentParts = currentVersion.split("\\.");
            String[] newParts = newVersion.split("\\.");

            for (int i = 0; i < Math.max(currentParts.length, newParts.length); i++) {
                int currentPart = i < currentParts.length ? Integer.parseInt(currentParts[i]) : 0;
                int newPart = i < newParts.length ? Integer.parseInt(newParts[i]) : 0;

                if (newPart > currentPart) {
                    return true;
                } else if (newPart < currentPart) {
                    return false;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("版本比较失败", e);
            return true;
        }
    }

    public boolean isVersionCompatible(String currentVersion, String minCompatibleVersion) {
        if (minCompatibleVersion == null || minCompatibleVersion.isEmpty()) {
            return true;
        }

        try {
            String[] currentParts = currentVersion.split("\\.");
            String[] minParts = minCompatibleVersion.split("\\.");

            if (currentParts.length > 0 && minParts.length > 0) {
                int currentMajor = Integer.parseInt(currentParts[0]);
                int minMajor = Integer.parseInt(minParts[0]);

                if (currentMajor < minMajor) {
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            log.error("版本兼容性检查失败", e);
            return false;
        }
    }
}