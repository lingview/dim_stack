import { useState, useRef, useEffect } from 'react';
import {
    FileText, Save, X, Bold, Italic, Heading,
    Link as LinkIcon, Image, List, Code, Video, Music
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import apiClient from '../utils/axios';
import { getConfig } from '../utils/config';
import ArticleInfoForm from './ArticleInfoForm';

const rehypeSanitizeSchema = {
    tagNames: [
        'div','span','p','br','strong','em','u','s','del','ins',
        'h1','h2','h3','h4','h5','h6',
        'ul','ol','li','dl','dt','dd',
        'blockquote','pre','code',
        'table','thead','tbody','tr','th','td',
        'a','img','video','audio','source','track',
        'hr','sup','sub'
    ],
    attributes: {
        '*': ['className', 'id', 'style'],
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'video': ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'width', 'height', 'preload'],
        'audio': ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload'],
        'source': ['src', 'type', 'media'],
        'track': ['src', 'kind', 'srclang', 'label', 'default']
    }
};

const SUPPORTED_FILE_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/mkv'],
    audio: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac']
};

const MARKDOWN_SNIPPETS = {
    bold: '**粗体**',
    italic: '*斜体*',
    link: '[描述](https://)',
    image: '![alt](https://)',
    list: '- 列表项',
    code: '\n```js\nconsole.log("Hello World");\n```\n'
};

const TOOLBAR_BUTTONS = [
    { type: 'bold', icon: Bold, title: '粗体' },
    { type: 'italic', icon: Italic, title: '斜体' },
    { type: 'heading', icon: Heading, title: '标题' },
    { type: 'link', icon: LinkIcon, title: '链接' },
    { type: 'image', icon: Image, title: '插入图片', isFile: true },
    { type: 'video', icon: Video, title: '插入视频', isFile: true },
    { type: 'audio', icon: Music, title: '插入音频', isFile: true },
    { type: 'list', icon: List, title: '列表' },
    { type: 'code', icon: Code, title: '代码' }
];

const getMediaType = (fileType) => {
    for (const [type, mimes] of Object.entries(SUPPORTED_FILE_TYPES)) {
        if (mimes.includes(fileType)) return type;
    }
    return null;
};

const isFileSupported = (fileType) => Object.values(SUPPORTED_FILE_TYPES).flat().includes(fileType);

const isSafeUrl = (url) => url && (url.startsWith('http://') || url.startsWith('https://'));

