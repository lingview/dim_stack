

import { registerExtensionPoint, unregisterPluginExtensions } from './ExtensionPointRegistry'

const pluginRoutes = []

const loadedModules = new Map()

export function getPluginRoutes() {
    return pluginRoutes.map((r) => ({ path: r.path, element: r.element }))
}

export async function setupPluginRuntime() {
    await reloadPluginRuntime()
}

export async function reloadPluginRuntime() {
    const providers = await fetchProviders()
    if (providers === null) {
        return
    }
    const activeNames = new Set(providers.map((p) => p.name))

    for (const name of [...loadedModules.keys()]) {
        if (!activeNames.has(name)) {
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

    unregisterPluginExtensions(provider.name)
    if (provider.styleUrl) {
        loadStyle(provider.styleUrl)
    }

    const entryUrl = provider.version
        ? `${provider.entryUrl}?v=${encodeURIComponent(provider.version)}`
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

function loadStyle(url) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
}
