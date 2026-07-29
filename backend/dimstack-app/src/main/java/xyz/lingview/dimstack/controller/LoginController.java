package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.dto.request.LoginDTO;
import xyz.lingview.dimstack.dto.response.LoginResponseDTO;
import xyz.lingview.dimstack.dto.response.LogoutResponseDTO;
import xyz.lingview.dimstack.service.LoginService;
import xyz.lingview.dimstack.common.ApiResponse;

/**
 * @Auther: lingview
 * @Date: 2025/08/26 22:57:54
 * @Description: 用户登录控制器
 */
@Slf4j
@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private LoginService loginService;

    /**
     * 用户登录接口
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponseDTO> login(
            @RequestBody LoginDTO loginDTO,
            HttpServletRequest request) {

        try {
            LoginResponseDTO result = loginService.login(loginDTO, request);
            if (result.isSuccess()) {
                return ApiResponse.success(result);
            } else {
                return ApiResponse.error(result.getCode(), result.getMessage());
            }
        } catch (Exception e) {
            log.error("登录过程发生未知错误", e);
            return ApiResponse.error(500, "登录失败，请稍后再试");
        }
    }

    /**
     * 用户登出接口
     */
    @PostMapping("/logout")
    public ApiResponse<LogoutResponseDTO> logout(HttpSession session) {
        loginService.logout(session);

        var data = new LogoutResponseDTO();
        data.setSuccess(true);
        data.setMessage("登出成功");
        return ApiResponse.success(data);
    }
}