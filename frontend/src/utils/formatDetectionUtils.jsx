export const detectTextFormats = (text) => {
    const formats = {
        bold: false,
        italic: false,
        code: false,
        link: false,
        heading: null,
        list: false
    };

    const boldRegex1 = /^\*\*(.*?)\*\*$/;
    const boldRegex2 = /^__(.*?)__$/;
    formats.bold = boldRegex1.test(text) || boldRegex2.test(text);

    const italicRegex1 = /^\*(.*?)\*$/;
    const italicRegex2 = /^_(.*?)_$/;
    formats.italic = italicRegex1.test(text) || italicRegex2.test(text);

    const codeRegex = /^`(.*?)`$/;
    formats.code = codeRegex.test(text);

    const linkRegex = /^\[(.*?)\]\(.*?\)$/;
    formats.link = linkRegex.test(text);

    const headingRegex = /^(#{1,6})\s+(.+)$/;
    const headingMatch = text.match(headingRegex);
    if (headingMatch) {
        formats.heading = headingMatch[1].length;
    }

    const listRegex = /^(\s*[-*+]\s+|\s*\d+\.\s+)/;
    formats.list = listRegex.test(text);

    return formats;
};


export const detectContextFormats = (fullContent, start) => {
    const context = {
        inCodeBlock: false,
        inQuote: false,
        inList: false,
        currentHeadingLevel: null
    };

    const lines = fullContent.substring(0, start).split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex] || '';

    let codeBlockCount = 0;
    const contentBefore = fullContent.substring(0, start);
    const codeBlockMatches = contentBefore.match(/```/g);
    if (codeBlockMatches) {
        codeBlockCount = codeBlockMatches.length;
    }
    context.inCodeBlock = codeBlockCount % 2 === 1;

    context.inQuote = currentLine.trim().startsWith('>');

    context.inList = /^(\s*[-*+]\s+|\s*\d+\.\s+)/.test(currentLine.trim());

    const headingMatch = currentLine.match(/^(#{1,6})\s+/);
    if (headingMatch) {
        context.currentHeadingLevel = headingMatch[1].length;
    }

    return context;
};


export const areFormatsMutuallyExclusive = (format1, format2) => {
    if ((format1 === 'heading' || format2 === 'heading') && 
        (format1 !== 'heading' || format2 !== 'heading')) {
        return true;
    }

    if ((format1 === 'list' || format2 === 'list') && 
        (format1 === 'heading' || format2 === 'heading')) {
        return true;
    }

    return false;
};


export const determineFormatAction = (currentFormats, newFormat, headingLevel = null) => {
    const action = {
        type: 'apply',
        formatToRemove: null,
        formatToAdd: newFormat
    };

    if (newFormat === 'heading') {
        if (currentFormats.heading) {
            if (headingLevel && currentFormats.heading !== headingLevel) {
                action.type = 'replace';
                action.formatToRemove = 'heading';
            } else {
                action.type = 'remove';
                action.formatToRemove = 'heading';
            }
        }
        return action;
    }

    if (currentFormats[newFormat]) {
        action.type = 'remove';
        action.formatToRemove = newFormat;
    } else {
        Object.keys(currentFormats).forEach(existingFormat => {
            if (existingFormat !== newFormat && 
                currentFormats[existingFormat] && 
                areFormatsMutuallyExclusive(existingFormat, newFormat)) {
                action.type = 'replace';
                action.formatToRemove = existingFormat;
            }
        });
    }

    return action;
};