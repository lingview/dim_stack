package xyz.lingview.dimstack.util;

import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/04/08 17:06:58
 * @Description: 大模型调用工具
 * @Version: 1.0
 */
@Slf4j
public class LargeLanguageModelsUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String callDashscopeAPI(String apiKey, String apiUrl, String model, String systemContent, String userQuestion)
            throws IOException, InterruptedException {
        int retryCount = 0;
        int maxRetries = 3;
        long delayBetweenRetries = 2000;

        while (retryCount <= maxRetries) {
            try {
                if (retryCount > 0) {
                    Thread.sleep(delayBetweenRetries);
                }

                URL url = new URL(apiUrl);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();

                connection.setRequestMethod("POST");
                connection.setRequestProperty("Authorization", "Bearer " + apiKey);
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("Accept", "application/json");
                connection.setConnectTimeout(10_000);
                connection.setReadTimeout(30_000);
                connection.setDoOutput(true);

                Map<String, Object> payload = Map.of(
                        "model", model,
                        "stream", false,
                        "enable_thinking", false,
                        "messages", Arrays.asList(
                                Map.of("role", "system", "content", systemContent),
                                Map.of("role", "user", "content", userQuestion)
                        )
                );

                String jsonInputString = objectMapper.writeValueAsString(payload);

                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

                int responseCode = connection.getResponseCode();

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    try (BufferedReader in = new BufferedReader(
                            new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                        StringBuilder response = new StringBuilder();
                        String line;
                        while ((line = in.readLine()) != null) {
                            response.append(line);
                        }
                        return response.toString();
                    }
                } else {
                    InputStream errorStream = connection.getErrorStream();
                    String errorContent = "";
                    if (errorStream != null) {
                        try (BufferedReader errorReader = new BufferedReader(
                                new InputStreamReader(errorStream, StandardCharsets.UTF_8))) {
                            StringBuilder error = new StringBuilder();
                            String line;
                            while ((line = errorReader.readLine()) != null) {
                                error.append(line).append("\n");
                            }
                            errorContent = error.toString();
                        }
                    }

                    log.warn("请求失败，HTTP状态码: {}, 错误详情:\n{}", responseCode, errorContent);

                    if (responseCode == 429 || responseCode == 503 || responseCode == 500) {
                        retryCount++;
                        log.warn("触发限流或服务不可用，正在进行第 {} 次重试...", retryCount);
                        continue;
                    } else {
                        throw new IOException("请求失败，状态码：" + responseCode + ", 响应内容：" + errorContent);
                    }
                }

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("线程被中断: {}", e.getMessage());
                throw new IOException("请求被中断", e);
            } catch (Exception e) {
                log.warn("请求调用异常: {}", e.getMessage(), e);
                retryCount++;
                if (retryCount > maxRetries) {
                    throw new IOException("请求失败，已达到最大重试次数: " + maxRetries, e);
                }
                log.warn("正在进行第 {} 次重试...", retryCount);
                Thread.sleep(delayBetweenRetries);
            }
        }

        throw new IOException("请求失败，已达到最大重试次数: " + maxRetries);
    }
}