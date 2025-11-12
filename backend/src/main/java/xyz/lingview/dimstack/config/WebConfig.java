package xyz.lingview.dimstack.config;

import org.springframework.web.client.RestTemplate;
import xyz.lingview.dimstack.interceptor.ThemeResourceFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import xyz.lingview.dimstack.interceptor.UserPermissionInterceptor;
import xyz.lingview.dimstack.security.SessionAuthFilter;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private SessionAuthFilter sessionAuthFilter;

//    @Autowired
//    private ThemeProperties themeProperties;

    @Autowired
    private ThemeResourceFilter themeResourceFilter;

    // 注册 SessionAuthFilter
    @Bean
    public FilterRegistrationBean<SessionAuthFilter> sessionAuthFilterRegistration() {
        FilterRegistrationBean<SessionAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(sessionAuthFilter);
        registration.addUrlPatterns("/api/*");
        registration.setOrder(2);
        return registration;
    }

    // 注册主题资源过滤器
    @Bean
    public FilterRegistrationBean<ThemeResourceFilter> themeResourceFilterRegistration() {
        FilterRegistrationBean<ThemeResourceFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(themeResourceFilter);
        registration.addUrlPatterns("/*");
        registration.setOrder(0);
        return registration;
    }

//    @Override
//    public void addResourceHandlers(ResourceHandlerRegistry registry) {
//        registry.addResourceHandler("/upload/**")
//                .addResourceLocations("file:upload/");
//    }

    // 注册权限拦截器
    @Autowired
    private UserPermissionInterceptor userPermissionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(userPermissionInterceptor)
                .addPathPatterns("/api/**");
    }


    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
