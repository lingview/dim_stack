

const registry = new Map()
const listeners = new Set()

function notifyChanged() {
    for (const listener of [...listeners]) {
        try {
            listener()
        } catch (e) {
            console.error('[plugin] 扩展点订阅回调异常:', e)
        }
    }
}

export function subscribeExtensionPoints(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export function registerExtensionPoint(name, fn, pluginId) {
    const id = `${pluginId}:${name}:${(registry.get(name) || []).length}`
    const list = [...(registry.get(name) || []), { id, fn }]
    registry.set(name, list)
    notifyChanged()
}

export function unregisterPluginExtensions(pluginId) {
    let changed = false
    for (const [name, list] of registry) {
        const filtered = list.filter((item) => !item.id.startsWith(`${pluginId}:`))
        if (filtered.length !== list.length) {
            changed = true
        }
        if (filtered.length === 0) {
            registry.delete(name)
        } else {
            registry.set(name, filtered)
        }
    }
    if (changed) {
        notifyChanged()
    }
}

export function getExtensionPoints(name) {
    return registry.get(name) || []
}

export function hasExtension(name, pluginId) {
    return (registry.get(name) || []).some((item) => item.id.startsWith(`${pluginId}:`))
}
