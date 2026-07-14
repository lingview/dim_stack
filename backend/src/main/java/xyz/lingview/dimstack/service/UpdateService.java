package xyz.lingview.dimstack.service;

import java.io.IOException;

public interface UpdateService {

    String getCurrentVersion();

    String fetchUpdateInfo(String updateUrl);

    boolean downloadNewJar(String downloadUrl, String targetPath);

    boolean verifyChecksum(String filePath, String expectedChecksum);

    String getExpectedChecksum() throws IOException;

    boolean performUpdate(String newJarPath);

    /**
     * 仅执行更新，不重启
     */
    boolean performUpdateOnly(String newJarPath);

    /**
     * 执行更新并重启
     */
    boolean performUpdateAndRestart(String newJarPath);

    boolean isNewerVersion(String currentVersion, String newVersion);

    int compareVersions(String v1, String v2);

    boolean isCoreVersionInRange(String currentVersion, String minVersion, String maxVersion);

    boolean isVersionCompatible(String currentVersion, String minCompatibleVersion);
}