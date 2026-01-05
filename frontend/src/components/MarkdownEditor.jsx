import { useState, useRef, useEffect } from 'react';
import { FileText, Save, X } from 'lucide-react';
import MarkdownToolbar from './MarkdownToolbar';
import MarkdownTextarea from './MarkdownTextarea';
import MarkdownPreview from './MarkdownPreview';
import ArticleInfoForm from './ArticleInfoForm';
import { useFileUpload } from '../hooks/useFileUpload';
import { isSafeUrl } from '../utils/markdownUtils';
import apiClient from '../utils/axios';
import { getConfig } from '../utils/config';

const MARKDOWN_SNIPPETS = {
    bold: '**粗体**',
    italic: '*斜体*',
    link: '[描述](https://)',
    image: '![alt](https://)',
    list: '- 列表项',
    code: '\n```js\nconsole.log("Hello World");\n```\n'
};

export default function MarkdownEditor({ onSave, onCancel, initialData }) {
    const [title, setTitle] = useState(initialData?.article_name || '');
    const [content, setContent] = useState(initialData?.article_content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showArticleInfo, setShowArticleInfo] = useState(false);
    const [articleInfo, setArticleInfo] = useState(null);
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const savedSelectionRef = useRef({ start: 0, end: 0 });

    const { uploading, processFile, SUPPORTED_FILE_TYPES } = useFileUpload(apiClient, getConfig);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.article_name || '');
            setContent(initialData.article_content || '');
        }
    }, [initialData]);

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
            return prevContent.substring(0, startPos) + text + prevContent.substring(endPos);
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
                {
                    const snippet = MARKDOWN_SNIPPETS[type];
                    if (snippet) {
                        newText = (content.endsWith('\n') || content === '' ? '' : '\n') + snippet;
                    }
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
        if (buttonType === 'image' || buttonType === 'video' || buttonType === 'audio' || buttonType === 'archive') {
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

    const processAndInsertFile = async (file, insertPosition) => {
        const result = await processFile(file, insertPosition);
        if (result && result.content) {
            insertAtCursor(result.content, '', result.position);
        }
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files = [];
        for (const item of items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }

        if (files.length > 0) {
            e.preventDefault();
            const textarea = textareaRef.current;
            const initialPosition = textarea ? textarea.selectionStart : 0;

            let currentOffset = 0;
            for (const file of files) {
                const result = await processFile(file, initialPosition + currentOffset);
                if (result && result.content) {
                    insertAtCursor(result.content, '', result.position);
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
                    const result = await processFile(file, initialPosition + currentOffset);
                    if (result && result.content) {
                        insertAtCursor(result.content, '', result.position);
                        currentOffset += result.content.length;
                    }
                }
            }
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const textarea = textareaRef.current;
            const insertPosition = textarea ? textarea.selectionStart : 0;
            processAndInsertFile(file, insertPosition);
        }
        e.target.value = '';
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
                    <MarkdownToolbar
                        onToolbarClick={handleToolbarClick}
                        showHeadingMenu={showHeadingMenu}
                        onHeadingSelect={insertHeading}
                        onHeadingMenuClose={() => setShowHeadingMenu(false)}
                    />
                    <MarkdownTextarea
                        ref={textareaRef}
                        content={content}
                        onChange={(e) => setContent(e.target.value)}
                        onPaste={handlePaste}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                </div>

                <MarkdownPreview content={content} />
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