export default function MarkdownEditor({ onSave, onCancel, initialData }) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showArticleInfo, setShowArticleInfo] = useState(false);
    const [articleInfo, setArticleInfo] = useState(null);

    const [showHeadingMenu, setShowHeadingMenu] = useState(false);
    const headingMenuRef = useRef(null);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const uploadingFiles = useRef(new Set());

    useEffect(() => {
        const handlePaste = async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.kind === 'file') {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) await handleFileUpload(file);
                    break;
                }
            }
        };

        const handleClickOutside = (e) => {
            if (headingMenuRef.current && !headingMenuRef.current.contains(e.target)) {
                setShowHeadingMenu(false);
            }
        };

        const textarea = textareaRef.current;
        textarea?.addEventListener('paste', handlePaste);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            textarea?.removeEventListener('paste', handlePaste);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空');
            return;
        }

        setArticleInfo({
            title,
            content,
            id: initialData?.id,
            password: initialData?.password || ''
        });
        setShowArticleInfo(true);
    };

    const handleArticleInfoSave = async (info) => {
        setIsSaving(true);
        setShowArticleInfo(false);

        try {
            const payload = {
                article_name: info.title,
                article_content: info.content,
                article_cover: info.cover || '',
                password: info.password || '',
                tag: info.tags || '',
                category: info.category || '',
                alias: info.alias || '',
                status: 2,
                ...(info.id && { article_id: info.id })
            };

            await apiClient.post('/uploadarticle', payload);
            onSave(info);
        } catch (error) {
            console.error('保存失败:', error);
            alert(`保存失败: ${error.response?.data?.error || '请重试'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const insertMarkdown = (type) => {
        const snippet = MARKDOWN_SNIPPETS[type];
        if (snippet) {
            setContent(prev => prev + (prev.endsWith('\n') ? '' : '\n') + snippet);
        }
    };

    const handleToolbarClick = (buttonType) => {
        const button = TOOLBAR_BUTTONS.find(b => b.type === buttonType);
        if (button?.isFile) {
            handleFileSelect(buttonType);
        } else if (buttonType === 'heading') {
            setShowHeadingMenu(prev => !prev);
        } else {
            insertMarkdown(buttonType);
        }
    };


    const handleFileSelect = (fileType) => {
        if (!fileInputRef.current) return;

        const acceptTypes = fileType === 'image' || fileType === 'video' || fileType === 'audio'
            ? SUPPORTED_FILE_TYPES[fileType].join(',')
            : Object.values(SUPPORTED_FILE_TYPES).flat().join(',');

        fileInputRef.current.accept = acceptTypes;
        fileInputRef.current.click();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
        e.target.value = '';
    };

    const handleFileUpload = async (file) => {
        if (!file || !isFileSupported(file.type)) {
            if (!isFileSupported(file.type)) {
                alert(`不支持的文件类型: ${file.type}\n\n仅支持: ${Object.values(SUPPORTED_FILE_TYPES).flat().join(', ')}`);
            }
            return;
        }

        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
        if (uploadingFiles.current.has(fileKey)) return;

        uploadingFiles.current.add(fileKey);
        setUploading(true);

        try {
            const fileUrl = file.size > 10 * 1024 * 1024
                ? await multipartUpload(file)
                : await normalUpload(file);

            if (fileUrl) {
                const fullUrl = getConfig().getFullUrl(fileUrl);
                const mediaType = getMediaType(file.type);

                const snippets = {
                    image: `\n![${file.name}](${fullUrl})\n`,
                    video: `\n<video src="${fullUrl}" controls style="width: 400px;"></video>\n`,
                    audio: `\n<audio src="${fullUrl}" controls preload="metadata"></audio>\n`
                };

                const snippet = snippets[mediaType];
                if (snippet) setContent(prev => prev + snippet);
            }
        } catch (error) {
            console.error('上传失败:', error);
            alert('文件上传失败: ' + error.message);
        } finally {
            uploadingFiles.current.delete(fileKey);
            setUploading(false);
        }
    };

    const normalUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/uploadattachment', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.fileUrl;
        } catch (error) {
            throw new Error('普通上传失败: ' + (error.response?.data?.error || error.message));
        }
    };

    const multipartUpload = async (file) => {
        const CHUNK_SIZE = 5 * 1024 * 1024;
        const chunks = Math.ceil(file.size / CHUNK_SIZE);

        try {
            const { uploadId } = await apiClient.post('/uploadattachment/init', {
                filename: file.name
            });

            for (let i = 0; i < chunks; i++) {
                const start = i * CHUNK_SIZE;
                const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));

                await apiClient.post('/uploadattachment/part', chunk, {
                    headers: {
                        'Upload-Id': uploadId,
                        'Chunk-Index': i,
                        'Content-Type': 'application/octet-stream'
                    }
                });
            }

            const { fileUrl } = await apiClient.post('/uploadattachment/complete', {
                uploadId,
                filename: file.name
            });

            return fileUrl;
        } catch (error) {
            throw new Error('分片上传失败: ' + (error.response?.data?.error || error.message));
        }
    };

    const renderMarkdownComponents = {
        h1: (props) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 text-gray-900 dark:text-white" {...props} />
        ),
        h2: (props) => (
            <h2 className="text-2xl font-bold mt-5 mb-3 text-gray-900 dark:text-white" {...props} />
        ),
        h3: (props) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white" {...props} />
        ),
        h4: (props) => (
            <h4 className="text-lg font-semibold mt-3 mb-2 text-gray-900 dark:text-white" {...props} />
        ),
        p: (props) => (
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />
        ),
        ul: (props) => (
            <ul className="list-disc list-inside mb-3 text-gray-700 dark:text-gray-300" {...props} />
        ),
        ol: (props) => (
            <ol className="list-decimal list-inside mb-3 text-gray-700 dark:text-gray-300" {...props} />
        ),
        li: (props) => (
            <li className="mb-1 text-gray-700 dark:text-gray-300" {...props} />
        ),
        blockquote: (props) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-3 text-gray-600 dark:text-gray-400" {...props} />
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
                    className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-white"
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
                    className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-500 dark:hover:text-blue-300"
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
                    className="rounded-lg shadow-sm my-4 block cursor-pointer border border-gray-200 dark:border-gray-600"
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
            const fileName = src.split("/").pop()?.split("?")[0] || "音频文件";

            return (
                <div className="inline-block my-4 p-4 bg-gray-100 dark:bg-gradient-to-r dark:from-blue-900 dark:to-purple-900 border border-gray-200 dark:border-blue-700 rounded-xl shadow-sm max-w-lg">
                    <div className="flex items-center mb-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <Music className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={fileName}>
                                {fileName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                音频文件
                            </div>
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
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header */}
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
                    {uploading && <div className="text-sm text-blue-600">文件上传中...</div>}
                    <button
                        onClick={onCancel}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <X className="h-4 w-4 mr-1" />
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || uploading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <Save className="h-4 w-4 mr-1" />
                        {isSaving ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Editor */}
                <div className="w-1/2 flex flex-col border-r border-gray-200 overflow-hidden">
                    <div className="flex items-center border-b border-gray-200 bg-gray-50 px-2">
                        {TOOLBAR_BUTTONS.map((button) => (
                            <div key={button.type} className="relative">
                                <button
                                    onClick={() => handleToolbarClick(button.type)}
                                    title={button.title}
                                    className="p-2 hover:bg-gray-100 rounded"
                                >
                                    <button.icon className="h-5 w-5" />
                                </button>
                                {button.type === 'heading' && showHeadingMenu && (
                                    <div
                                        ref={headingMenuRef}
                                        className="absolute top-full left-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                                    >
                                        {['# 一级标题', '## 二级标题', '### 三级标题'].map((h, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setContent(prev => prev + '\n' + h + '\n');
                                                    setShowHeadingMenu(false);
                                                }}
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
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="在此输入 Markdown 内容..."
                        className="flex-1 p-4 focus:outline-none font-mono resize-none text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                        spellCheck={false}
                    />
                </div>

                {/* Preview */}
                <div className="w-1/2 p-4 overflow-y-auto bg-white dark:bg-gray-900">
                    <ReactMarkdown
                        children={content}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, [rehypeSanitize, rehypeSanitizeSchema]]}
                        components={renderMarkdownComponents}
                    />
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileInputChange}
            />

            {showArticleInfo && (
                <ArticleInfoForm
                    articleData={articleInfo}
                    onSave={handleArticleInfoSave}
                    onCancel={() => setShowArticleInfo(false)}
                    uploading={isSaving}
                />
            )}
        </div>
    );
}
