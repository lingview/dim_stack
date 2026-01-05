import React, { useRef, useEffect } from 'react';
import {
    Bold, Italic, Heading, Link as LinkIcon,
    Image, List, Code, Video, Music, FileText
} from 'lucide-react';

const TOOLBAR_BUTTONS = [
    { type: 'bold', icon: Bold, title: '粗体' },
    { type: 'italic', icon: Italic, title: '斜体' },
    { type: 'heading', icon: Heading, title: '标题' },
    { type: 'link', icon: LinkIcon, title: '链接' },
    { type: 'image', icon: Image, title: '插入图片', isFile: true },
    { type: 'video', icon: Video, title: '插入视频', isFile: true },
    { type: 'audio', icon: Music, title: '插入音频', isFile: true },
    { type: 'archive', icon: FileText, title: '插入压缩包', isFile: true },
    { type: 'list', icon: List, title: '列表' },
    { type: 'code', icon: Code, title: '代码' }
];

export default function MarkdownToolbar({
                                            onToolbarClick,
                                            showHeadingMenu,
                                            onHeadingSelect,
                                            onHeadingMenuClose
                                        }) {
    const headingMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (headingMenuRef.current && !headingMenuRef.current.contains(e.target)) {
                onHeadingMenuClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onHeadingMenuClose]);

    return (
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 bg-gray-50 px-2">
            {TOOLBAR_BUTTONS.map((button) => (
                <div key={button.type} className="relative flex-shrink-0">
                    <button
                        onClick={() => onToolbarClick(button.type)}
                        title={button.title}
                        className="p-2 sm:p-3 hover:bg-gray-100 rounded w-12 h-12 flex items-center justify-center sm:w-10 sm:h-10"
                    >
                        <button.icon className="h-5 w-5 sm:h-4 sm:w-4" />
                    </button>

                    {button.type === 'heading' && showHeadingMenu && (
                        <div
                            ref={headingMenuRef}
                            className="absolute top-full left-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                        >
                            {['# 一级标题', '## 二级标题', '### 三级标题'].map((h, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onHeadingSelect(h)}
                                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
