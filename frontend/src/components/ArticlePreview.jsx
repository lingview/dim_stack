import React, { useState, useEffect, useMemo } from 'react';
import { Music,FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getConfig } from '../utils/config';


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
        '*': ['className', 'id'],
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'video': ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'width', 'height', 'preload'],
        'audio': ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload'],
        'source': ['src', 'type', 'media'],
        'track': ['src', 'kind', 'srclang', 'label', 'default'],
        'archive': ['src', 'fileName']
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
        // meta标签
        { pattern: /<meta[^>]*>/gi, label: 'Meta标签' },
        // script标签及其内容
        { pattern: /<script[^>]*>[\s\S]*?<\/script>/gi, label: 'JavaScript代码' },
        // iframe标签
        { pattern: /<iframe[^>]*>[\s\S]*?<\/iframe>/gi, label: 'IFrame嵌入' },
        // object和embed 标签
        { pattern: /<(object|embed)[^>]*>[\s\S]*?<\/\1>/gi, label: '嵌入对象' },
        // link标签
        { pattern: /<link[^>]*>/gi, label: 'Link标签' },
        // style标签及其内容
        { pattern: /<style[^>]*>[\s\S]*?<\/style>/gi, label: 'CSS样式' },
        // form标签
        { pattern: /<\/?form[^>]*>/gi, label: '表单标签' },
        // 表单元素
        { pattern: /<(input|button|textarea|select|option)[^>]*>/gi, label: '表单元素' },
        // base标签
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
        // 处理危险协议
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
                    此内容可能存在安全风险，已被安全地显示为代码块
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

export default function ArticlePreview({ article }) {
    const isDark = useTheme();
    const [renderKey, setRenderKey] = useState(0);

    useEffect(() => {
        setRenderKey(prev => prev + 1);
    }, [isDark]);

    const syntaxStyle = useMemo(() => {
        return isDark ? oneDark : oneLight;
    }, [isDark]);

    const getFullImageUrl = (url) => {
        if (!url) return null;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        try {
            const config = getConfig();
            return config.getFullUrl(url);
        } catch (error) {
            if (url.startsWith('/')) {
                return url;
            }
            return `/upload/${url}`;
        }
    };

    const renderMarkdownComponents = useMemo(() => ({
        h1: (props) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 text-gray-900" {...props} />
        ),
        h2: (props) => (
            <h2 className="text-2xl font-bold mt-5 mb-3 text-gray-900" {...props} />
        ),
        h3: (props) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900" {...props} />
        ),
        h4: (props) => (
            <h4 className="text-lg font-semibold mt-3 mb-2 text-gray-900" {...props} />
        ),
        h5: (props) => (
            <h5 className="text-base font-semibold mt-3 mb-2 text-gray-900" {...props} />
        ),
        h6: (props) => (
            <h6 className="text-sm font-semibold mt-3 mb-2 text-gray-900" {...props} />
        ),
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
        code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
                <div className="my-4 react-syntax-highlighter" key={`code-${renderKey}`}>
                    <SyntaxHighlighter
                        style={syntaxStyle}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg shadow-sm"
                        {...props}
                    >
                        {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code
                    className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800"
                    {...props}
                >
                    {children}
                </code>
            );
        },
        a: ({ href, children, ...props }) => {
            if (!isSafeUrl(href)) {
                return <span className="text-gray-500" {...props}>{children}</span>;
            }
            return (
                <a
                    href={href}
                    className="text-blue-600 hover:underline hover:text-blue-500 transition-colors"
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

            return (
                <div className="my-4 flex">
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
                        onClick={() => window.open(fullSrc, "_blank")}
                        title="点击查看大图"
                        onError={(e) => {
                            e.target.src = '/image_error.svg';
                            e.target.alt = '图片加载失败';
                        }}
                        {...props}
                    />
                </div>
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
            const fullSrc = getFullImageUrl(src);
            const fileName = src.split("/").pop()?.split("?")[0] || "音频文件";

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
        archive: ({ src, fileName, ...props }) => {
            if (!isSafeUrl(src)) return null;
            const fullSrc = getFullImageUrl(src);
            const displayName = fileName || src.split("/").pop()?.split("?")[0] || "压缩文件";

            return (
                <div className="my-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm max-w-lg">
                    <div className="flex items-center mb-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center mr-3">
                            <FileText className="h-4 w-4 text-dark" />
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
        },
    }), [renderKey, syntaxStyle]);

    const isMarkdownContent = (content) => {
        if (!content) return false;

        const markdownPatterns = [
            /^#{1,6}\s/m,           // 标题
            /\*\*.*\*\*/,           // 粗体
            /\*.*\*/,               // 斜体
            /\[.*\]\(.*\)/,         // 链接
            /!\[.*\]\(.*\)/,        // 图片
            /^>\s/m,                // 引用
            /^[-*+]\s/m,            // 无序列表
            /^\d+\.\s/m,            // 有序列表
            /```[\s\S]*```/,        // 代码块
            /`.*`/,                 // 内联代码
        ];

        return markdownPatterns.some(pattern => pattern.test(content));
    };

    const renderArticleContent = (content) => {
        if (!content) return null;

        if (isMarkdownContent(content)) {
            return (
                <div className="markdown-content" key={`markdown-${renderKey}`}>
                    <ReactMarkdown
                        children={content}
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



            <div className="article-content">
                {renderArticleContent(article.article_content)}
            </div>
        </article>
    );
}