package xyz.example.hello;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.plugin.api.PluginDb;

import java.util.Map;

@RestController
@RequestMapping("/api/plugins/hello")
public class NoteController {

    private final PluginDb pluginDb;
    private final JdbcTemplate jdbc;

    public NoteController(PluginDb pluginDb, JdbcTemplate jdbc) {
        this.pluginDb = pluginDb;
        this.jdbc = jdbc;
    }

    @GetMapping("/notes/count")
    public Map<String, Object> count() {
        String table = pluginDb.table("notes");
        jdbc.execute("CREATE TABLE IF NOT EXISTS " + table
                + " (id INT PRIMARY KEY AUTO_INCREMENT, content VARCHAR(255))");
        return Map.of("table", table, "rows", jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class));
    }
}
