package xyz.lingview.dimstack_expansion_server.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack_expansion_server.common.ApiResponse;
import xyz.lingview.dimstack_expansion_server.domain.Login;
import xyz.lingview.dimstack_expansion_server.dto.request.LoginDTO;
import xyz.lingview.dimstack_expansion_server.dto.response.LoginResponseDTO;
import xyz.lingview.dimstack_expansion_server.dto.response.LogoutResponseDTO;
import xyz.lingview.dimstack_expansion_server.mapper.LoginMapper;
import xyz.lingview.dimstack_expansion_server.util.CaptchaUtil;
import xyz.lingview.dimstack_expansion_server.util.PasswordUtil;


/**
 * @Auther: lingview
 * @Date: 2025/09/24 10:32:51
 * @Description: 用户登录控制器
 */
@Slf4j
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private LoginMapper loginMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String CAPTCHA_PREFIX = "captcha_";
    private static final String SESSION_CAPTCHA_KEY_ATTR = "captchaKey";

    /**
     * 用户登录接口
     *
     * @param loginDTO 包含登录所需信息的请求体，必须包含以下字段：
     *                 - username: 用户名（非空）
     *                 - password: 密码（非空）
     *                 - captcha: 验证码（非空）
     *                 - captchaKey: 验证码标识符（非空）
     * @param httpRequest HTTP请求对象，用于创建新的会话
     * @param session     当前会话对象，用于验证验证码和管理用户会话
     * @return ApiResponse<LoginResponseDTO> 登录结果响应：
     *         - 成功：状态码200，返回包含"success": true和"message": "登录成功"的JSON数据
     *         - 失败：根据具体错误返回相应状态码和错误信息：
     *           - 400：请求参数验证失败（如用户名、密码或验证码为空）
     *           - 401：用户名或密码错误
     *           - 500：服务器内部错误
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponseDTO> login(
            @RequestBody LoginDTO loginDTO,
            HttpServletRequest httpRequest,
            HttpSession session) {

        try {
            String username = loginDTO.getUsername();
            String password = loginDTO.getPassword();
            String captcha = loginDTO.getCaptcha();
            String captchaKey = loginDTO.getCaptchaKey();

            if (username == null || username.trim().isEmpty()) {
                return ApiResponse.error(400, "用户名不能为空");
            }
            if (password == null || password.isEmpty()) {
                return ApiResponse.error(400, "密码不能为空");
            }
            if (captcha == null || captcha.isEmpty()) {
                return ApiResponse.error(400, "验证码不能为空");
            }
            if (captchaKey == null || captchaKey.isEmpty()) {
                return ApiResponse.error(400, "验证码无效");
            }

            String sessionCaptchaKey = (String) session.getAttribute(SESSION_CAPTCHA_KEY_ATTR);
            String currentSessionId = session.getId();

            log.info("登录请求 - Session ID: {}, 请求 captchaKey: {}, Session captchaKey: {}",
                    currentSessionId, captchaKey, sessionCaptchaKey);

            if (sessionCaptchaKey == null || !sessionCaptchaKey.equals(captchaKey)) {
                log.warn("验证码 key 不匹配 - Session: {}, 请求: {}", sessionCaptchaKey, captchaKey);
                return ApiResponse.error(400, "验证码无效或已过期，请重新获取");
            }

            String redisCaptchaKey = CAPTCHA_PREFIX + captchaKey;
            String redisCaptcha = redisTemplate.opsForValue().get(redisCaptchaKey);

            if (redisCaptcha == null) {
                log.warn("Redis 中无验证码 - key: {}", redisCaptchaKey);
                cleanUpCaptcha(session, redisCaptchaKey);
                return ApiResponse.error(400, "验证码已过期，请重新获取");
            }

            if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {
                log.warn("验证码错误 - 输入: {}, 正确: {}", captcha, redisCaptcha);
                cleanUpCaptcha(session, redisCaptchaKey);
                return ApiResponse.error(400, "验证码错误");
            }

            cleanUpCaptcha(session, redisCaptchaKey);
            log.info("验证码校验通过，已立即删除 - key: {}", redisCaptchaKey);

            Login login = new Login();
            login.setUsername(username);
            login.setPassword(password);

            Login result = loginMapper.loginUser(login);
            if (result == null) {
                return ApiResponse.error(401, "用户名或密码错误");
            }

            if (!PasswordUtil.checkPassword(password, result.getPassword())) {
                return ApiResponse.error(401, "用户名或密码错误");
            }

            session.invalidate();
            HttpSession newSession = httpRequest.getSession(true);
            newSession.setAttribute("username", username);
            newSession.setAttribute("isLoggedIn", true);
            newSession.setAttribute("loginTime", System.currentTimeMillis());

            log.info("用户 {} 登录成功，新 Session ID: {}", username, newSession.getId());

            LoginResponseDTO data = new LoginResponseDTO();
            data.setSuccess(true);
            data.setMessage("登录成功");
            return ApiResponse.success(data);

        } catch (Exception e) {
            log.error("登录过程发生未知错误", e);
            return ApiResponse.error(500, "登录失败，请稍后再试");
        }
    }

    /**
     * 用户登出接口
     *
     * @param session 当前用户的会话对象
     * @return ApiResponse<LogoutResponseDTO> 登出结果响应：
     *         - 状态码200，返回包含"success": true和"message": "登出成功"的JSON数据
     */
    @PostMapping("/logout")
    public ApiResponse<LogoutResponseDTO> logout(HttpSession session) {
        String username = (String) session.getAttribute("username");
        session.invalidate();
        log.info("用户 {} 登出成功", username);

        LogoutResponseDTO data = new LogoutResponseDTO();
        data.setSuccess(true);
        data.setMessage("登出成功");
        return ApiResponse.success(data);
    }

    private void cleanUpCaptcha(HttpSession session, String redisCaptchaKey) {
        try {
            redisTemplate.delete(redisCaptchaKey);
            session.removeAttribute(SESSION_CAPTCHA_KEY_ATTR);
            log.debug("已清理验证码 - Redis Key: {}, Session Attribute: {}", redisCaptchaKey, SESSION_CAPTCHA_KEY_ATTR);
        } catch (Exception e) {
            log.warn("清理验证码时发生异常", e);
        }
    }
}
