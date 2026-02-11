import { useState, useRef, useEffect } from 'react';
import { FileText, Save, X, Link, Unlink } from 'lucide-react';
import MarkdownToolbar from './MarkdownToolbar';
import MarkdownTextarea from './MarkdownTextarea';
import MarkdownPreview from './MarkdownPreview';
import ArticleInfoForm from './ArticleInfoForm';
import TextSelectionToolbar from './TextSelectionToolbar';
import { useFileUpload } from '../hooks/useFileUpload';
import { isSafeUrl } from '../utils/markdownUtils';
import { detectTextFormats, detectContextFormats, determineFormatAction } from '../utils/formatDetectionUtils';
import apiClient from '../utils/axios';
import { getConfig } from '../utils/config';

class HistoryManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = 100;
    }

    saveState(content, title) {
        const state = {
            content,
            title,
            timestamp: Date.now()
        };

        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        this.history.push(state);
        this.currentIndex++;

        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.currentIndex--;
        }
    }

    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            const state = this.history[this.currentIndex];
            return state;
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            const state = this.history[this.currentIndex];
            return state;
        }
        return null;
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    getCurrentState() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return this.history[this.currentIndex];
        }
        return null;
    }
}

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
    const [showSelectionToolbar, setShowSelectionToolbar] = useState(false);
    const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
    const [selectedTextInfo, setSelectedTextInfo] = useState(null);
    const [detectedFormats, setDetectedFormats] = useState(null);
    const [syncScrollEnabled, setSyncScrollEnabled] = useState(false);

    const historyManagerRef = useRef(new HistoryManager());
    const isProcessingHistoryRef = useRef(false);

    const textareaRef = useRef(null);
    const previewRef = useRef(null);
    const fileInputRef = useRef(null);
    const savedSelectionRef = useRef({ start: 0, end: 0 });
    const isSyncingScrollRef = useRef(false);

    const { uploading, processFile, SUPPORTED_FILE_TYPES } = useFileUpload(apiClient, getConfig);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.article_name || '');
            setContent(initialData.article_content || '');
            historyManagerRef.current.saveState(
                initialData.article_content || '',
                initialData.article_name || ''
            );
        } else {
            historyManagerRef.current.saveState('', '');
        }
    }, [initialData]);

    useEffect(() => {
        if (!isProcessingHistoryRef.current) {
            const currentState = historyManagerRef.current.getCurrentState();
            if (!currentState || 
                currentState.content !== content || 
                currentState.title !== title) {
                historyManagerRef.current.saveState(content, title);
            }
        }
    }, [content, title]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
                return;
            }
            else if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || 
                     (e.ctrlKey && e.key === 'y')) {
                e.preventDefault();
                handleRedo();
                return;
            }

            if (document.activeElement === textareaRef.current) {
                if (e.ctrlKey && e.key === 'b') {
                    e.preventDefault();
                    insertMarkdown('bold');
                } else if (e.ctrlKey && e.key === 'i') {
                    e.preventDefault();
                    insertMarkdown('italic');
                } else if (e.ctrlKey && e.key === 'k') {
                    e.preventDefault();
                    insertMarkdown('link');
                } else if (e.ctrlKey && e.key === 'e') {
                    e.preventDefault();
                    insertMarkdown('code');
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [content]);

    useEffect(() => {
        const editor = textareaRef.current;
        const preview = previewRef.current;
        
        if (!editor || !preview || !syncScrollEnabled) return;

        const handleEditorScroll = () => {
            if (isSyncingScrollRef.current) return;
            
            isSyncingScrollRef.current = true;
            
            const editorScrollTop = editor.scrollTop;
            const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
            const editorScrollRatio = editorScrollHeight > 0 ? editorScrollTop / editorScrollHeight : 0;
            
            const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
            const previewScrollTop = previewScrollHeight * editorScrollRatio;
            
            preview.scrollTop = Math.max(0, Math.min(previewScrollTop, previewScrollHeight));
            
            setTimeout(() => {
                isSyncingScrollRef.current = false;
            }, 16);
        };

        const handlePreviewScroll = () => {
            if (isSyncingScrollRef.current) return;
            
            isSyncingScrollRef.current = true;
            
            const previewScrollTop = preview.scrollTop;
            const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
            const previewScrollRatio = previewScrollHeight > 0 ? previewScrollTop / previewScrollHeight : 0;
            
            const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
            const editorScrollTop = editorScrollHeight * previewScrollRatio;
            
            editor.scrollTop = Math.max(0, Math.min(editorScrollTop, editorScrollHeight));
            
            setTimeout(() => {
                isSyncingScrollRef.current = false;
            }, 16);
        };

        let throttleTimer = null;
        const throttledEditorScroll = () => {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                handleEditorScroll();
                throttleTimer = null;
            }, 16);
        };

        let throttlePreviewTimer = null;
        const throttledPreviewScroll = () => {
            if (throttlePreviewTimer) return;
            throttlePreviewTimer = setTimeout(() => {
                handlePreviewScroll();
                throttlePreviewTimer = null;
            }, 16);
        };

        editor.addEventListener('scroll', throttledEditorScroll);
        preview.addEventListener('scroll', throttledPreviewScroll);

        return () => {
            editor.removeEventListener('scroll', throttledEditorScroll);
            preview.removeEventListener('scroll', throttledPreviewScroll);
            if (throttleTimer) clearTimeout(throttleTimer);
            if (throttlePreviewTimer) clearTimeout(throttlePreviewTimer);
        };
    });

    const handleUndo = () => {
        const prevState = historyManagerRef.current.undo();
        if (prevState) {
            isProcessingHistoryRef.current = true;
            setTitle(prevState.title);
            setContent(prevState.content);
            setTimeout(() => {
                if (textareaRef.current) {
                    const endPos = prevState.content.length;
                    textareaRef.current.setSelectionRange(endPos, endPos);
                    textareaRef.current.focus();
                }
                isProcessingHistoryRef.current = false;
            }, 0);
        }
    };

    const handleRedo = () => {
        const nextState = historyManagerRef.current.redo();
        if (nextState) {
            isProcessingHistoryRef.current = true;
            setTitle(nextState.title);
            setContent(nextState.content);
            setTimeout(() => {
                if (textareaRef.current) {
                    const endPos = nextState.content.length;
                    textareaRef.current.setSelectionRange(endPos, endPos);
                    textareaRef.current.focus();
                }
                isProcessingHistoryRef.current = false;
            }, 0);
        }
    };

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
            const currentScrollTop = textarea.scrollTop;
            
            const beforeText = content.substring(0, startPos);
            const afterText = content.substring(endPos);
            const finalText = beforeText + newText + afterText;

            setContent(finalText);

            setTimeout(() => {
                if (textarea) {
                    textarea.scrollTop = currentScrollTop;
                    
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

                    textarea.scrollTop = currentScrollTop;
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

        const currentScrollTop = textarea.scrollTop;
        
        const beforeText = content.substring(0, startPos);
        const afterText = content.substring(endPos);
        const finalText = beforeText + newText + afterText;

        setContent(finalText);
        setShowHeadingMenu(false);

        setTimeout(() => {
            if (textarea) {
                textarea.scrollTop = currentScrollTop;
                
                textarea.focus();
                const hashCount = headingMark.length;
                const textStart = startPos + 1 + hashCount + 1;
                const textEnd = textStart + (selectedText || headingText.replace(/^#+\s+/, '')).length;
                textarea.setSelectionRange(textStart, textEnd);
                textarea.scrollTop = currentScrollTop;
            }
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

    const checkTextSelection = (mouseEvent) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        if (selectionStart !== selectionEnd) {
            const selectedText = content.substring(selectionStart, selectionEnd);
            if (selectedText.trim()) {

                const textFormats = detectTextFormats(selectedText.trim());
                const contextFormats = detectContextFormats(content, selectionStart);

                setSelectedTextInfo({
                    start: selectionStart,
                    end: selectionEnd,
                    text: selectedText
                });
                
                setDetectedFormats({
                    textFormats,
                    contextFormats
                });

                let posX, posY;
                if (mouseEvent && mouseEvent.clientX !== undefined && mouseEvent.clientY !== undefined) {
                    posX = Math.max(0, Math.min(window.innerWidth, mouseEvent.clientX));
                    posY = Math.max(0, Math.min(window.innerHeight, mouseEvent.clientY)) - 40;
                } else {
                    const rect = textarea.getBoundingClientRect();
                    const textAreaStyle = window.getComputedStyle(textarea);
                    const paddingLeft = parseFloat(textAreaStyle.paddingLeft);
                    const paddingTop = parseFloat(textAreaStyle.paddingTop);
                    const fontSize = parseFloat(textAreaStyle.fontSize);
                    const lineHeight = parseFloat(textAreaStyle.lineHeight) || fontSize * 1.2;

                    const textBeforeSelection = content.substring(0, selectionStart);
                    const lines = textBeforeSelection.split('\n');
                    const currentLineIndex = lines.length - 1;
                    const charsInCurrentLine = lines[currentLineIndex].length;

                    const avgCharWidth = fontSize * 0.6;
                    const selectionLeft = paddingLeft + (charsInCurrentLine * avgCharWidth);
                    const selectionTop = paddingTop + (currentLineIndex * lineHeight);

                    posX = rect.left + selectionLeft;
                    posY = rect.top + selectionTop - 40;
                    posX = Math.max(0, Math.min(window.innerWidth, posX));
                    posY = Math.max(0, Math.min(window.innerHeight, posY));
                }

                const toolbarWidth = 150;
                const toolbarHeight = 50;
                const margin = 15;
                
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                if (posX < toolbarWidth/2 + margin) {
                    posX = toolbarWidth/2 + margin;
                } else if (posX > viewportWidth - toolbarWidth/2 - margin) {
                    posX = viewportWidth - toolbarWidth/2 - margin;
                }

                if (posY < toolbarHeight + margin) {
                    posY = toolbarHeight + margin;
                } else if (posY > viewportHeight - margin) {
                    posY = viewportHeight - margin;
                }
                
                setSelectionPosition({
                    x: posX,
                    y: posY
                });
                
                setShowSelectionToolbar(true);
                return;
            }
        }
        
        setShowSelectionToolbar(false);
        setSelectedTextInfo(null);
        setDetectedFormats(null);
    };

    useEffect(() => {
        const handleMouseUp = (e) => {
            if (textareaRef.current && textareaRef.current.contains(e.target)) {
                setTimeout(() => {
                    checkTextSelection(e);
                }, 50);
            }
        };

        const handleSelectionChange = () => {
            if (!showSelectionToolbar) {
                setTimeout(() => {
                    const textarea = textareaRef.current;
                    if (textarea && document.activeElement === textarea) {
                        const selectionStart = textarea.selectionStart;
                        const selectionEnd = textarea.selectionEnd;
                        if (selectionStart !== selectionEnd) {
                            checkTextSelection(null);
                        }
                    }
                }, 100);
            }
        };

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('selectionchange', handleSelectionChange);
        }

        return () => {
            if (textarea) {
                textarea.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('selectionchange', handleSelectionChange);
            }
        };
    }, [content, showSelectionToolbar]);

    const handleSelectionFormat = (formatType, headingPrefix = null) => {
        if (!selectedTextInfo || !detectedFormats) return;

        const { start, end, text } = selectedTextInfo;
        const { textFormats } = detectedFormats;

        const action = determineFormatAction(textFormats, formatType, 
            headingPrefix ? headingPrefix.length : null);

        
        let formattedText = '';
        let cleanText = text.trim();

        if (action.formatToRemove) {
            switch(action.formatToRemove) {
                case 'bold':
                    cleanText = cleanText.replace(/^\*\*(.*?)\*\*$/, '$1').replace(/^__(.*?)__$/, '$1');
                    break;
                case 'italic':
                    cleanText = cleanText.replace(/^\*(.*?)\*$/, '$1').replace(/^_(.*?)_$/, '$1');
                    break;
                case 'code':
                    cleanText = cleanText.replace(/^`(.*?)`$/, '$1');
                    break;
                case 'link':
                    cleanText = cleanText.replace(/^\[(.*?)\]\(.*?\)$/, '$1');
                    break;
                case 'heading':
                    cleanText = cleanText.replace(/^(#{1,6})\s+(.+)$/, '$2');
                    break;
            }
        }

        if (action.type === 'apply' || action.type === 'replace') {
            switch(formatType) {
                case 'bold':
                    formattedText = `**${cleanText}**`;
                    break;
                case 'italic':
                    formattedText = `*${cleanText}*`;
                    break;
                case 'link':
                    formattedText = `[${cleanText}](https://)`;
                    break;
                case 'heading': {
                    const prefix = headingPrefix || '#';
                    formattedText = `${prefix} ${cleanText}`;
                    break;
                }
                case 'code':
                    if (cleanText.includes('\n')) {
                        formattedText = `
\`\`\`
${cleanText}
\`\`\`
`;
                    } else {
                        formattedText = `\`${cleanText}\``;
                    }
                    break;
                default:
                    formattedText = cleanText;
                    return;
            }
        } else {
            formattedText = cleanText;
        }

        const textarea = textareaRef.current;
        const currentScrollTop = textarea ? textarea.scrollTop : 0;

        const beforeText = content.substring(0, start);
        const afterText = content.substring(end);
        const newContent = beforeText + formattedText + afterText;
        
        setContent(newContent);
        closeSelectionToolbar();

        setTimeout(() => {
            if (textarea) {
                textarea.scrollTop = currentScrollTop;

                let newCursorPos;
                switch(formatType) {
                    case 'bold':
                        newCursorPos = start + 2 + cleanText.length;
                        break;
                    case 'italic':
                    case 'code':
                        newCursorPos = start + 1 + cleanText.length;
                        break;
                    case 'link':
                        newCursorPos = start + cleanText.length + 3;
                        break;
                    case 'heading':
                        newCursorPos = start + (headingPrefix?.length || 1) + 1 + cleanText.length;
                        break;
                    default:
                        newCursorPos = start + formattedText.length;
                }
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const closeSelectionToolbar = () => {
        setShowSelectionToolbar(false);
        setSelectedTextInfo(null);
        setDetectedFormats(null);
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
                    {/*<div className="flex items-center space-x-1 text-sm text-gray-500">*/}
                    {/*    <span>Ctrl+Z 撤销</span>*/}
                    {/*    <span>|</span>*/}
                    {/*    <span>Ctrl+Y 重做</span>*/}
                    {/*</div>*/}
                    <button
                        onClick={() => setSyncScrollEnabled(!syncScrollEnabled)}
                        className={`flex items-center px-3 py-1 rounded-md transition-colors ${
                            syncScrollEnabled
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={syncScrollEnabled ? '点击关闭同步滚动' : '点击开启同步滚动'}
                    >
                        {syncScrollEnabled ? (
                            <Link className="h-4 w-4 mr-1" />
                        ) : (
                            <Unlink className="h-4 w-4 mr-1" />
                        )}
                        {syncScrollEnabled ? '同步滚动开' : '同步滚动关'}
                    </button>
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

                <MarkdownPreview content={content} previewRef={previewRef} />
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileInputChange}
            />

            <TextSelectionToolbar
                isVisible={showSelectionToolbar}
                position={selectionPosition}
                onFormat={handleSelectionFormat}
                onClose={closeSelectionToolbar}
                detectedFormats={detectedFormats}
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