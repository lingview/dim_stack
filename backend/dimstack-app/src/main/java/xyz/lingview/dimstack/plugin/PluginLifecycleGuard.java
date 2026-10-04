package xyz.lingview.dimstack.plugin;

import org.springframework.stereotype.Component;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Supplier;

/**
 * @Author: lingview
 * @Date: 2026/10/04 09:41:22
 * @Description: 插件生命周期并发屏障
 * @Version: 1.0
 */
@Component
public class PluginLifecycleGuard {

    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    /** 生命周期变更(安装/启停/重载/升级/卸载)全局串行: pf4j 内部结构非线程安全 */
    public <T> T withWriteLock(Supplier<T> action) {
        Lock write = lock.writeLock();
        write.lock();
        try {
            return action.get();
        } finally {
            write.unlock();
        }
    }

    public void withWriteLock(Runnable action) {
        withWriteLock(() -> {
            action.run();
            return null;
        });
    }

    /** 读取扩展等只读操作: 与生命周期变更互斥, 避免拿到已关闭容器里的 bean */
    public <T> T withReadLock(Supplier<T> action) {
        Lock read = lock.readLock();
        read.lock();
        try {
            return action.get();
        } finally {
            read.unlock();
        }
    }
}
