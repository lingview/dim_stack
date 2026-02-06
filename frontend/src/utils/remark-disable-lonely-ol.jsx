export default function remarkDisableLonelyOrderedList() {
    return (tree) => {
        if (!tree.children) return;

        const newChildren = [];

        for (let i = 0; i < tree.children.length; i++) {
            const node = tree.children[i];

            if (
                node.type === 'list' &&
                node.ordered &&
                node.children?.length === 1
            ) {
                const item = node.children[0];

                if (
                    item.children?.length === 1 &&
                    item.children[0].type === 'paragraph'
                ) {
                    const text = item.children[0].children
                        ?.map((c) => c.value || '')
                        .join('');

                    if (/^\s*\d+\.\s*$/.test(text)) {
                        newChildren.push({
                            type: 'paragraph',
                            children: [
                                {
                                    type: 'text',
                                    value: text,
                                },
                            ],
                        });
                        continue;
                    }
                }
            }

            newChildren.push(node);
        }

        tree.children = newChildren;
    };
}
