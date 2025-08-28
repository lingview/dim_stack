import { useState } from 'react';
import {
    FileText, Save, X, Bold, Italic, Heading,
    Link as LinkIcon, Image, List, Code
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function detectXSS(html) {
    const lower = html.toLowerCase();
    const patterns = [
        /<script.*?>/i,
        /on\w+\s*=/i,
        /javascript:/i,
        /data:text\/html/i
    ];
    return patterns.some(p => p.test(lower));
}


const schema = {
    ...defaultSchema,
    tagNames: [...defaultSchema.tagNames, 'iframe', 'video', 'source'],
    attributes: {
        ...defaultSchema.attributes,
        iframe: [
            ...(defaultSchema.attributes.iframe || []),
            'src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'
        ],
        video: [
            ...(defaultSchema.attributes.video || []),
            'src', 'controls', 'autoplay', 'loop', 'muted', 'poster'
        ],
        source: ['src', 'type']
    },
};

export default function MarkdownEditor({ onSave, onCancel, initialData }) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空');
            return;
        }

        if (detectXSS(content)) {
            alert('检测到潜在XSS攻击，已阻止保存！');
            return;
        }

        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            onSave({ title, content, id: initialData?.id });
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败，请重试');
        } finally {
            setIsSaving(false);
        }
    };

    const insertMarkdown = (syntax) => {
        let snippet = '';
        switch (syntax) {
            case 'bold': snippet = '**粗体**'; break;
            case 'italic': snippet = '*斜体*'; break;
            case 'heading': snippet = '# 标题'; break;
            case 'link': snippet = '[描述](https://)'; break;
            case 'image': snippet = '![alt](https://)'; break;
            case 'list': snippet = '- 列表项'; break;
            case 'code': snippet = '\n```js\nconsole.log("Hello World");\n```\n'; break;
            default: return;
        }
        setContent(prev => prev + (prev.endsWith('\n') ? '' : '\n') + snippet);
    };


    // 检查URL是否为安全来源（允许HTTP和HTTPS）
    const isSafeUrl = (url) => {
        if (!url) return false;
        return url.startsWith('http://') || url.startsWith('https://');
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* 顶部工具栏 */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="请输入文章标题"
                        className="text-xl font-semibold border-none focus:outline-none focus:ring-0 p-0"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onCancel}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    >
                        <X className="h-4 w-4 mr-1" />
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                    >
                        <Save className="h-4 w-4 mr-1" />
                        {isSaving ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>

            {/* 主体内容 */}
            <div className="flex-1 flex overflow-hidden">
                <div className="w-1/2 border-r border-gray-200 flex flex-col">
                    <div className="p-2 bg-gray-50 border-b border-gray-200 flex space-x-2 text-gray-600 text-sm">
                        <button onClick={() => insertMarkdown('bold')} className="hover:text-blue-600"><Bold className="h-4 w-4" /></button>
                        <button onClick={() => insertMarkdown('italic')} className="hover:text-blue-600"><Italic className="h-4 w-4" /></button>
                        <button onClick={() => insertMarkdown('heading')} className="hover:text-blue-600"><Heading className="h-4 w-4" /></button>
                        <button onClick={() => insertMarkdown('link')} className="hover:text-blue-600"><LinkIcon className="h-4 w-4" /></button>
                        <button onClick={() => insertMarkdown('image')} className="hover:text-blue-600"><Image className="h-4 w-4" /></button>
                        <button onClick={() => insertMarkdown('list')} className="hover:text-blue-600"><List className="h-4 w-4" /></button>
                        <button onClick={() => insertMarkdown('code')} className="hover:text-blue-600"><Code className="h-4 w-4" /></button>
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
                        placeholder="在此输入Markdown内容..."
                    />
                </div>

                {/* 预览区域 */}
                <div className="w-1/2 flex flex-col">
                    <div className="p-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                        预览
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto prose max-w-none">
                        <h1 className="text-2xl font-bold mb-4">{title}</h1>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[[rehypeRaw], [rehypeSanitize, schema]]}
                            components={{
                                h1: (props) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                                h2: (props) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
                                h3: (props) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                                h4: (props) => <h4 className="text-lg font-semibold mt-3 mb-2" {...props} />,
                                p: (props) => <p className="mb-3 leading-relaxed" {...props} />,
                                ul: (props) => <ul className="list-disc list-inside mb-3" {...props} />,
                                ol: (props) => <ol className="list-decimal list-inside mb-3" {...props} />,
                                li: (props) => <li className="mb-1" {...props} />,
                                blockquote: (props) => (
                                    <blockquote
                                        className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3"
                                        {...props}
                                    />
                                ),
                                code({ className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return match ? (
                                        <SyntaxHighlighter
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code
                                            className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    );
                                },
                                a: ({ href, children, ...props }) => {
                                    if (!href || !isSafeUrl(href)) return <span {...props}>{children}</span>;
                                    return (
                                        <a
                                            href={href}
                                            className="text-blue-600 hover:underline hover:text-blue-800"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            {...props}
                                        >
                                            {children}
                                        </a>
                                    );
                                },
                                iframe: ({ src, ...props }) => {
                                    if (!src || !isSafeUrl(src)) return null;
                                    return <iframe src={src} className="w-full h-64" {...props} />;
                                },
                                video: ({ src, controls, autoplay, loop, muted, poster, ...props }) => {
                                    if (!src || !isSafeUrl(src)) return null;
                                    return (
                                        <video
                                            src={src}
                                            controls={controls ?? true}
                                            autoPlay={autoplay ?? false}
                                            loop={loop ?? false}
                                            muted={muted ?? false}
                                            poster={poster}
                                            className="w-full"
                                            {...props}
                                        />
                                    );
                                },
                                source: ({ src, type, ...props }) => {
                                    if (!src || !isSafeUrl(src)) return null;
                                    return <source src={src} type={type} {...props} />;
                                },
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}