package xyz.lingview.dimstack.plugin;

import javax.sql.DataSource;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Statement;

/**
 * @Author: lingview
 * @Date: 2026/10/02 11:44:29
 * @Description: 插件SQL审计代理
 * @Version: 1.0
 */
final class PluginSqlAuditProxy {

    private PluginSqlAuditProxy() {
    }

    static DataSource wrap(DataSource delegate, String pluginId, PluginSqlAuditor auditor) {
        return (DataSource) Proxy.newProxyInstance(PluginSqlAuditProxy.class.getClassLoader(),
                new Class<?>[]{DataSource.class}, (proxy, method, args) -> {
                    Object result = invoke(delegate, method, args);
                    if (result instanceof Connection connection) {
                        return wrapConnection(connection, pluginId, auditor);
                    }
                    return result;
                });
    }

    private static Connection wrapConnection(Connection connection, String pluginId, PluginSqlAuditor auditor) {
        return (Connection) Proxy.newProxyInstance(PluginSqlAuditProxy.class.getClassLoader(),
                new Class<?>[]{Connection.class}, (proxy, method, args) -> {
                    Object result = invoke(connection, method, args);
                    if (result instanceof Statement statement && args != null && args.length > 0
                            && args[0] instanceof String sql) {
                        return wrapStatement(statement, sql, pluginId, auditor);
                    }
                    if (result instanceof Statement statement) {
                        return wrapStatement(statement, null, pluginId, auditor);
                    }
                    return result;
                });
    }

    private static Statement wrapStatement(Statement statement, String preparedSql,
                                          String pluginId, PluginSqlAuditor auditor) {
        Class<?>[] interfaces;
        if (statement instanceof CallableStatement) {
            interfaces = new Class<?>[]{CallableStatement.class};
        } else if (statement instanceof PreparedStatement) {
            interfaces = new Class<?>[]{PreparedStatement.class};
        } else {
            interfaces = new Class<?>[]{Statement.class};
        }
        return (Statement) Proxy.newProxyInstance(PluginSqlAuditProxy.class.getClassLoader(), interfaces,
                (proxy, method, args) -> {
                    long start = System.nanoTime();
                    Object result = invoke(statement, method, args);
                    if (method.getName().startsWith("execute")) {
                        long cost = (System.nanoTime() - start) / 1_000_000;
                        String sql = preparedSql;
                        if (sql == null && args != null && args.length > 0 && args[0] instanceof String direct) {
                            sql = direct;
                        }
                        auditor.record(pluginId, sql, cost);
                    }
                    return result;
                });
    }

    private static Object invoke(Object target, Method method, Object[] args) throws Throwable {
        try {
            return method.invoke(target, args);
        } catch (InvocationTargetException e) {
            throw e.getTargetException();
        }
    }
}
