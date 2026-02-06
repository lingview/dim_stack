export const preprocessMarkdown = (text) => {
    if (!text) return '';

    const codeBlockRegex = /(```[\s\S]*?```|`[^`\n]+`)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex, match.index),
            });
        }

        parts.push({
            type: 'code',
            content: match[0],
        });

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.slice(lastIndex),
        });
    }

    return parts
        .map((part) => {
            if (part.type === 'code') {
                return part.content;
            }

            let result = part.content;

            result = result.replace(/\n{3,}/g, (match) => {
                const extra = match.length - 2;
                return '\n\n' + '<br>\n\n'.repeat(extra);
            });

            result = result.replace(/([^\n])\n(?!\n)/g, '$1  \n');

            result = result.replace(
                /^(\s*)(\d+)\.(\s*)$/gm,
                (_, space, num, tail) => `${space}${num}.\u200B${tail}`
            );

            return result;
        })
        .join('');
};

export const isSafeUrl = (url) =>
    typeof url === 'string' &&
    (url.startsWith('http://') || url.startsWith('https://'));
