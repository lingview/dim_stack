package xyz.lingview.dimstack.controller.api.v1;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.dto.request.ForgotPasswordDTO;
import xyz.lingview.dimstack.dto.response.ForgotPasswordResponseDTO;
import xyz.lingview.dimstack.service.ForgotPasswordService;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.util.SiteConfigUtil;

import java.util.HashMap;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/01/13 18:59:30
 * @Description: 密码找回控制器
 * @Version: 2.2
 */
@Slf4j
@RestController
@RequestMapping("/api")
public class ForgotPasswordController {

    @Autowired
    private ForgotPasswordService forgotPasswordService;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    /**
     * 发送忘记密码验证码到邮箱
     */
    @PostMapping("/forgot-password/send-captcha")
    public ApiResponse<Map<String, Object>> sendForgotPasswordCaptcha(
            @RequestBody ForgotPasswordDTO request,
            HttpSession session,
            HttpServletRequest httpRequest) {

        try {
            return forgotPasswordService.sendForgotPasswordCaptcha(request, session, httpRequest);
        } catch (Exception e) {
            log.error("发送忘记密码验证码时发生异常", e);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "发送验证码失败，请稍后再试");
            return ApiResponse.error(500, "发送验证码失败，请稍后再试");
        }
    }

    /**
     * 验证验证码
     */
    @PostMapping("/forgot-password/verify")
    public ApiResponse<ForgotPasswordResponseDTO> verifyForgotPassword(
            @RequestBody ForgotPasswordDTO request,
            HttpSession session,
            HttpServletRequest httpRequest) {
        try {
            return forgotPasswordService.verifyForgotPassword(request, session, httpRequest);
        } catch (Exception e) {
            log.error("验证验证码时发生异常", e);
            return ApiResponse.error(500, "验证失败，请稍后再试");
        }
    }

    // 重置密码
    @PostMapping("/forgot-password/reset")
    public ApiResponse<ForgotPasswordResponseDTO> resetPassword(
            @RequestBody ForgotPasswordDTO request,
            HttpSession session,
            HttpServletRequest httpRequest) {
        try {
            return forgotPasswordService.resetPassword(request, session, httpRequest);
        } catch (Exception e) {
            log.error("重置密码时发生异常", e);
            return ApiResponse.error(500, "密码重置失败，请稍后再试");
        }
    }
}
