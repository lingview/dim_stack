import { Fragment, useEffect, useState } from 'react'
import { getExtensionPoints, subscribeExtensionPoints } from '../plugin/ExtensionPointRegistry'

export function ExtensionSlot({ name, pluginName, ...props }) {
    const [items, setItems] = useState(() => getExtensionPoints(name))

    useEffect(() => {
        const read = () => setItems([...getExtensionPoints(name)])
        read()
        return subscribeExtensionPoints(read)
    }, [name])

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
