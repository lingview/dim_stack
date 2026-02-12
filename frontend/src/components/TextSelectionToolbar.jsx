import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Link, Hash, Code } from 'lucide-react';

const TextSelectionToolbar = ({ 
    isVisible, 
    position, 
    onFormat, 
    onClose,
    detectedFormats = null
}) => {
    const toolbarRef = useRef(null);
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);
    const headingMenuRef = useRef(null);
    const [headingMenuDirection, setHeadingMenuDirection] = useState('up');

    const getButtonStatus = (formatType) => {
        if (!detectedFormats) return 'normal';
        
        const { textFormats } = detectedFormats;

        if (formatType === 'heading') {
            return textFormats.heading ? 'active' : 'normal';
        }

        return textFormats[formatType] ? 'active' : 'normal';
    };

    const getButtonClass = (status) => {
        switch(status) {
            case 'active':
                return 'p-2 bg-blue-100 text-blue-700 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300';
            case 'disabled':
                return 'p-2 text-gray-400 rounded-md cursor-not-allowed';
            default:
                return 'p-2 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300';
        }
    };

    const calculateHeadingMenuDirection = () => {
        if (!toolbarRef.current) return 'up';
        
        const toolbarRect = toolbarRef.current.getBoundingClientRect();
        const menuHeight = 200;
        const safetyMargin = 20;

        const viewportHeight = window.innerHeight;

        const spaceAbove = toolbarRect.top - safetyMargin;
        const spaceBelow = viewportHeight - toolbarRect.bottom - safetyMargin;

        if (spaceAbove < menuHeight && spaceBelow >= menuHeight) {
            return 'down';
        }

        return 'up';
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
                if (headingMenuRef.current && headingMenuRef.current.contains(event.target)) {
                    return;
                }
                onClose();
                setShowHeadingMenu(false);
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, onClose]);

    useEffect(() => {
        if (isVisible && showHeadingMenu) {
            const direction = calculateHeadingMenuDirection();
            setHeadingMenuDirection(direction);
        }
    }, [isVisible, showHeadingMenu, position]);


    if (!isVisible) return null;

    const formatButtons = [
        { type: 'bold', icon: Bold, title: '粗体' },
        { type: 'italic', icon: Italic, title: '斜体' },
        { type: 'link', icon: Link, title: '链接' },
        { type: 'heading', icon: Hash, title: '标题' },
        { type: 'code', icon: Code, title: '代码' }
    ];

    const headingOptions = [
        { level: 1, text: '一级标题', prefix: '#' },
        { level: 2, text: '二级标题', prefix: '##' },
        { level: 3, text: '三级标题', prefix: '###' },
        { level: 4, text: '四级标题', prefix: '####' }
    ];

    const getShortcutKey = (type) => {
        const shortcuts = {
            'bold': 'Ctrl+B',
            'italic': 'Ctrl+I',
            'link': 'Ctrl+K',
            'code': 'Ctrl+E'
        };
        return shortcuts[type] || '';
    };

    const handleHeadingSelect = (prefix) => {
        onFormat('heading', prefix);
        setShowHeadingMenu(false);
    };

    const handleFormatClick = (type) => {
        if (type === 'heading') {
            const direction = calculateHeadingMenuDirection();
            setHeadingMenuDirection(direction);
            setShowHeadingMenu(!showHeadingMenu);
        } else {
            onFormat(type);
        }
    };

    return (
        <div className="relative">
            <div
                ref={toolbarRef}
                className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-1 px-2 flex items-center space-x-1 rich-toolbar"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -100%)',
                    minWidth: '140px'
                }}
            >
                {formatButtons.map(({ type, icon, title }) => {
                    const status = getButtonStatus(type);
                    const buttonClass = getButtonClass(status);
                    const isActive = status === 'active';

                    return (
                        <div key={type} className="relative">
                            <button
                                onClick={() => handleFormatClick(type)}
                                className={`${buttonClass} rich-toolbar-btn`}
                                title={`${title} ${isActive ? '(已应用)' : ''} (${getShortcutKey(type)})`}
                            >
                                <div className="relative">
                                    {React.createElement(icon, { className: "h-4 w-4" })}
                                    {isActive && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                                    )}
                                </div>
                            </button>

                            {type === 'heading' && showHeadingMenu && (
                                <div
                                    ref={headingMenuRef}
                                    className={`absolute w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50 ${
                                        headingMenuDirection === 'up'
                                            ? 'bottom-full mb-1'
                                            : 'top-full mt-1'
                                    } rich-heading-menu`}
                                >
                                    {headingOptions.map((heading) => (
                                        <button
                                            key={heading.level}
                                            onClick={() => handleHeadingSelect(heading.prefix)}
                                            className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm first:rounded-t-md last:rounded-b-md transition-colors rich-heading-option"
                                        >
                                            {heading.text}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TextSelectionToolbar;