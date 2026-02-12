import React, { useState, useEffect, useRef } from 'react';
import { List, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

export default function TableOfContents({ article }) {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const headingElementsRef = useRef([]);
    const isScrollingRef = useRef(false);

    const cleanHeadingText = (html) => {
        if (!html) return '';
        let text = html;

        text = text.replace(/<\/?(font|span|u|em|small|strong|div|p)[^>]*>/gi, '');

        text = text
            .replace(/<\/?(b|i|code|kbd|mark|sub|sup)>/gi, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');

        text = text.replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '');

        const tmp = document.createElement('div');
        tmp.innerHTML = text;
        text = tmp.textContent || tmp.innerText || '';

        return text.trim();
    };


    useEffect(() => {
        if (!article?.article_content) {
            setHeadings([]);
            return;
        }

        const parseHeadings = (content) => {
            const headingRegex = /^(#{1,6})\s+(.+)$/gm;
            const parsed = [];
            const counters = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
            let match;

            while ((match = headingRegex.exec(content)) !== null) {
                const level = match[1].length;
                const rawText = match[2].trim();
                const cleanText = cleanHeadingText(rawText);

                const id = `toc-${level}-${counters[level]}`;
                counters[level]++;

                parsed.push({
                    id,
                    level,
                    text: cleanText,
                    rawText,
                    index: parsed.length
                });
            }

            return parsed;
        };

        const newHeadings = parseHeadings(article.article_content);
        setHeadings(newHeadings);

        const updateHeadingElements = () => {
            const articleContent = document.querySelector('.article-content');
            if (!articleContent) return;

            const headingElements = newHeadings.map(heading =>
                document.getElementById(heading.id)
            ).filter(Boolean);

            headingElementsRef.current = headingElements;
        };

        const observer = new MutationObserver(() => {
            updateHeadingElements();
        });

        const articleContentContainer = document.querySelector('.article-content');
        if (articleContentContainer) {
            observer.observe(articleContentContainer, {
                childList: true,
                subtree: true
            });
        }

        setTimeout(updateHeadingElements, 100);
        setTimeout(updateHeadingElements, 500);

        return () => {
            observer.disconnect();
        };
    }, [article]);

    useEffect(() => {
        if (headings.length === 0) return;

        const updateHeadingElements = () => {
            const headingElements = headings.map(heading =>
                document.getElementById(heading.id)
            ).filter(Boolean);

            headingElementsRef.current = headingElements;
        };

        updateHeadingElements();

        const handleScroll = () => {
            if (isScrollingRef.current) {
                return;
            }

            const scrollPosition = window.scrollY + 150;
            let current = '';

            for (let i = headingElementsRef.current.length - 1; i >= 0; i--) {
                const element = headingElementsRef.current[i];
                if (element && element.offsetTop <= scrollPosition) {
                    current = element.id;
                    break;
                }
            }

            if (current !== activeId) {
                setActiveId(current);
            }
        };

        const scrollTimeout = setTimeout(() => {
            updateHeadingElements();
            window.addEventListener('scroll', handleScroll);
            handleScroll();
        }, 100);

        return () => {
            clearTimeout(scrollTimeout);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [headings, activeId]);

    const scrollToHeading = (index) => {
        const heading = headings[index];
        if (!heading) {
            console.log('Heading not found at index:', index);
            return;
        }

        console.log('Trying to scroll to:', heading.id);
        const element = document.getElementById(heading.id);

        if (!element) {
            console.log('Element not found for ID:', heading.id);
            console.log('Available elements:', headingElementsRef.current.map(h => h.id));
            return;
        }

        console.log('Found element, scrolling...');
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 120;

        isScrollingRef.current = true;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

        setActiveId(heading.id);

        setTimeout(() => {
            isScrollingRef.current = false;
        }, 1000);
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    if (!headings || headings.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 toc-container">
                <div className="border-b border-gray-200 px-4 py-3 toc-header">
                    <div className="flex items-center">
                        <List className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">文章目录</h3>
                    </div>
                </div>
                <div className="p-4">
                    <nav className="space-y-1 max-h-96 overflow-y-auto toc-nav">
                        <button
                            onClick={toggleCollapse}
                            className="w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-between text-sm text-gray-800 font-medium hover:bg-gray-50 toc-title-btn"
                        >
                        <span className="leading-5 break-words line-clamp-2">
                            {article?.article_name || '文章名称'}
                        </span>
                            {isCollapsed ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronUp className="h-4 w-4 text-gray-500" />}
                        </button>

                        {isCollapsed && (
                            <div className="text-center text-gray-500 py-4 text-sm toc-collapsed-tip">
                                目录已收起
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 toc-container">
            <div className="border-b border-gray-200 px-4 py-3 toc-header">
                <div className="flex items-center">
                    <List className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">文章目录</h3>
                </div>
            </div>

            <div className="p-4">
                <nav className="space-y-1 max-h-96 overflow-y-auto toc-nav">
                    <button
                        onClick={toggleCollapse}
                        className="w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-between text-sm text-gray-800 font-medium hover:bg-gray-50 toc-title-btn"
                    >
                    <span className="leading-5 break-words line-clamp-2">
                        {article?.article_name || '文章名称'}
                    </span>
                        {isCollapsed ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronUp className="h-4 w-4 text-gray-500" />}
                    </button>

                    {isCollapsed ? (
                        <div className="text-center text-gray-500 py-4 text-sm toc-collapsed-tip">
                            目录已收起
                        </div>
                    ) : (
                        <>
                            {headings.map((heading, index) => {
                                const isActive = activeId === heading.id;
                                const indent = (heading.level - 1) * 12;

                                return (
                                    <button
                                        key={heading.id}
                                        onClick={() => scrollToHeading(index)}
                                        className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-start group text-sm ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                        } toc-heading-item`}
                                        style={{ paddingLeft: `${12 + indent}px` }}
                                        title={heading.text}
                                    >
                                        <ChevronRight
                                            className={`h-4 w-4 mt-0.5 mr-2 flex-shrink-0 transition-transform ${
                                                isActive
                                                    ? 'text-blue-600 transform rotate-90'
                                                    : 'text-gray-400 group-hover:text-blue-600'
                                            }`}
                                        />
                                        <span className="leading-5 break-words line-clamp-2">
                                            {heading.text}
                                        </span>
                                    </button>
                                );
                            })}
                        </>
                    )}
                </nav>
            </div>
        </div>
    );
}