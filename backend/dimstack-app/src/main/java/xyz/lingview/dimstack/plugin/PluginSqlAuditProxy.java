package xyz.lingview.dimstack.plugin;

import javax.sql.DataSource;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

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
                    if (isUnwrap(method, args)) {
                        return wrapUnwrapped(invoke(delegate, method, args), null, pluginId, auditor);
                    }
                    Object result = invoke(delegate, method, args);
                    return result instanceof Connection connection
                            ? wrapConnection(connection, pluginId, auditor) : result;
                });
    }

    private static Connection wrapConnection(Connection connection, String pluginId, PluginSqlAuditor auditor) {
        return (Connection) Proxy.newProxyInstance(PluginSqlAuditProxy.class.getClassLoader(),
                new Class<?>[]{Connection.class}, (proxy, method, args) -> {
                    if (isUnwrap(method, args)) {
                        return wrapUnwrapped(invoke(connection, method, args), null, pluginId, auditor);
                    }
                    Object result = invoke(connection, method, args);
                    if (result instanceof Statement statement) {
                        String sql = args != null && args.length > 0 && args[0] instanceof String s ? s : null;
                        return wrapStatement(statement, sql, pluginId, auditor);
                    }
                    if ("getMetaData".equals(method.getName()) && result instanceof DatabaseMetaData metaData) {
                        return wrapMetaData(metaData, pluginId, auditor);
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
        List<String> batchSql = preparedSql == null ? new ArrayList<>() : null;
        return (Statement) Proxy.newProxyInstance(PluginSqlAuditProxy.class.getClassLoader(), interfaces,
                (proxy, method, args) -> {
                    String name = method.getName();
                    if (isUnwrap(method, args)) {
                        return wrapUnwrapped(invoke(statement, method, args), preparedSql, pluginId, auditor);
                    }
                    if ("getConnection".equals(name)) {
                        Object connection = invoke(statement, method, args);
                        return connection instanceof Connection conn ? wrapConnection(conn, pluginId, auditor) : connection;
                    }
                    if (batchSql != null && "addBatch".equals(name) && args != null && args.length == 1
                            && args[0] instanceof String sql) {
                        batchSql.add(sql);
                    } else if (batchSql != null && "clearBatch".equals(name)) {
                        batchSql.clear();
                    }
                    long start = System.nanoTime();
                    Object result = invoke(statement, method, args);
                    if (name.startsWith("execute")) {
                        long cost = (System.nanoTime() - start) / 1_000_000;
                        boolean batchFlush = "executeBatch".equals(name) || "executeLargeBatch".equals(name);
                        if (batchFlush && batchSql != null && !batchSql.isEmpty()) {
                            long per = cost / batchSql.size();
                            for (String sql : batchSql) {
                                auditor.record(pluginId, sql, per);
                            }
                            batchSql.clear();
                        } else {
                            String sql = preparedSql;
                            if (sql == null && args != null && args.length > 0 && args[0] instanceof String direct) {
                                sql = direct;
                            }
                            auditor.record(pluginId, sql, cost);
                        }
                    }
                    return result;
                });
    }

    private static DatabaseMetaData wrapMetaData(DatabaseMetaData metaData, String pluginId, PluginSqlAuditor auditor) {
        return (DatabaseMetaData) Proxy.newProxyInstance(PluginSqlAuditProxy.class.getClassLoader(),
                new Class<?>[]{DatabaseMetaData.class}, (proxy, method, args) -> {
                    if ("getConnection".equals(method.getName())) {
                        Object connection = invoke(metaData, method, args);
                        return connection instanceof Connection conn ? wrapConnection(conn, pluginId, auditor) : connection;
                    }
                    return invoke(metaData, method, args);
                });
    }

    private static Object wrapUnwrapped(Object unwrapped, String preparedSql, String pluginId, PluginSqlAuditor auditor) {
        if (unwrapped instanceof DataSource dataSource) {
            return wrap(dataSource, pluginId, auditor);
        }
        if (unwrapped instanceof Connection connection) {
            return wrapConnection(connection, pluginId, auditor);
        }
        if (unwrapped instanceof Statement statement) {
            return wrapStatement(statement, preparedSql, pluginId, auditor);
        }
        if (unwrapped instanceof DatabaseMetaData metaData) {
            return wrapMetaData(metaData, pluginId, auditor);
        }
        return unwrapped;
    }

    private static boolean isUnwrap(Method method, Object[] args) {
        return "unwrap".equals(method.getName()) && args != null && args.length == 1 && args[0] instanceof Class<?>;
    }

    private static Object invoke(Object target, Method method, Object[] args) throws Throwable {
        try {
            return method.invoke(target, args);
        } catch (InvocationTargetException e) {
            throw e.getTargetException();
        }
    }
}
