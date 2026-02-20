import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Music, FileText } from 'lucide-react';
import { preprocessMarkdown, isSafeUrl } from '../../utils/markdownUtils';
import remarkDisableLonelyOrderedList from "../../utils/remark-disable-lonely-ol.jsx";
import remarkBreaks from 'remark-breaks';

const SANITIZE_SCHEMA = {
    tagNames: [
        'div','span','p','br','strong','em','u','s','del','ins',
        'h1','h2','h3','h4','h5','h6',
        'ul','ol','li','dl','dt','dd',
        'blockquote','pre','code',
        'table','thead','tbody','tr','th','td',
        'a','img','video','audio','source','track',
        'hr','sup','sub','archive'
    ],
    attributes: {
        '*': ['className', 'id', 'style', 'data*'],
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'video': ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'width', 'height', 'preload'],
        'audio': ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload', 'data*'],
        'source': ['src', 'type', 'media'],
        'track': ['src', 'kind', 'srclang', 'label', 'default'],
        'archive': ['src', 'data*']
    }
};

export default function MarkdownPreview({ content, previewRef }) {
    const [copiedCode, setCopiedCode] = useState(null);

    const handleCopyCode = async (code, index) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(index);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    const renderMarkdownComponents = {
        h1: (props) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
        h2: (props) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
        h3: (props) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
        h4: (props) => <h4 className="text-lg font-semibold mt-3 mb-2" {...props} />,
        p: (props) => <p className="mb-3 leading-relaxed text-gray-700" {...props} />,
        ul: (props) => <ul className="list-disc list-inside mb-3 text-gray-700" {...props} />,
        ol: (props) => <ol className="list-decimal list-inside mb-3 text-gray-700" {...props} />,
        li: (props) => <li className="mb-1 text-gray-700" {...props} />,
        blockquote: (props) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-3 text-gray-600" {...props} />,
        table: (props) => (
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300" {...props} />
            </div>
        ),
        thead: (props) => <thead className="bg-gray-100" {...props} />,
        tbody: (props) => <tbody {...props} />,
        tr: (props) => <tr {...props} />,
        th: (props) => <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900" {...props} />,
        td: (props) => <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />,
        code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const codeIndex = `${codeString.substring(0, 20)}-${codeString.length}`;

            return match ? (
                <div className="relative group my-4">
                    <button
                        onClick={() => handleCopyCode(codeString, codeIndex)}
                        className="absolute right-2 top-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="复制代码"
                    >
                        {copiedCode === codeIndex ? (
                            <Check className="h-4 w-4 text-green-400" />
                        ) : (
                            <Copy className="h-4 w-4 text-gray-300" />
                        )}
                    </button>
                    <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                    >
                        {codeString}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code
                    className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800 inline-block align-text-bottom max-w-full overflow-x-auto"
                    style={{ whiteSpace: 'pre', scrollbarWidth: 'thin' }}
                    {...props}
                >
                    {children}
                </code>
            );
        },
        a: ({ href, children, ...props }) => {
            if (!isSafeUrl(href)) return <span {...props}>{children}</span>;
            return (
                <a
                    href={href}
                    className="text-blue-600 hover:underline hover:text-blue-500"
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
            return (
                <img
                    src={src}
                    alt={alt}
                    className="rounded-lg shadow-sm my-4 block cursor-pointer border border-gray-200"
                    style={{
                        maxHeight: "300px",
                        maxWidth: "400px",
                        height: "auto",
                        width: "auto",
                        objectFit: "contain",
                    }}
                    onClick={() => window.open(src, "_blank")}
                    title="点击查看大图"
                    {...props}
                />
            );
        },
        audio: ({ src, controls = true, preload = "metadata", ...props }) => {
            if (!isSafeUrl(src)) return null;

            let fileName = props['data-filename'];
            if (!fileName && src.includes('?filename=')) {
                try {
                    const urlObj = new URL(src);
                    fileName = decodeURIComponent(urlObj.searchParams.get('filename') || '');
                } catch (e) {
                    console.error('解析 URL 失败:', e);
                }
            }
            if (!fileName) {
                fileName = src.split("/").pop()?.split("?")[0] || "音频文件";
            }

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
                            <div className="text-xs text-gray-500">音频文件</div>
                        </div>
                    </div>
                    <audio
                        src={src}
                        controls={controls}
                        preload={preload}
                        className="w-full rounded-md"
                        style={{ height: "40px", outline: "none" }}
                        {...props}
                    />
                </div>
            );
        },
        source: ({ src, type, ...props }) => {
            if (!isSafeUrl(src)) return null;
            return <source src={src} type={type} {...props} />;
        },
        archive: ({ src, ...props }) => {
            if (!isSafeUrl(src)) return null;

            let displayName = props['data-filename'];
            if (!displayName && src.includes('?filename=')) {
                try {
                    const urlObj = new URL(src);
                    displayName = decodeURIComponent(urlObj.searchParams.get('filename') || '');
                } catch (e) {
                    console.error('解析 URL 失败:', e);
                }
            }
            if (!displayName) {
                displayName = src.split("/").pop()?.split("?")[0] || "压缩文件";
            }

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
                            <div className="text-xs text-gray-500">压缩文件</div>
                        </div>
                        <a
                            href={src}
                            download={displayName}
                            className="ml-2 px-3 py-1 bg-blue-300 text-gray-800 text-xs rounded-md hover:bg-blue-400"
                        >
                            下载
                        </a>
                    </div>
                </div>
            );
        },
    };

    return (
        <div
            ref={previewRef}
            className="w-1/2 p-4 overflow-y-auto bg-white text-gray-900"
            style={{ overflowAnchor: 'none' }}
        >
            <ReactMarkdown
                children={preprocessMarkdown(content)}
                remarkPlugins={[
                    remarkGfm,
                    remarkBreaks,
                    remarkDisableLonelyOrderedList
                ]}
                rehypePlugins={[
                    rehypeRaw,
                    [rehypeSanitize, SANITIZE_SCHEMA]
                ]}
                components={renderMarkdownComponents}
            />
        </div>
    );
}