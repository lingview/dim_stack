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

const SUPPORTED_FILE_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/mkv'],
    audio: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac']
};

const isFileTypeSupported = (fileType) => {
    return Object.values(SUPPORTED_FILE_TYPES).some(types => types.includes(fileType));
};

const getMediaType = (fileType) => {
    for (const [type, mimes] of Object.entries(SUPPORTED_FILE_TYPES)) {
        if (mimes.includes(fileType)) {
            return type;
        }
    }
    return null;
};

export default function MarkdownEditor({ onSave, onCancel, initialData }) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const uploadingFiles = useRef(new Set());

    useEffect(() => {
        const handlePaste = async (e) => {
            if (!e.clipboardData) return;

            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file') {
                    e.preventDefault();
                    const file = items[i].getAsFile();
                    if (file) {
                        await handleFileUpload(file);
                    }
                    break;
                }
            }
        };

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.addEventListener('paste', handlePaste);
            return () => textarea.removeEventListener('paste', handlePaste);
        }
    }, []);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空');
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

    const handleFileSelect = (fileType) => {
        if (!fileInputRef.current) return;

        let acceptTypes = '';
        switch (fileType) {
            case 'image':
                acceptTypes = SUPPORTED_FILE_TYPES.image.join(',');
                break;
            case 'video':
                acceptTypes = SUPPORTED_FILE_TYPES.video.join(',');
                break;
            case 'audio':
                acceptTypes = SUPPORTED_FILE_TYPES.audio.join(',');
                break;
            default:
                acceptTypes = Object.values(SUPPORTED_FILE_TYPES).flat().join(',');
        }

        fileInputRef.current.accept = acceptTypes;
        fileInputRef.current.click();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
        e.target.value = '';
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        if (!isFileTypeSupported(file.type)) {
            const supportedTypes = Object.values(SUPPORTED_FILE_TYPES).flat().join(', ');
            alert(`不支持的文件类型: ${file.type}\n\n仅支持以下类型:\n${supportedTypes}`);
            return;
        }

        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;

        if (uploadingFiles.current.has(fileKey)) {
            console.log('文件正在上传中，跳过重复请求');
            return;
        }

        uploadingFiles.current.add(fileKey);
        setUploading(true);

        try {
            let fileUrl;

            if (file.size > 10 * 1024 * 1024) {
                fileUrl = await multipartUpload(file);
            } else {
                fileUrl = await normalUpload(file);
            }

            if (fileUrl) {
                const config = getConfig();
                const fullUrl = config.getFullUrl(fileUrl);

                const mediaType = getMediaType(file.type);
                let markdownSnippet = '';

                if (mediaType === 'image') {
                    markdownSnippet = `\n![${file.name}](${fullUrl})\n`;
                } else if (mediaType === 'video') {
                    markdownSnippet = `\n<video src="${fullUrl}" controls style="max-width: 100%; height: auto;"></video>\n`;
                } else if (mediaType === 'audio') {
                    markdownSnippet = `\n<audio src="${fullUrl}" controls preload="metadata"></audio>\n`;
                }

                setContent(prev => prev + markdownSnippet);
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
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.fileUrl;
        } catch (error) {
            throw new Error('普通上传失败: ' + (error.response?.data?.error || error.message));
        }
    };

    const multipartUpload = async (file) => {
        const CHUNK_SIZE = 5 * 1024 * 1024;
        const chunks = Math.ceil(file.size / CHUNK_SIZE);
        let uploadId = null;

        try {
            const initResponse = await apiClient.post('/uploadattachment/init', {
                filename: file.name
            });

            uploadId = initResponse.uploadId;
            console.log(`开始分片上传，uploadId: ${uploadId}, 总分片数: ${chunks}`);

            for (let i = 0; i < chunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                console.log(`上传分片 ${i + 1}/${chunks}, 大小: ${chunk.size} bytes`);

                await apiClient.post('/uploadattachment/part', chunk, {
                    headers: {
                        'Upload-Id': uploadId,
                        'Chunk-Index': i,
                        'Content-Type': 'application/octet-stream'
                    }
                });
            }

            console.log('所有分片上传完成，开始合并...');
            const completeResponse = await apiClient.post('/uploadattachment/complete', {
                uploadId,
                filename: file.name
            });

            console.log(`分片上传完成，文件URL: ${completeResponse.fileUrl}`);
            return completeResponse.fileUrl;

        } catch (error) {
            console.error('分片上传失败:', error);
            throw new Error('分片上传失败: ' + (error.response?.data?.error || error.message));
        }
    };

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
                    {uploading && (
                        <div className="text-sm text-blue-600">文件上传中...</div>
                    )}
                    <button
                        onClick={onCancel}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    >
                        <X className="h-4 w-4 mr-1" />
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || uploading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                    >
                        <Save className="h-4 w-4 mr-1" />
                        {isSaving ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-1/2 border-r border-gray-200 flex flex-col">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex space-x-3 text-gray-600">
                        <button
                            onClick={() => insertMarkdown('bold')}
                            className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="粗体"
                        >
                            <Bold className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => insertMarkdown('italic')}
                            className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="斜体"
                        >
                            <Italic className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => insertMarkdown('heading')}
                            className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="标题"
                        >
                            <Heading className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => insertMarkdown('link')}
                            className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="链接"
                        >
                            <LinkIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => handleFileSelect('image')}
                            className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="插入图片"
                        >
                            <Image className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => handleFileSelect('video')}
                            className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="插入视频"
                        >
                            <Video className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => handleFileSelect('audio')}
                            className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="插入音频"
                        >
                            <Music className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => insertMarkdown('list')}
                            className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="列表"
                        >
                            <List className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => insertMarkdown('code')}
                            className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="代码"
                        >
                            <Code className="h-5 w-5" />
                        </button>
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
                        placeholder="在此输入Markdown内容...&#10;&#10;提示：可以直接粘贴图片/视频/音频文件进行上传&#10;支持格式：图片(jpg,png,gif,webp等)、视频(mp4,webm,mov等)、音频(mp3,wav,m4a等)&#10;&#10;HTML标签示例：&#10;&lt;script&gt;alert('Hello')&lt;/script&gt; 会显示为普通文本&#10;&lt;video src='url' controls&gt;&lt;/video&gt; 会正常渲染视频&#10;&lt;audio src='url' controls&gt;&lt;/audio&gt; 会正常渲染音频&#10;只有安全的媒体标签会被渲染，脚本标签显示为文本"
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                    />
                </div>

                <div className="w-1/2 flex flex-col">
                    <div className="p-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                        预览 (支持安全媒体标签渲染，脚本标签显示为文本)
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto prose max-w-none">
                        <h1 className="text-2xl font-bold mb-4">{title}</h1>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[
                                rehypeRaw,
                                [rehypeSanitize, {
                                    tagNames: [
                                        'div', 'span', 'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
                                        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                                        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
                                        'blockquote', 'pre', 'code',
                                        'table', 'thead', 'tbody', 'tr', 'th', 'td',
                                        'a', 'img',
                                        'video', 'audio', 'source', 'track', // 允许媒体标签
                                        'hr', 'sup', 'sub'
                                    ],
                                    attributes: {
                                        '*': ['className'],
                                        'a': ['href', 'title', 'target', 'rel'],
                                        'img': ['src', 'alt', 'title', 'width', 'height'],
                                        'video': ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'width', 'height', 'preload'],
                                        'audio': ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload'],
                                        'source': ['src', 'type', 'media'],
                                        'track': ['src', 'kind', 'srclang', 'label', 'default']
                                    }
                                }]
                            ]}
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
                                img: ({ src, alt, ...props }) => {
                                    if (!src || !isSafeUrl(src)) return null;
                                    return (
                                        <img
                                            src={src}
                                            alt={alt}
                                            className="rounded-lg shadow-sm my-4 block"
                                            style={{
                                                maxHeight: '300px',
                                                maxWidth: '500px',
                                                height: 'auto',
                                                width: 'auto',
                                                objectFit: 'contain',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(src, '_blank')}
                                            title="点击查看大图"
                                            {...props}
                                        />
                                    );
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
                                            className="rounded-lg shadow-sm my-4 block"
                                            style={{
                                                maxHeight: '300px',
                                                maxWidth: '500px',
                                                height: 'auto',
                                                width: 'auto',
                                                objectFit: 'contain'
                                            }}
                                            {...props}
                                        />
                                    );
                                },
                                audio: ({ src, controls, autoplay, loop, muted, preload, ...props }) => {
                                    if (!src || !isSafeUrl(src)) return null;
                                    const fileName = src.split('/').pop()?.split('?')[0] || '音频文件';

                                    return (
                                        <span className="inline-block my-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm" style={{ maxWidth: '500px', display: 'block' }}>
                                            <span className="flex items-center mb-3">
                                                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                                    <Music className="h-4 w-4 text-white" />
                                                </span>
                                                <span className="flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-gray-900 truncate block" title={fileName}>
                                                        {fileName}
                                                    </span>
                                                    <span className="text-xs text-gray-500 block">音频文件</span>
                                                </span>
                                            </span>
                                            <audio
                                                src={src}
                                                controls={controls ?? true}
                                                autoPlay={autoplay ?? false}
                                                loop={loop ?? false}
                                                muted={muted ?? false}
                                                preload={preload ?? 'metadata'}
                                                className="w-full rounded-md"
                                                style={{ height: '40px', outline: 'none' }}
                                                {...props}
                                            />
                                        </span>
                                    );
                                },
                                source: ({ src, type, ...props }) => {
                                    if (!src || !isSafeUrl(src)) return null;
                                    return <source src={src} type={type} {...props} />;
                                }
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