package xyz.example.hello;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.plugin.api.RequiresPermission;

import java.util.Map;

@RestController
@RequestMapping("/api/plugins/hello")
public class HelloController {

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        return Map.of("message", "hello from hello");
    }

    @GetMapping("/admin/ping")
    @RequiresPermission("plugin:hello:manage")
    public Map<String, Object> adminPing() {
        return Map.of("message", "pong from hello");
    }
}
