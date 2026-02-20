// 升级SpringBoot4.x所以将该配置改到webconfig因为4.x弃用了ErrorController
//
//package xyz.lingview.dimstack.controller;
//
//import jakarta.servlet.RequestDispatcher;
//import jakarta.servlet.http.HttpServletRequest;
//import org.springframework.boot.web.servlet.error.ErrorController;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.RequestMapping;
//
///**
// * @Author: lingview
// * @Date: 2025/12/09 23:43:53
// * @Description: 全局错误处理
// * @Version: 1.0
// */
//@Controller
//public class CustomErrorController implements ErrorController {
//
//    @RequestMapping("/error")
//    public String handleError(HttpServletRequest request) {
//        Integer statusCode = (Integer) request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
//
//        if (statusCode != null && statusCode == 404) {
//            return "forward:/index.html";
//        }
//
//        return "forward:/index.html";
//    }
//}
