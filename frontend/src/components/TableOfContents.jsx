import React, { useState, useEffect, useRef } from 'react';
import { List, ChevronRight } from 'lucide-react';

export default function TableOfContents({ article }) {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const headingElementsRef = useRef([]);

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
                const text = match[2].trim();
                const id = `toc-heading-${parsed.length}`;

                parsed.push({
                    id,
                    level,
                    text,
                    index: parsed.length
                });
            }

            return parsed;
        };

        const newHeadings = parseHeadings(article.article_content);
        setHeadings(newHeadings);
        
        const timer = setTimeout(() => {
            headingElementsRef.current = newHeadings.map((heading, index) => {
                const articleContent = document.querySelector('.article-content');
                if (!articleContent) return null;

                const allHeadings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
                return allHeadings[index] || null;
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [article]);

    useEffect(() => {
        if (headings.length === 0) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150;

            let current = '';
            for (let i = headingElementsRef.current.length - 1; i >= 0; i--) {
                const element = headingElementsRef.current[i];
                if (element && element.offsetTop <= scrollPosition) {
                    current = headings[i].id;
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
        setActiveId(headings[index].id);

        const element = headingElementsRef.current[index];

        if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - 120;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            const articleContent = document.querySelector('.article-content');
            if (articleContent) {
                const allHeadings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
                const targetElement = allHeadings[index];

                if (targetElement) {
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - 120;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        }
    };

    if (!headings || headings.length === 0) {
        return null;
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
                    {headings.map((heading, index) => {
                        const isActive = activeId === heading.id;
                        const indent = (heading.level - 1) * 12;

                        return (
                            <button
                                key={heading.id}
                                onClick={() => scrollToHeading(index)}
                                className={`
                  w-full text-left px-3 py-2 rounded-md transition-all duration-200
                  flex items-start group text-sm
                  ${isActive
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                }
                `}
                                style={{ paddingLeft: `${12 + indent}px` }}
                                title={heading.text}
                            >
                                <ChevronRight
                                    className={`
                    h-4 w-4 mt-0.5 mr-2 flex-shrink-0 transition-transform
                    ${isActive ? 'text-blue-600 transform rotate-90' : 'text-gray-400 group-hover:text-blue-600'}
                  `}
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