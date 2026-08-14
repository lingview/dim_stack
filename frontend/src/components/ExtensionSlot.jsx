import { Fragment } from 'react'
import { getExtensionPoints } from '../plugin/ExtensionPointRegistry'

export function ExtensionSlot({ name, ...props }) {
    const items = getExtensionPoints(name)
    if (items.length === 0) {
        return null
    }
    return (
        <Fragment>
            {items.map((item, index) => (
                <Fragment key={item.id || index}>{item.fn(props)}</Fragment>
            ))}
        </Fragment>
    )
}
