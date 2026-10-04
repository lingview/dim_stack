package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.domain.PluginSqlAudit;
import xyz.lingview.dimstack.mapper.PluginSqlAuditMapper;

import java.util.List;
import java.util.regex.Pattern;

/**
 * @Author: lingview
 * @Date: 2026/10/01 22:13:07
 * @Description: 插件SQL审计
 * @Version: 1.0
 */
@Slf4j
@Component
public class PluginSqlAuditor {

    private static final int MAX_SQL_LENGTH = 2000;
    private static final long SLOW_MILLIS = 3000;

    private static final Pattern DDL = Pattern.compile("^(CREATE|ALTER|DROP|TRUNCATE|RENAME)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern WRITE = Pattern.compile("^(INSERT|UPDATE|DELETE|REPLACE|MERGE)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern CTE_WRITE = Pattern.compile("\\b(UPDATE|DELETE|INSERT|REPLACE|MERGE)\\b", Pattern.CASE_INSENSITIVE);

    private static final List<Pattern> CORE_TABLES = List.of(
            "article", "article_categories", "article_tag", "article_tag_relation", "article_like",
            "comment", "comment_like", "user_information", "user_role", "role", "role_permission",
            "permission", "api_key", "site_config", "attachment", "dashboard_menu", "menus",
            "storage_method", "llm_config", "systematic_notification", "plugin", "plugin_config"
    ).stream().map(t -> Pattern.compile("\\b" + t + "\\b", Pattern.CASE_INSENSITIVE)).toList();

    private final PluginSqlAuditMapper auditMapper;

    public PluginSqlAuditor(PluginSqlAuditMapper auditMapper) {
        this.auditMapper = auditMapper;
    }

    public void record(String pluginId, String sql, long costMillis) {
        String category = classify(sql, costMillis);
        if (category == null) {
            return;
        }
        String text = sql == null ? "" : sql.trim();
        if (text.length() > MAX_SQL_LENGTH) {
            text = text.substring(0, MAX_SQL_LENGTH);
        }
        try {
            PluginSqlAudit audit = new PluginSqlAudit();
            audit.setPlugin_name(pluginId);
            audit.setCategory(category);
            audit.setSql_text(text);
            audit.setCost_millis(costMillis);
            auditMapper.insert(audit);
        } catch (Exception e) {
            log.warn("插件SQL审计写入失败: plugin={}, category={}", pluginId, category, e);
        }
        if ("core_write".equals(category)) {
            log.warn("[插件审计] 插件修改宿主核心表: plugin={} 耗时={}ms SQL={}", pluginId, costMillis, text);
        } else if ("slow".equals(category)) {
            log.warn("[插件审计] 插件慢SQL: plugin={} 耗时={}ms SQL={}", pluginId, costMillis, text);
        } else {
            log.info("[插件审计] 插件DDL: plugin={} SQL={}", pluginId, text);
        }
    }

    private String classify(String sql, long costMillis) {
        if (sql == null || sql.isBlank()) {
            return null;
        }
        String statement = stripLeadingComments(sql);
        if (DDL.matcher(statement).find()) {
            return "ddl";
        }
        boolean writeStatement = WRITE.matcher(statement).find()
                || statement.regionMatches(true, 0, "WITH", 0, 4) && CTE_WRITE.matcher(statement).find();
        if (writeStatement) {
            for (Pattern table : CORE_TABLES) {
                if (table.matcher(statement).find()) {
                    return "core_write";
                }
            }
        }
        return costMillis >= SLOW_MILLIS ? "slow" : null;
    }

    private String stripLeadingComments(String sql) {
        String s = sql.strip();
        while (true) {
            if (s.startsWith("--") || s.startsWith("#")) {
                int end = s.indexOf('\n');
                if (end < 0) {
                    return "";
                }
                s = s.substring(end + 1).strip();
                continue;
            }
            if (s.startsWith("/*")) {
                int end = s.indexOf("*/");
                if (end < 0) {
                    return "";
                }
                s = s.substring(end + 2).strip();
                continue;
            }
            return s;
        }
    }
}
