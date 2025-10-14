import React, { useState, useEffect, useRef } from 'react';
import { List, ChevronRight } from 'lucide-react';

export default function TableOfContents({ article }) {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const headingElementsRef = useRef([]);

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
            let match;

            while ((match = headingRegex.exec(content)) !== null) {
                const level = match[1].length;
                const rawText = match[2].trim();
                const cleanText = cleanHeadingText(rawText);
                const id = `toc-${level}-${parsed.length}-${Math.random().toString(36).substring(2, 8)}`;

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

            const allHeadings = Array.from(articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            newHeadings.forEach((heading, i) => {
                if (allHeadings[i]) {
                    allHeadings[i].id = heading.id;
                }
            });

            headingElementsRef.current = allHeadings;
        };

        const timer = setTimeout(updateHeadingElements, 500);

        const handleThemeChange = () => setTimeout(updateHeadingElements, 100);
        window.addEventListener('theme-change', handleThemeChange);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('theme-change', handleThemeChange);
        };
    }, [article]);

    useEffect(() => {
        if (headings.length === 0) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150;
            let current = '';

            for (let i = headingElementsRef.current.length - 1; i >= 0; i--) {
                const element = headingElementsRef.current[i];
                if (element && element.offsetTop <= scrollPosition) {
                    current = element.id;
                    break;
                }
            }

            setActiveId(current);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [headings]);

    const scrollToHeading = (index) => {
        const heading = headings[index];
        if (!heading) return;

        setActiveId(heading.id);
        const element = document.getElementById(heading.id);

        if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - 120;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveId('article-title');
    };

    if (!headings || headings.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center">
                        <List className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">文章目录</h3>
                    </div>
                </div>
                <div className="p-4">
                    <nav className="space-y-1 max-h-96 overflow-y-auto">
                        <button
                            onClick={scrollToTop}
                            className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-start group text-sm ${
                                activeId === 'article-title'
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                            }`}
                        >
                            <ChevronRight
                                className={`h-4 w-4 mt-0.5 mr-2 flex-shrink-0 transition-transform ${
                                    activeId === 'article-title'
                                        ? 'text-blue-600 transform rotate-90'
                                        : 'text-gray-400 group-hover:text-blue-600'
                                }`}
                            />
                            <span className="leading-5 break-words line-clamp-2">
                                {article?.article_name || '文章名称'}
                            </span>
                        </button>
                    </nav>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="border-b border-gray-200 px-4 py-3">
                <div className="flex items-center">
                    <List className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">文章目录</h3>
                </div>
            </div>

            <div className="p-4">
                <nav className="space-y-1 max-h-96 overflow-y-auto">
                    <button
                        onClick={scrollToTop}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-start group text-sm ${
                            activeId === 'article-title'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                    >
                        <ChevronRight
                            className={`h-4 w-4 mt-0.5 mr-2 flex-shrink-0 transition-transform ${
                                activeId === 'article-title'
                                    ? 'text-blue-600 transform rotate-90'
                                    : 'text-gray-400 group-hover:text-blue-600'
                            }`}
                        />
                        <span className="leading-5 break-words line-clamp-2">
                            {article?.article_name || '文章名称'}
                        </span>
                    </button>

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
                                }`}
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
                </nav>
            </div>
        </div>
    );
}
