package xyz.example.hello;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/plugins/hello")
public class HelloController {

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        return Map.of("message", "hello from hello");
    }
}
