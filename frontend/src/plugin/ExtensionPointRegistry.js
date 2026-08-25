

const registry = new Map() 

export function registerExtensionPoint(name, fn, pluginId) {
    const id = `${pluginId}:${name}:${(registry.get(name) || []).length}`
    const list = registry.get(name) || []
    list.push({ id, fn })
    registry.set(name, list)
}

export function unregisterPluginExtensions(pluginId) {
    for (const [name, list] of registry) {
        const filtered = list.filter((item) => !item.id.startsWith(`${pluginId}:`))
        if (filtered.length === 0) {
            registry.delete(name)
        } else {
            registry.set(name, filtered)
        }
    }
}

export function getExtensionPoints(name) {
    return registry.get(name) || []
}

export function hasExtension(name, pluginId) {
    return (registry.get(name) || []).some((item) => item.id.startsWith(`${pluginId}:`))
}
