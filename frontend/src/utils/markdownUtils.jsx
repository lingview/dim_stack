import { getConfig } from './config';

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

// 检测md编辑器中的外部媒体资源
export const detectExternalMedia = (content) => {
    if (!content) return [];

    const externalResources = [];
    const config = getConfig();

    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
        const url = match[2];
        if (isSafeUrl(url) && !config.isSameOrigin(url)) {
            externalResources.push({
                type: 'image',
                alt: match[1],
                url: url,
                markdown: match[0],
                startIndex: match.index,
                endIndex: match.index + match[0].length
            });
        }
    }

    const videoRegex = /<video[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = videoRegex.exec(content)) !== null) {
        const url = match[1];
        if (isSafeUrl(url) && !config.isSameOrigin(url)) {
            externalResources.push({
                type: 'video',
                url: url,
                markdown: match[0],
                startIndex: match.index,
                endIndex: match.index + match[0].length
            });
        }
    }

    const audioRegex = /<audio[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = audioRegex.exec(content)) !== null) {
        const url = match[1];
        if (isSafeUrl(url) && !config.isSameOrigin(url)) {
            externalResources.push({
                type: 'audio',
                url: url,
                markdown: match[0],
                startIndex: match.index,
                endIndex: match.index + match[0].length
            });
        }
    }

    return externalResources;
};

export const generateMediaMarkdown = (type, filename, url, alt = '') => {
    switch(type) {
        case 'image':
            return `![${alt || filename}](${url})`;
        case 'video':
            return `<video src="${url}" controls style="width: 400px;"></video>`;
        case 'audio':
            return `<audio src="${url}?filename=${encodeURIComponent(filename)}" controls preload="metadata" data-filename="${filename}"></audio>`;
        default:
            return '';
    }
};
