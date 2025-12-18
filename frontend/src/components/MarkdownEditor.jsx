import { useState, useRef, useEffect } from 'react';
import {
    FileText, Save, X, Bold, Italic, Heading,
    Link as LinkIcon, Image, List, Code, Video, Music, Copy, Check
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

const SUPPORTED_FILE_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/mkv'],
    audio: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac'],
    archive: [
        'application/zip', 'application/x-rar-compressed',
        'application/x-tar', 'application/gzip',
        'application/x-xz', 'application/x-7z-compressed',
        'application/x-zip-compressed',
        'application/x-compressed',
        'application/x-gzip'
    ]
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
    { type: 'archive', icon: FileText, title: '插入压缩包', isFile: true },
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
    const [title, setTitle] = useState(initialData?.article_name || '');
    const [content, setContent] = useState(initialData?.article_content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showArticleInfo, setShowArticleInfo] = useState(false);
    const [articleInfo, setArticleInfo] = useState(null);
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const uploadingFiles = useRef(new Set());
    const savedSelectionRef = useRef({ start: 0, end: 0 });
    const uploadPositionsRef = useRef(new Map());
    const headingMenuRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.article_name || '');
            setContent(initialData.article_content || '');
        }
    }, [initialData]);

    useEffect(() => {
        const handlePaste = async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const files = [];
            for (const item of items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file) {
                        files.push(file);
                    }
                }
            }

            if (files.length > 0) {
                e.preventDefault();

                const textarea = textareaRef.current;
                const initialPosition = textarea ? textarea.selectionStart : 0;

                let currentOffset = 0;
                for (const file of files) {
                    const result = await processFileWithOffset(file, initialPosition + currentOffset);
                    if (result && result.content) {
                        currentOffset += result.content.length;
                    }
                }
            }
        };

        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const textarea = textareaRef.current;
                const initialPosition = textarea ? textarea.selectionStart : 0;

                let currentOffset = 0;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file) {
                        const result = await processFileWithOffset(file, initialPosition + currentOffset);
                        if (result && result.content) {
                            currentOffset += result.content.length;
                        }
                    }
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
        textarea?.addEventListener('dragover', handleDragOver);
        textarea?.addEventListener('drop', handleDrop);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            textarea?.removeEventListener('paste', handlePaste);
            textarea?.removeEventListener('dragover', handleDragOver);
            textarea?.removeEventListener('drop', handleDrop);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [content]);

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空');
            return;
        }

        let defaultCover = initialData?.article_cover || '';

        if (!initialData?.article_id && !defaultCover) {
            const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
            const match = content.match(imageRegex);
            if (match && match[2]) {
                const imageUrl = match[2];
                if (isSafeUrl(imageUrl)) {
                    defaultCover = imageUrl;
                }
            }
        }

        setArticleInfo({
            title,
            content,
            id: initialData?.article_id,
            cover: defaultCover,
            excerpt: initialData?.excerpt || '',
            tags: initialData?.tag || initialData?.tags || [],
            category: initialData?.category || '',
            alias: initialData?.alias || '',
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
                excerpt: info.excerpt || '',
                password: info.password || '',
                tag: info.tags || '',
                category: info.category || '',
                alias: info.alias || '',
                status: 2,
                ...(info.id && { article_id: info.id })
            };

            const isUpdate = initialData && initialData.article_id;

            let response;
            if (isUpdate) {
                response = await apiClient.post('/updatearticle', payload);
            } else {
                response = await apiClient.post('/uploadarticle', payload);
            }

            if (response.success === true || response.message) {
                onSave(info);
            } else {
                throw new Error(response.message || response.error || '操作失败');
            }
        } catch (error) {
            console.error('保存失败:', error);
            let errorMessage = '请重试';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message && error.message !== '请重试') {
                errorMessage = error.message;
            }
            alert(`保存失败: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    const insertAtCursor = (text, selectedText = '', insertPosition = null) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        setContent(prevContent => {
            const startPos = insertPosition !== null ? insertPosition : textarea.selectionStart;
            const endPos = insertPosition !== null ? insertPosition : textarea.selectionEnd;

            const newValue = prevContent.substring(0, startPos) + text + prevContent.substring(endPos);
            return newValue;
        });

        if (insertPosition === null) {
            setTimeout(() => {
                textarea.focus();
                const startPos = textarea.selectionStart;
                if (selectedText) {
                    textarea.setSelectionRange(startPos, startPos + text.length);
                } else {
                    textarea.setSelectionRange(startPos + text.length, startPos + text.length);
                }
            }, 0);
        }
    };

    const processFile = async (file) => {
        if (!file || !isFileSupported(file.type)) {
            if (file && !isFileSupported(file.type)) {
                const errorMessage = `不支持的文件类型: ${file.type}\n\n仅支持: ${Object.values(SUPPORTED_FILE_TYPES).flat().join(', ')}`;
                alert(errorMessage);
            }
            return null;
        }

        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
        if (uploadingFiles.current.has(fileKey)) return null;

        const textarea = textareaRef.current;
        const insertPosition = textarea ? textarea.selectionStart : 0;

        uploadingFiles.current.add(fileKey);
        uploadPositionsRef.current.set(fileKey, insertPosition);
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
                    audio: `\n<audio src="${fullUrl}?filename=${encodeURIComponent(file.name)}" controls preload="metadata" data-filename="${file.name}"></audio>\n`,
                    archive: `\n<archive src="${fullUrl}?filename=${encodeURIComponent(file.name)}" data-filename="${file.name}"></archive>\n`
                };


                return {
                    content: snippets[mediaType] || null,
                    position: uploadPositionsRef.current.get(fileKey)
                };
            }
            return null;
        } catch (error) {
            alert('文件上传失败: ' + error.message);
            return null;
        } finally {
            uploadingFiles.current.delete(fileKey);
            uploadPositionsRef.current.delete(fileKey);

            if (uploadingFiles.current.size === 0) {
                setUploading(false);
            }
        }
    };

    const processFileWithOffset = async (file, insertPosition) => {
        if (!file || !isFileSupported(file.type)) {
            if (file && !isFileSupported(file.type)) {
                const errorMessage = `不支持的文件类型: ${file.type}\n\n仅支持: ${Object.values(SUPPORTED_FILE_TYPES).flat().join(', ')}`;
                alert(errorMessage);
            }
            return null;
        }

        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
        if (uploadingFiles.current.has(fileKey)) {
            console.log('文件正在上传中，跳过:', file.name);
            return null;
        }

        uploadingFiles.current.add(fileKey);
        uploadPositionsRef.current.set(fileKey, insertPosition);
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
                    audio: `\n<audio src="${fullUrl}?filename=${encodeURIComponent(file.name)}" controls preload="metadata" data-filename="${file.name}"></audio>\n`,
                    archive: `\n<archive src="${fullUrl}?filename=${encodeURIComponent(file.name)}" data-filename="${file.name}"></archive>\n`
                };

                const contentToInsert = snippets[mediaType] || null;

                if (contentToInsert) {
                    console.log('插入文件:', file.name, '位置:', insertPosition, '内容长度:', contentToInsert.length);
                    insertAtCursor(contentToInsert, '', insertPosition);

                    return {
                        content: contentToInsert,
                        position: insertPosition
                    };
                } else {
                    console.warn('无法生成内容片段，mediaType:', mediaType);
                }
            } else {
                console.warn('文件上传返回空 URL:', file.name);
            }
            return null;
        } catch (error) {
            console.error('文件上传失败:', file.name, error);
            alert('文件上传失败: ' + error.message);
            return null;
        } finally {
            uploadingFiles.current.delete(fileKey);
            uploadPositionsRef.current.delete(fileKey);

            if (uploadingFiles.current.size === 0) {
                setUploading(false);
            }
        }
    };

    const normalUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/uploadattachment', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data?.fileUrl || response.fileUrl;
        } catch (error) {
            throw new Error('普通上传失败: ' + (error.response?.data?.error || error.message));
        }
    };

    const multipartUpload = async (file) => {
        const CHUNK_SIZE = 5 * 1024 * 1024;
        const chunks = Math.ceil(file.size / CHUNK_SIZE);

        try {
            const initResponse = await apiClient.post('/uploadattachment/init', {
                filename: file.name
            });
            const uploadId = initResponse.data?.uploadId || initResponse.uploadId;

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

            const completeResponse = await apiClient.post('/uploadattachment/complete', {
                uploadId,
                filename: file.name
            });
            const fileUrl = completeResponse.data?.fileUrl || completeResponse.fileUrl;

            return fileUrl;
        } catch (error) {
            throw new Error('分片上传失败: ' + (error.response?.data?.error || error.message));
        }
    };

    const processAndInsertFile = async (file) => {
        const result = await processFile(file);
        if (result && result.content) {
            insertAtCursor(result.content, '', result.position);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) processAndInsertFile(file);
        e.target.value = '';
    };

    const insertMarkdown = (type) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const selectedText = content.substring(startPos, endPos);

        let newText = '';

        switch(type) {
            case 'bold':
                newText = selectedText ? `**${selectedText}**` : '**粗体**';
                break;
            case 'italic':
                newText = selectedText ? `*${selectedText}*` : '*斜体*';
                break;
            case 'link':
                newText = selectedText ? `[${selectedText}](https://)` : '[描述](https://)';
                break;
            case 'image':
                newText = selectedText ? `![${selectedText}](https://)` : '![alt](https://)';
                break;
            case 'list':
                if (selectedText) {
                    const lines = selectedText.split('\n');
                    newText = lines.map(line => line.trim() ? `- ${line}` : '').join('\n');
                } else {
                    newText = '- 列表项';
                }
                break;
            case 'code':
                if (selectedText) {
                    if (selectedText.includes('\n')) {
                        newText = '\n```\n' + selectedText + '\n```\n';
                    } else {
                        newText = '`' + selectedText + '`';
                    }
                } else {
                    newText = '\n```js\nconsole.log("Hello World");\n```\n';
                }
                break;
            default:
                const snippet = MARKDOWN_SNIPPETS[type];
                if (snippet) {
                    newText = (content.endsWith('\n') || content === '' ? '' : '\n') + snippet;
                }
        }

        if (newText) {
            const beforeText = content.substring(0, startPos);
            const afterText = content.substring(endPos);
            const finalText = beforeText + newText + afterText;

            setContent(finalText);

            setTimeout(() => {
                textarea.focus();
                if (selectedText) {
                    if (type === 'bold') {
                        textarea.setSelectionRange(startPos + 2, startPos + 2 + selectedText.length);
                    } else if (type === 'italic' || type === 'code') {
                        textarea.setSelectionRange(startPos + 1, startPos + 1 + selectedText.length);
                    } else if (type === 'link') {
                        textarea.setSelectionRange(startPos + selectedText.length + 3, startPos + newText.length - 1);
                    } else {
                        textarea.setSelectionRange(startPos + newText.length, startPos + newText.length);
                    }
                } else {
                    if (type === 'bold') {
                        textarea.setSelectionRange(startPos + 2, startPos + 4);
                    } else if (type === 'italic') {
                        textarea.setSelectionRange(startPos + 1, startPos + 3);
                    } else {
                        textarea.setSelectionRange(startPos + newText.length, startPos + newText.length);
                    }
                }
            }, 0);
        }
    };

    const insertHeading = (headingText) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const startPos = savedSelectionRef.current.start;
        const endPos = savedSelectionRef.current.end;
        const selectedText = content.substring(startPos, endPos);

        const headingMark = headingText.match(/^#+/)?.[0] || '#';

        let newText;
        if (selectedText) {
            newText = '\n' + headingMark + ' ' + selectedText + '\n';
        } else {
            newText = '\n' + headingText + '\n';
        }

        const beforeText = content.substring(0, startPos);
        const afterText = content.substring(endPos);
        const finalText = beforeText + newText + afterText;

        setContent(finalText);
        setShowHeadingMenu(false);

        setTimeout(() => {
            textarea.focus();
            const hashCount = headingMark.length;
            const textStart = startPos + 1 + hashCount + 1;
            const textEnd = textStart + (selectedText || headingText.replace(/^#+\s+/, '')).length;
            textarea.setSelectionRange(textStart, textEnd);
        }, 0);
    };

    const handleToolbarClick = (buttonType) => {
        const button = TOOLBAR_BUTTONS.find(b => b.type === buttonType);

        if (button?.isFile) {
            handleFileSelect(buttonType);
            return;
        }

        if (buttonType === 'heading') {
            const textarea = textareaRef.current;
            if (textarea) {
                savedSelectionRef.current = {
                    start: textarea.selectionStart,
                    end: textarea.selectionEnd
                };
            }
            setShowHeadingMenu(prev => !prev);
            return;
        }

        insertMarkdown(buttonType);
    };

    const handleFileSelect = (fileType) => {
        if (!fileInputRef.current) return;

        let acceptTypes;
        if (fileType === 'image' || fileType === 'video' || fileType === 'audio' || fileType === 'archive') {
            acceptTypes = SUPPORTED_FILE_TYPES[fileType].join(',');
        } else {
            acceptTypes = Object.values(SUPPORTED_FILE_TYPES).flat().join(',');
        }

        fileInputRef.current.accept = acceptTypes;
        fileInputRef.current.click();
    };

    const handleCopyCode = async (code, index) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(index);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    const processLineBreaks = (text) => {
        const codeBlocks = [];
        const placeholder = '___CODE_BLOCK___';

        let processedText = text.replace(/```[\s\S]*?```/g, (match) => {
            codeBlocks.push(match);
            return `${placeholder}${codeBlocks.length - 1}${placeholder}`;
        });

        const inlineCodes = [];
        processedText = processedText.replace(/`[^`\n]+`/g, (match) => {
            inlineCodes.push(match);
            return `___INLINE_CODE___${inlineCodes.length - 1}___INLINE_CODE___`;
        });

        processedText = processedText
            .replace(/\n(\s*\n){2,}/g, (match) => {
                const newlines = match.match(/\n/g)?.length || 0;
                return '\n' + '&nbsp;\n'.repeat(newlines - 1);
            })
            .replace(/\n\s*\n/g, '\n\n&nbsp;\n')
            .replace(/\n/g, '  \n');

        inlineCodes.forEach((code, index) => {
            processedText = processedText.replace(
                `___INLINE_CODE___${index}___INLINE_CODE___`,
                code
            );
        });

        codeBlocks.forEach((block, index) => {
            processedText = processedText.replace(
                `${placeholder}${index}${placeholder}`,
                block
            );
        });

        return processedText;
    };

    const renderMarkdownComponents = {
        h1: (props) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 " {...props} />
        ),
        h2: (props) => (
            <h2 className="text-2xl font-bold mt-5 mb-3 " {...props} />
        ),
        h3: (props) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 " {...props} />
        ),
        h4: (props) => (
            <h4 className="text-lg font-semibold mt-3 mb-2 " {...props} />
        ),
        p: (props) => (
            <p className="mb-3 leading-relaxed text-gray-700 " {...props} />
        ),
        ul: (props) => (
            <ul className="list-disc list-inside mb-3 text-gray-700 " {...props} />
        ),
        ol: (props) => (
            <ol className="list-decimal list-inside mb-3 text-gray-700 " {...props} />
        ),
        li: (props) => (
            <li className="mb-1 text-gray-700 " {...props} />
        ),
        blockquote: (props) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-3 text-gray-600 " {...props} />
        ),
        table: (props) => (
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300" {...props} />
            </div>
        ),
        thead: (props) => (
            <thead className="bg-gray-100" {...props} />
        ),
        tbody: (props) => (
            <tbody {...props} />
        ),
        tr: (props) => (
            <tr {...props} />
        ),
        th: (props) => (
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900" {...props} />
        ),
        td: (props) => (
            <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
        ),
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
                    className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-white inline-block align-text-bottom max-w-full overflow-x-auto"
                    style={{
                        whiteSpace: 'pre',
                        scrollbarWidth: 'thin'
                    }}
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
                <div className="my-4 p-4 bg-gray-100  border border-gray-200 rounded-xl shadow-sm max-w-lg">
                    <div className="flex items-center mb-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <Music className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900  truncate" title={fileName}>
                                {fileName}
                            </div>
                            <div className="text-xs text-gray-500 ">
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
                            <div className="text-xs text-gray-500">
                                压缩文件
                            </div>
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
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
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
                <div className="w-1/2 flex flex-col border-r border-gray-200 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between border-b border-gray-200 bg-gray-50 px-2 markdown-editor-toolbar">
                        {TOOLBAR_BUTTONS.map((button) => (
                            <div key={button.type} className="relative flex-shrink-0">
                                <button
                                    onClick={() => handleToolbarClick(button.type)}
                                    title={button.title}
                                    className="p-2 sm:p-3 hover:bg-gray-100 rounded w-12 h-12 flex items-center justify-center sm:w-10 sm:h-10"
                                >
                                    <button.icon className="h-5 w-5 sm:h-4 sm:w-4" />
                                </button>

                                {button.type === 'heading' && showHeadingMenu && (
                                    <div
                                        ref={headingMenuRef}
                                        className="absolute top-full left-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10 heading-menu"
                                    >
                                        {['# 一级标题', '## 二级标题', '### 三级标题'].map((h, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => insertHeading(h)}
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
                        className="flex-1 p-4 focus:outline-none font-mono resize-none text-gray-900 bg-white "
                        spellCheck={false}
                    />
                </div>

                <div className="w-1/2 p-4 overflow-y-auto bg-white text-gray-900">
                    <ReactMarkdown
                        children={processLineBreaks(content)}
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