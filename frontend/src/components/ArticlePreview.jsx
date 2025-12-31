import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Music, FileText, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getConfig } from '../utils/config';
import ImageLightbox from './ImageLightbox';

const rehypeSanitizeSchema = {
    tagNames: [
        'div','span','p','br','strong','em','u','s','del','ins',
        'h1','h2','h3','h4','h5','h6',
        'ul','ol','li','dl','dt','dd',
        'blockquote','pre','code',
        'table','thead','tbody','tr','th','td',
        'a','img','video','audio','source','track',
        'hr','sup','sub',
        'archive'
    ],
    attributes: {
        '*': ['className', 'id', 'data*', 'style'],
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'video': ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'width', 'height', 'preload'],
        'audio': ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload', 'data*'],
        'source': ['src', 'type', 'media'],
        'track': ['src', 'kind', 'srclang', 'label', 'default'],
        'archive': ['src', 'data*'],
        'span': ['data-toc-id', 'style', 'className']
    },
    protocols: {
        'href': ['http', 'https', 'mailto'],
        'src': ['http', 'https']
    },
    clobberPrefix: 'user-content-',
    clobber: ['name', 'id']
};

const isSafeUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

const sanitizeHtmlContent = (content) => {
    if (!content) return '';

    let processedContent = content;
    const dangerousBlocks = [];

    const dangerousPatterns = [
        { pattern: /<meta[^>]*>/gi, label: 'Meta标签' },
        { pattern: /<script[^>]*>[\s\S]*?<\/script>/gi, label: 'JavaScript代码' },
        { pattern: /<iframe[^>]*>[\s\S]*?<\/iframe>/gi, label: 'IFrame嵌入' },
        { pattern: /<(object|embed)[^>]*>[\s\S]*?<\/\1>/gi, label: '嵌入对象' },
        { pattern: /<link[^>]*>/gi, label: 'Link标签' },
        { pattern: /<style[^>]*>[\s\S]*?<\/style>/gi, label: 'CSS样式' },
        { pattern: /<\/?form[^>]*>/gi, label: '表单标签' },
        { pattern: /<(input|button|textarea|select|option)[^>]*>/gi, label: '表单元素' },
        { pattern: /<base[^>]*>/gi, label: 'Base标签' }
    ];

    dangerousPatterns.forEach(({ pattern, label }) => {
        const matches = [];
        let match;
        pattern.lastIndex = 0;

        while ((match = pattern.exec(processedContent)) !== null) {
            matches.push({
                code: match[0],
                index: match.index,
                length: match[0].length
            });
        }

        matches.reverse().forEach(({ code, index, length }) => {
            const placeholder = `__DANGEROUS_BLOCK_${dangerousBlocks.length}__`;
            dangerousBlocks.push({
                code: code,
                label: label,
                placeholder: placeholder
            });
            processedContent = processedContent.substring(0, index) +
                placeholder +
                processedContent.substring(index + length);
        });
    });

    processedContent = processedContent
        .replace(/javascript:/gi, 'about:blank#')
        .replace(/vbscript:/gi, 'about:blank#')
        .replace(/data:(?!image\/(png|jpg|jpeg|gif|svg\+xml|webp))[^"']*/gi, 'about:blank#')
        .replace(/\s+(on\w+\s*=\s*["'][^"']*["'])/gi, (match, eventHandler) => {
            const placeholder = `__DANGEROUS_BLOCK_${dangerousBlocks.length}__`;
            dangerousBlocks.push({
                code: eventHandler.trim(),
                label: '事件处理器',
                placeholder: placeholder
            });
            return ` ${placeholder}`;
        })
        .replace(/style\s*=\s*["']([^"']*)["']/gi, (match, styleContent) => {
            if (/javascript:|expression\(|@import|behavior:/i.test(styleContent)) {
                const placeholder = `__DANGEROUS_BLOCK_${dangerousBlocks.length}__`;
                dangerousBlocks.push({
                    code: match,
                    label: '危险CSS样式',
                    placeholder: placeholder
                });
                return placeholder;
            }
            return match;
        });

    dangerousBlocks.forEach(({ code, label, placeholder }) => {
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');

        const codeBlock = `<div class="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center mb-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ⚠️ 安全提示: ${label}
                    </span>
                </div>
                <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto"><code>${escapedCode}</code></pre>
                <div class="mt-2 text-xs text-red-600">
                    此内容可能存在安全风险,已被安全地显示为代码块
                </div>
            </div>`;

        processedContent = processedContent.split(placeholder).join(codeBlock);
    });

    processedContent = processedContent
        .replace(/class="my-4 flex justify-center"/g, 'class="my-4"')
        .replace(/style="width:\s*400px;"/g, 'style="max-width: 100%; max-height: 400px;"');

    return processedContent;
};

function useTheme() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkInitialTheme = () => {
            const saved = localStorage.getItem('theme');
            const shouldBeDark = saved === 'dark';
            const currentIsDark = document.documentElement.classList.contains('dark');
            setIsDark(currentIsDark);
        };

        checkInitialTheme();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isDarkNow = document.documentElement.classList.contains('dark');
                    setIsDark(isDarkNow);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    return isDark;
}

const preprocessMarkdown = (text) => {
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

export default function ArticlePreview({ article }) {
    const isDark = useTheme();
    const [renderKey, setRenderKey] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [articleImages, setArticleImages] = useState([]);

    useEffect(() => {
        setRenderKey(prev => prev + 1);
    }, [isDark]);

    useEffect(() => {
        if (article?.article_content) {
            const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>|!\[[^\]]*\]\(([^)]+)\)/g;
            const images = [];
            let match;

            while ((match = imageRegex.exec(article.article_content)) !== null) {
                const src = match[1] || match[2];
                if (src) {
                    images.push({
                        src: getFullImageUrl(src),
                        alt: ''
                    });
                }
            }

            setArticleImages(images);
        }
    }, [article?.article_content]);

    const syntaxStyle = useMemo(() => {
        return isDark ? oneDark : oneLight;
    }, [isDark]);

    const getFullImageUrl = (url) => {
        if (!url) return null;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        let urlPath = url;
        let urlParams = '';
        if (url.includes('?')) {
            const parts = url.split('?');
            urlPath = parts[0];
            urlParams = '?' + parts[1];
        }

        try {
            const config = getConfig();
            return config.getFullUrl(urlPath) + urlParams;
        } catch (error) {
            if (urlPath.startsWith('/')) {
                return urlPath + urlParams;
            }
            return `/upload/${urlPath}` + urlParams;
        }
    };

    const CodeBlock = ({ className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children).replace(/\n$/, "");
        const [localCopied, setLocalCopied] = useState(false);

        const handleCopyCode = async () => {
            try {
                await navigator.clipboard.writeText(codeString);
                setLocalCopied(true);
                setTimeout(() => {
                    setLocalCopied(false);
                }, 2000);
            } catch (err) {
                console.error('复制失败:', err);
            }
        };

        return match ? (
            <div className="my-4 react-syntax-highlighter relative group">
                <button
                    onClick={handleCopyCode}
                    className="absolute right-2 top-2 p-2 bg-gray-200 hover:bg-gray-100 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    title="复制代码"
                >
                    <div className="relative w-4 h-4">
                        <Copy
                            className={`h-4 w-4 text-gray-600 absolute inset-0 transition-all duration-300 ${
                                localCopied
                                    ? 'opacity-0 scale-0 rotate-90'
                                    : 'opacity-100 scale-100 rotate-0'
                            }`}
                        />
                        <Check
                            className={`h-4 w-4 text-green-600 absolute inset-0 transition-all duration-300 ${
                                localCopied
                                    ? 'opacity-100 scale-100 rotate-0'
                                    : 'opacity-0 scale-0 -rotate-90'
                            }`}
                        />
                    </div>
                </button>
                <SyntaxHighlighter
                    style={syntaxStyle}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg shadow-sm"
                    {...props}
                >
                    {codeString}
                </SyntaxHighlighter>
            </div>
        ) : (
            <code
                className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 inline-block align-text-bottom max-w-full overflow-x-auto"
                style={{
                    whiteSpace: 'pre',
                    scrollbarWidth: 'thin'
                }}
                {...props}
            >
                {children}
            </code>
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('article-headings-ready'));
        }, 300);

        return () => clearTimeout(timer);
    }, [article?.article_content, renderKey]);

    const headingIdsRef = useRef(new Map());

    useEffect(() => {
        if (article?.article_content) {
            const counters = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
            const idsMap = new Map();

            const headingRegex = /^(#{1,6})\s+(.+)$/gm;
            let match;
            let index = 0;

            while ((match = headingRegex.exec(article.article_content)) !== null) {
                const level = match[1].length;
                const id = `toc-${level}-${counters[level]}`;
                counters[level]++;
                idsMap.set(index, id);
                index++;
            }

            headingIdsRef.current = idsMap;
        }
    }, [article?.article_content]);

    const currentHeadingIndexRef = useRef({ h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 });
    const totalHeadingIndexRef = useRef(0);

    const renderMarkdownComponents = useMemo(() => {
        currentHeadingIndexRef.current = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
        totalHeadingIndexRef.current = 0;

        return {
            h1: (props) => {
                const id = `toc-1-${currentHeadingIndexRef.current.h1++}`;
                totalHeadingIndexRef.current++;
                return <h1 id={id} className="text-3xl font-bold mt-6 mb-4 text-gray-900" {...props} />;
            },
            h2: (props) => {
                const id = `toc-2-${currentHeadingIndexRef.current.h2++}`;
                totalHeadingIndexRef.current++;
                return <h2 id={id} className="text-2xl font-bold mt-5 mb-3 text-gray-900" {...props} />;
            },
            h3: (props) => {
                const id = `toc-3-${currentHeadingIndexRef.current.h3++}`;
                totalHeadingIndexRef.current++;
                return <h3 id={id} className="text-xl font-semibold mt-4 mb-2 text-gray-900" {...props} />;
            },
            h4: (props) => {
                const id = `toc-4-${currentHeadingIndexRef.current.h4++}`;
                totalHeadingIndexRef.current++;
                return <h4 id={id} className="text-lg font-semibold mt-3 mb-2 text-gray-900" {...props} />;
            },
            h5: (props) => {
                const id = `toc-5-${currentHeadingIndexRef.current.h5++}`;
                totalHeadingIndexRef.current++;
                return <h5 id={id} className="text-base font-semibold mt-3 mb-2 text-gray-900" {...props} />;
            },
            h6: (props) => {
                const id = `toc-6-${currentHeadingIndexRef.current.h6++}`;
                totalHeadingIndexRef.current++;
                return <h6 id={id} className="text-sm font-semibold mt-3 mb-2 text-gray-900" {...props} />;
            },
            p: (props) => (
                <p className="mb-3 leading-relaxed text-gray-700" {...props} />
            ),
            ul: (props) => (
                <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700" {...props} />
            ),
            ol: (props) => (
                <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700" {...props} />
            ),
            li: (props) => (
                <li className="mb-1 text-gray-700 leading-relaxed" {...props} />
            ),
            blockquote: (props) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 bg-gray-50 py-2 rounded-r" {...props} />
            ),
            table: (props) => (
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-gray-300" {...props} />
                </div>
            ),
            thead: (props) => (
                <thead className="bg-gray-100" {...props} />
            ),
            th: (props) => (
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900" {...props} />
            ),
            td: (props) => (
                <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
            ),
            hr: (props) => (
                <hr className="my-6 border-gray-300" {...props} />
            ),
            code: CodeBlock,
            a: ({ href, children, ...props }) => {
                if (!isSafeUrl(href)) {
                    return <span className="text-gray-500" {...props}>{children}</span>;
                }
                return (
                    <a
                        href={href}
                        className="text-blue-600 hover:underline hover:text-blue-500 transition-colors break-words"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                    >
                        {children}
                    </a>
                );
            },
            img: ({ src, alt, ...props }) => {
                if (!isSafeUrl(src)) return null;
                const fullSrc = getFullImageUrl(src);
                const imageIndex = articleImages.findIndex(img => img.src === fullSrc);

                return (
                    <span className="inline-block my-4">
                        <img
                            src={fullSrc}
                            alt={alt || '图片'}
                            className="rounded-lg shadow-sm cursor-pointer border border-gray-200 hover:shadow-md transition-shadow"
                            style={{
                                maxHeight: "400px",
                                maxWidth: "100%",
                                height: "auto",
                                width: "auto",
                                objectFit: "contain",
                            }}
                            onClick={() => {
                                if (imageIndex >= 0) {
                                    setCurrentImageIndex(imageIndex);
                                }
                                setLightboxOpen(true);
                            }}
                            title="点击查看大图"
                            onError={(e) => {
                                e.target.src = '/image_error.svg';
                                e.target.alt = '图片加载失败';
                            }}
                            {...props}
                        />
                    </span>
                );
            },
            video: ({ src, controls = true, ...props }) => {
                if (!isSafeUrl(src)) return null;
                const fullSrc = getFullImageUrl(src);

                return (
                    <div className="my-4 flex">
                        <video
                            src={fullSrc}
                            controls={controls}
                            className="rounded-lg shadow-sm border border-gray-200"
                            style={{ maxWidth: "100%", maxHeight: "400px" }}
                            {...props}
                        >
                            您的浏览器不支持视频播放。
                        </video>
                    </div>
                );
            },
            audio: ({ src, controls = true, preload = "metadata", ...props }) => {
                if (!isSafeUrl(src)) return null;

                let fileName = props['data-filename'];

                if (!fileName && src.includes('?filename=')) {
                    try {
                        const url = new URL(src.startsWith('http') ? src : `http://dummy${src}`);
                        fileName = decodeURIComponent(url.searchParams.get('filename') || '');
                    } catch (e) {
                        console.error('解析 URL 失败:', e);
                    }
                }

                if (!fileName) {
                    fileName = src.split("/").pop()?.split("?")[0] || "音频文件";
                }

                const fullSrc = getFullImageUrl(src);

                return (
                    <div className="my-4 p-4 bg-gray-100 border border-gray-200 rounded-xl shadow-sm max-w-lg">
                        <div className="flex items-center mb-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                <Music className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate" title={fileName}>
                                    {fileName}
                                </div>
                                <div className="text-xs text-gray-500">
                                    音频文件
                                </div>
                            </div>
                        </div>
                        <audio
                            src={fullSrc}
                            controls={controls}
                            preload={preload}
                            className="w-full rounded-md"
                            style={{ height: "40px", outline: "none" }}
                            {...props}
                        >
                            您的浏览器不支持音频播放。
                        </audio>
                    </div>
                );
            },
            source: ({ src, type, ...props }) => {
                if (!isSafeUrl(src)) return null;
                const fullSrc = getFullImageUrl(src);
                return <source src={fullSrc} type={type} {...props} />;
            },
            archive: ({ src, ...props }) => {
                if (!isSafeUrl(src)) return null;

                let displayName = props['data-filename'];

                if (!displayName && src.includes('?filename=')) {
                    try {
                        const url = new URL(src.startsWith('http') ? src : `http://dummy${src}`);
                        displayName = decodeURIComponent(url.searchParams.get('filename') || '');
                    } catch (e) {
                        console.error('解析 URL 失败:', e);
                    }
                }

                if (!displayName) {
                    displayName = src.split("/").pop()?.split("?")[0] || "压缩文件";
                }

                const fullSrc = getFullImageUrl(src);

                return (
                    <div className="my-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm max-w-lg">
                        <div className="flex items-center mb-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center mr-3">
                                <FileText className="h-4 w-4 text-gray-800" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-700 truncate" title={displayName}>
                                    {displayName}
                                </div>
                                <div className="text-xs text-gray-500">
                                    压缩文件
                                </div>
                            </div>
                            <a
                                href={fullSrc}
                                download={displayName}
                                className="ml-2 px-3 py-1 bg-blue-300 text-gray-800 text-xs rounded-md hover:bg-blue-400"
                            >
                                下载
                            </a>
                        </div>
                    </div>
                );
            }
        };
    }, [syntaxStyle, articleImages, CodeBlock, article?.article_content]);

    const isMarkdownContent = (content) => {
        if (!content) return false;

        const markdownPatterns = [
            /^#{1,6}\s/m,
            /\*\*.*\*\*/,
            /\*.*\*/,
            /\[.*\]\(.*\)/,
            /!\[.*\]\(.*\)/,
            /^>\s/m,
            /^[-*+]\s/m,
            /^\d+\.\s/m,
            /```[\s\S]*```/,
            /`.*`/,
            /<audio[^>]*>/i,
            /<archive[^>]*>/i,
        ];

        return markdownPatterns.some(pattern => pattern.test(content));
    };

    const renderArticleContent = (content) => {
        if (!content) return null;

        currentHeadingIndexRef.current = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
        totalHeadingIndexRef.current = 0;

        if (isMarkdownContent(content)) {
            const processedContent = preprocessMarkdown(content);

            return (
                <div className="markdown-content" key={`markdown-${renderKey}`}>
                    <ReactMarkdown
                        children={processedContent}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, [rehypeSanitize, rehypeSanitizeSchema]]}
                        components={renderMarkdownComponents}
                    />
                </div>
            );
        } else {
            const sanitizedContent = sanitizeHtmlContent(content);

            return (
                <div
                    className="prose max-w-none
                        prose-headings:text-gray-900
                        prose-p:text-gray-700
                        prose-a:text-blue-600
                        prose-blockquote:text-gray-600
                        prose-strong:text-gray-900
                        prose-code:bg-gray-100
                        prose-pre:bg-gray-800
                        [&_a]:break-words
                        [&_video]:my-4 [&_video]:max-w-full [&_video]:h-auto
                        [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto
                        [&_.justify-center]:justify-start"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    key={`html-${renderKey}`}
                />
            );
        }
    };

    if (!article) {
        return null;
    }

    return (
        <article className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
                {article.article_name}
            </h1>
            <div className="text-gray-600 mb-6 border-b border-gray-200 pb-4">
                <span>发布时间: {new Date(article.create_time).toLocaleDateString()}</span>
                <span className="mx-2">|</span>
                <span>阅读量: {article.page_views}</span>
                {article.category && (
                    <>
                        <span className="mx-2">|</span>
                        <span>分类: {article.category}</span>
                    </>
                )}
                {article.tag && (
                    <>
                        <span className="mx-2">|</span>
                        <span>标签: {article.tag.split(',').map(tag => `#${tag.trim()}`).filter(tag => tag !== '#').join(' ')}</span>
                    </>
                )}
            </div>

            <div className="article-content break-words break-all whitespace-normal">
                {renderArticleContent(article.article_content)}
            </div>
            {lightboxOpen && (
                <ImageLightbox
                    images={articleImages}
                    currentIndex={currentImageIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNavigate={(direction) => {
                        setCurrentImageIndex(prev => {
                            const newIndex = prev + direction;
                            if (newIndex < 0) return articleImages.length - 1;
                            if (newIndex >= articleImages.length) return 0;
                            return newIndex;
                        });
                    }}
                />
            )}
        </article>
    );
}