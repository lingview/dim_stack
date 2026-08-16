import { Fragment } from 'react'
import { getExtensionPoints } from '../plugin/ExtensionPointRegistry'

export function ExtensionSlot({ name, pluginName, ...props }) {
    const items = getExtensionPoints(name)
    const visible = pluginName
        ? items.filter((item) => item.id.startsWith(`${pluginName}:`))
        : items
    if (visible.length === 0) {
        return null
    }
    return (
        <Fragment>
            {visible.map((item, index) => (
                <Fragment key={item.id || index}>{item.fn(props)}</Fragment>
            ))}
        </Fragment>
    )
}
