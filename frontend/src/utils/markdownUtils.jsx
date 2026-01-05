export const preprocessMarkdown = (text) => {
    if (!text) return '';

    const codeBlockRegex = /(```[\s\S]*?```|`[^`\n]+`)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const normalText = text.substring(lastIndex, match.index);
            parts.push({ type: 'text', content: normalText });
        }

        parts.push({ type: 'code', content: match[0] });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        const normalText = text.substring(lastIndex);
        parts.push({ type: 'text', content: normalText });
    }

    return parts.map(part => {
        if (part.type === 'text') {
            let result = part.content.replace(/\n{3,}/g, (match) => {
                const extraLines = match.length - 2;
                return '\n\n' + '<br>\n\n'.repeat(extraLines);
            });
            result = result.replace(/([^\n])\n(?!\n)/g, '$1  \n');
            return result;
        }
        return part.content;
    }).join('');
};

export const isSafeUrl = (url) => url && (url.startsWith('http://') || url.startsWith('https://'));
