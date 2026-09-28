

import { registerExtensionPoint, unregisterPluginExtensions } from './ExtensionPointRegistry'

const pluginRoutes = []
// entryUrl带内容指纹, 同版本重新打包也能强制加载新代码
const loadedModules = new Map()

const teardowns = new Map()

const routeSubscribers = new Set()
// 并发reload复用同一Promise, 避免清理与装载交错
let inFlightReload = null

export function getPluginRoutes() {
    return pluginRoutes.map((r) => ({ path: r.path, element: r.element }))
}

export function subscribePluginRoutes(listener) {
    routeSubscribers.add(listener)
    return () => routeSubscribers.delete(listener)
}

function notifyRoutesChanged() {
    if (routeSubscribers.size === 0) {
        return
    }
    const routes = getPluginRoutes()
    for (const listener of routeSubscribers) {
        try {
            listener(routes)
        } catch (e) {
            console.error('[plugin] 路由订阅回调异常:', e)
        }
    }
}

function runTeardowns(name) {
    const callbacks = teardowns.get(name)
    if (!callbacks) {
        return
    }
    teardowns.delete(name)
    for (const fn of callbacks) {
        try {
            fn()
        } catch (e) {
            console.error(`[plugin] ${name} teardown 回调异常:`, e)
        }
    }
}

export async function setupPluginRuntime() {
    await reloadPluginRuntime()
}

export function reloadPluginRuntime() {
    if (!inFlightReload) {
        inFlightReload = doReload().finally(() => {
            inFlightReload = null
        })
    }
    return inFlightReload
}

async function doReload() {
    const providers = await fetchProviders()
    if (providers === null) {
        return
    }
    const activeNames = new Set(providers.map((p) => p.name))

    for (const name of [...loadedModules.keys()]) {
        if (!activeNames.has(name)) {
            runTeardowns(name)
            unregisterPluginExtensions(name)
            loadedModules.delete(name)
        }
    }
    for (let i = pluginRoutes.length - 1; i >= 0; i--) {
        if (!activeNames.has(pluginRoutes[i].pluginName)) {
            pluginRoutes.splice(i, 1)
        }
    }

    for (const provider of providers) {
        try {
            await loadProvider(provider)
        } catch (e) {
            console.error(`[plugin] ${provider.name} 前端模块加载失败:`, e)
            unregisterPluginExtensions(provider.name)
        }
    }

    notifyRoutesChanged()
}

async function fetchProviders() {
    try {
        const response = await fetch('/api/ui-plugins/providers')
        const body = await response.json()
        return body.data || []
    } catch (e) {
        console.error('[plugin] 获取插件 UI providers 失败:', e)
        return null
    }
}

async function loadProvider(provider) {
    if (provider.manifest?.format !== 'esm') {
        return
    }

    runTeardowns(provider.name)
    unregisterPluginExtensions(provider.name)
    if (provider.styleUrl) {
        loadStyle(provider.styleUrl)
    }

    const cacheKey = provider.assetHash || provider.version
    const entryUrl = cacheKey
        ? `${provider.entryUrl}?v=${encodeURIComponent(cacheKey)}`
        : provider.entryUrl
    let cached = loadedModules.get(provider.name)
    if (!cached || cached.entryUrl !== entryUrl) {
        const module = await import( entryUrl)
        cached = { module, entryUrl }
        loadedModules.set(provider.name, cached)
    }
    const pluginModule = cached.module.default
    if (!pluginModule || typeof pluginModule.setup !== 'function') {
        throw new Error('插件模块缺少 setup() 方法')
    }
    const context = createPluginContext(provider)
    await pluginModule.setup(context)
    console.info(`[plugin] ${provider.name}@${provider.version} 前端模块加载成功`)
}

function createPluginContext(provider) {
    return {
        pluginName: provider.name,
        pluginVersion: provider.version,

        registerExtensionPoint: (name, fn) => registerExtensionPoint(name, fn, provider.name),

        registerRoute: (route) => {
            if (route && route.path && route.element) {
                const index = pluginRoutes.findIndex(
                    (r) => r.pluginName === provider.name && r.path === route.path)
                if (index >= 0) {
                    pluginRoutes[index] = { pluginName: provider.name, ...route }
                } else {
                    pluginRoutes.push({ pluginName: provider.name, ...route })
                }
            }
        },

        onTeardown: (fn) => {
            if (typeof fn !== 'function') {
                return
            }
            const callbacks = teardowns.get(provider.name) || []
            callbacks.push(fn)
            teardowns.set(provider.name, callbacks)
        },

        fetchConfig: async () => {
            const response = await fetch(`/api/plugins/${provider.name}/config`)
            const body = await response.json()
            if (body.code !== 200) throw new Error(body.message || '读取配置失败')
            return body.data || {}
        },
        saveConfig: async (config) => {
            const response = await fetch(`/api/plugins/${provider.name}/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            })
            const body = await response.json()
            if (body.code !== 200) throw new Error(body.message || '保存配置失败')
            return body
        },
    }
}

const loadedStyles = new Set()

function loadStyle(url) {
    if (loadedStyles.has(url)) {
        return
    }
    loadedStyles.add(url)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
}
