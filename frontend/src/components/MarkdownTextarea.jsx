import React, { forwardRef } from 'react';

const MarkdownTextarea = forwardRef(({
                                         content,
                                         onChange,
                                         onPaste,
                                         onDragOver,
                                         onDrop
                                     }, ref) => {
    return (
        <textarea
            ref={ref}
            value={content}
            onChange={onChange}
            onPaste={onPaste}
            onDragOver={onDragOver}
            onDrop={onDrop}
            placeholder="在此输入 Markdown 内容..."
            className="flex-1 p-4 focus:outline-none font-mono resize-none text-gray-900 bg-white"
            spellCheck={false}
        />
    );
});

MarkdownTextarea.displayName = 'MarkdownTextarea';

export default MarkdownTextarea;