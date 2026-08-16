

import { registerExtensionPoint, unregisterPluginExtensions } from './ExtensionPointRegistry'

export async function setupPluginRuntime() {
    let providers = []
    try {
        const response = await fetch('/api/ui-plugins/providers')
        const body = await response.json()
        providers = body.data || []
    } catch (e) {
        console.error('[plugin] 获取插件 UI providers 失败:', e)
        return
    }

    for (const provider of providers) {
        try {
            if (provider.manifest?.format !== 'esm') {
                continue
            }
            if (provider.styleUrl) {
                loadStyle(provider.styleUrl)
            }
            const mod = await import( provider.entryUrl)
            const pluginModule = mod.default
            if (!pluginModule || typeof pluginModule.setup !== 'function') {
                throw new Error('插件模块缺少 setup() 方法')
            }
            const context = createPluginContext(provider)
            await pluginModule.setup(context)
            console.info(`[plugin] ${provider.name}@${provider.version} 前端模块加载成功`)
        } catch (e) {
            console.error(`[plugin] ${provider.name} 前端模块加载失败:`, e)
            unregisterPluginExtensions(provider.name)
        }
    }
}

function createPluginContext(provider) {
    return {
        pluginName: provider.name,
        pluginVersion: provider.version,

        registerExtensionPoint: (name, fn) => registerExtensionPoint(name, fn, provider.name),

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
