package xyz.lingview.dimstack.plugin.api;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @Author: lingview
 * @Date: 2026/10/09 14:39:03
 * @Description: 插件接口权限注解
 * @Version: 1.0
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {

    String[] value();
    boolean all() default false;
}
