package xyz.lingview.dimstack.plugin.api;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 扩展点获取接口
 * @Version: 1.0
 */
public interface ExtensionGetter {

    <T extends ExtensionPoint> List<T> getExtensions(Class<T> type);
}
