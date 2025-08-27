package xyz.lingview.dimstack.test;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.net.HttpCookie;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;
// 本测试在作者权限下测试
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class PermissionBasedTestControllerTest {

    private static final String BASE_URL = "http://192.168.1.6:2222";
    private static final String SESSION_COOKIE = "ZjNlOTFmZDQtYzQxYS00N2Q2LTk2NmItMGYxYzMzZTFiZWEy";
    private HttpClient client;

    @BeforeAll
    void setUp() {
        client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    // 用户拥有的权限对应的接口
    static Stream<TestCase> permittedEndpoints() {
        return Stream.of(
            new TestCase("/api/test/permission/view", "post:view", 200),
            new TestCase("/api/test/permission/create", "post:create", 200),
            new TestCase("/api/test/permission/edit/own", "post:edit:own", 200),
            new TestCase("/api/test/permission/delete/own", "post:delete:own", 200),
            new TestCase("/api/test/permission/submit", "post:submit", 200),
            new TestCase("/api/test/permission/public", "public", 200)
        );
    }

    // 用户没有的权限对应的接口
    static Stream<TestCase> forbiddenEndpoints() {
        return Stream.of(
            new TestCase("/api/test/permission/edit/any", "post:edit:any", 403),
            new TestCase("/api/test/permission/delete/any", "post:delete:any", 403),
            new TestCase("/api/test/permission/publish", "post:publish", 403),
            new TestCase("/api/test/permission/review", "post:review", 403)
        );
    }

    // 多权限接口测试
    static Stream<TestCase> multiPermissionEndpoints() {
        return Stream.of(
            // AND模式: 需要 post:view AND post:create (用户都有)
            new TestCase("/api/test/permission/multi-and", "post:view & post:create", 200),
            // OR模式: 需要 post:edit:own OR post:edit:any (用户有post:edit:own)
            new TestCase("/api/test/permission/multi-or", "post:edit:own | post:edit:any", 200)
        );
    }

    @ParameterizedTest
    @MethodSource("permittedEndpoints")
    void testPermittedEndpoints(TestCase testCase) throws Exception {
        HttpResponse<String> response = sendGetRequest(testCase.endpoint);

        System.out.printf("测试有权限接口: %s (需要权限: %s)%n", testCase.endpoint, testCase.requiredPermission);
        System.out.printf("  期望状态码: %d, 实际状态码: %d%n", testCase.expectedStatus, response.statusCode());

        if (response.statusCode() == 200) {
            assertTrue(response.body().contains("\"success\":true"),
                "Response should indicate success for endpoint: " + testCase.endpoint);
            System.out.println("  ✓ 权限验证通过");
        } else {
            System.out.println("  ✗ 权限验证失败");
        }
        System.out.println();
    }

    @ParameterizedTest
    @MethodSource("forbiddenEndpoints")
    void testForbiddenEndpoints(TestCase testCase) throws Exception {
        HttpResponse<String> response = sendGetRequest(testCase.endpoint);

        System.out.printf("测试无权限接口: %s (需要权限: %s)%n", testCase.endpoint, testCase.requiredPermission);
        System.out.printf("  期望状态码: %d, 实际状态码: %d%n", testCase.expectedStatus, response.statusCode());

        if (response.statusCode() == 403) {
            System.out.println("  ✓ 权限正确拒绝");
        } else if (response.statusCode() == 200) {
            System.out.println("  ⚠ 权限异常通过");
        } else {
            System.out.println("  ? 其他响应状态: " + response.statusCode());
        }
        System.out.println();
    }

    @ParameterizedTest
    @MethodSource("multiPermissionEndpoints")
    void testMultiPermissionEndpoints(TestCase testCase) throws Exception {
        HttpResponse<String> response = sendGetRequest(testCase.endpoint);

        System.out.printf("测试多权限接口: %s (需要权限: %s)%n", testCase.endpoint, testCase.requiredPermission);
        System.out.printf("  期望状态码: %d, 实际状态码: %d%n", testCase.expectedStatus, response.statusCode());

        if (response.statusCode() == 200) {
            System.out.println("  ✓ 多权限验证通过");
        } else if (response.statusCode() == 403) {
            System.out.println("  ✗ 多权限验证失败");
        } else {
            System.out.println("  ? 其他响应状态: " + response.statusCode());
        }
        System.out.println();
    }

    private HttpResponse<String> sendGetRequest(String endpoint) throws Exception {
        HttpCookie cookie = new HttpCookie("SESSION", SESSION_COOKIE);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Cookie", cookie.toString())
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();

        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    static class TestCase {
        final String endpoint;
        final String requiredPermission;
        final int expectedStatus;

        TestCase(String endpoint, String requiredPermission, int expectedStatus) {
            this.endpoint = endpoint;
            this.requiredPermission = requiredPermission;
            this.expectedStatus = expectedStatus;
        }
    }
}
