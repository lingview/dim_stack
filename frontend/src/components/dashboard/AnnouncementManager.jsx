import { useState, useEffect, useRef } from 'react';
import apiClient from '../../utils/axios.jsx';
import { showToast } from '../../utils/toastManager.jsx';
import DOMPurify from 'dompurify';

export default function AnnouncementManager() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const cursorPosRef = useRef(null);

    useEffect(() => {
        apiClient.get('/announcement', { silent: true })
            .then((response) => {
                const data = response.data || response;
                if (data && data.content) {
                    setContent(data.content);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await apiClient.post('/announcement', { content });
            if (response.code !== 200) {
                showToast('保存失败: ' + (response.message || '未知错误'));
                return;
            }
            showToast('公告保存成功');
        } catch (err) {
            showToast('保存失败: ' + (err.message || '未知错误'));
            console.error('保存公告失败:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleUploadClick = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            cursorPosRef.current = {
                start: textarea.selectionStart,
                end: textarea.selectionEnd
            };
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/uploadattachment', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const fileUrl = response.fileUrl || '';
            if (fileUrl) {
                const imgTag = `<img src="${fileUrl}" alt="" />`;
                const textarea = textareaRef.current;
                const cursor = cursorPosRef.current;
                const start = cursor ? cursor.start : (textarea ? textarea.selectionStart : content.length);
                const end = cursor ? cursor.end : (textarea ? textarea.selectionEnd : content.length);
                const newContent = content.slice(0, start) + imgTag + content.slice(end);
                setContent(newContent);
                if (textarea) {
                    setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + imgTag.length, start + imgTag.length);
                    }, 0);
                }
                showToast('图片上传成功');
            }
        } catch (err) {
            showToast('图片上传失败: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderContent = (html) => {
        html = html.replace(/\n/g, '<br>');
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['img', 'br'],
            ALLOWED_ATTR: ['src', 'alt']
        });
    };

    const sanitizedHtml = renderContent(content);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm flex flex-col">
            <div className="p-4 md:p-6 border-b border-gray-200 shrink-0">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">公告管理</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleUploadClick}
                            disabled={uploading}
                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md 
                                       hover:bg-gray-200 disabled:opacity-50 transition"
                        >
                            {uploading ? '上传中...' : '上传图片'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600
                                      disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? '保存中...' : '保存公告'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>

            <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
                <div className="w-1/2 border-r border-gray-200 flex flex-col">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
                        <span className="text-xs font-medium text-gray-500">编辑</span>
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 w-full resize-none p-4 text-sm text-gray-900 border-0
                                   focus:outline-none focus:ring-0 font-mono"
                        placeholder="请输入公告内容..."
                    />
                </div>
                <div className="w-1/2 flex flex-col">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
                        <span className="text-xs font-medium text-gray-500">预览</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <style>{`
                            .preview-content img { max-width: 100%; height: auto; margin: 0.75em 0; border-radius: 4px; }
                        `}</style>
                        {content.trim() ? (
                            <div
                                className="preview-content text-sm text-gray-900"
                                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                            />
                        ) : (
                            <p className="text-sm text-gray-400">在左侧输入内容后，此处将显示预览效果</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
