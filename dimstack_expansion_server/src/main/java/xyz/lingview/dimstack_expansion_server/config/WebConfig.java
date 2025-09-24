package xyz.lingview.dimstack_expansion_server.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import xyz.lingview.dimstack_expansion_server.interceptor.UserPermissionInterceptor;
import xyz.lingview.dimstack_expansion_server.security.SessionAuthFilter;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private SessionAuthFilter sessionAuthFilter;


    // 注册 SessionAuthFilter
    @Bean
    public FilterRegistrationBean<SessionAuthFilter> sessionAuthFilterRegistration() {
        FilterRegistrationBean<SessionAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(sessionAuthFilter);
        registration.addUrlPatterns("/api/*");
        registration.setOrder(2);
        return registration;
    }

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


    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
