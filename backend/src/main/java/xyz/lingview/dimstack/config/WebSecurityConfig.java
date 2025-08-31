package xyz.lingview.dimstack.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//import xyz.lingview.dimstack.security.JwtRequestFilter;
import xyz.lingview.dimstack.interceptor.UserPermissionInterceptor;
import xyz.lingview.dimstack.security.SecurityFilter;
import xyz.lingview.dimstack.security.SessionAuthFilter;


@Configuration
public class WebSecurityConfig implements WebMvcConfigurer {

    @Autowired
    private SecurityFilter securityFilter;

//    @Autowired
//    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private SessionAuthFilter sessionAuthFilter;


//     注册 SecurityFilter

    @Bean
    public FilterRegistrationBean<SecurityFilter> securityFilterRegistration() {
        FilterRegistrationBean<SecurityFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(securityFilter);
        registration.addUrlPatterns("/*");
        registration.setOrder(1);
        return registration;
    }


////    注册 JwtRequestFilter
//    @Bean
//    public FilterRegistrationBean<JwtRequestFilter> jwtFilterRegistration() {
//        FilterRegistrationBean<JwtRequestFilter> registration = new FilterRegistrationBean<>();
//        registration.setFilter(jwtRequestFilter);
//        registration.addUrlPatterns("/api/*");
//        registration.setOrder(2);
//        return registration;
//    }


// 注册 SessionAuthFilter
    @Bean
    public FilterRegistrationBean<SessionAuthFilter> sessionAuthFilterRegistration() {
        FilterRegistrationBean<SessionAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(sessionAuthFilter);
        registration.addUrlPatterns("/api/*");
        registration.setOrder(2);
        return registration;
    }
    // @Override
    // public void addInterceptors(InterceptorRegistry registry) {
    //     registry.addInterceptor(securityFilter).addPathPatterns("/**");
    // }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/upload/**")
                .addResourceLocations("file:upload/");
    }

    // 注册权限拦截器
    @Autowired
    private UserPermissionInterceptor userPermissionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(userPermissionInterceptor)
                .addPathPatterns("/api/**");
    }
}