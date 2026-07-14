package xyz.lingview.dimstack.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import xyz.lingview.dimstack.dto.request.LoginDTO;
import xyz.lingview.dimstack.dto.response.LoginResponseDTO;

public interface LoginService {
    LoginResponseDTO login(LoginDTO loginDTO, HttpServletRequest request);
    void logout(HttpSession session);
}