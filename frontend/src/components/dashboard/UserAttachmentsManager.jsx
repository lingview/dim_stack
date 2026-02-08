import { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import { getConfig} from "../../utils/config.jsx";
import { FileArchive, FileText, File } from 'lucide-react';

const UserAttachmentsManager = () => {
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [viewMode, setViewMode] = useState('normal');

    useEffect(() => {
        fetchUserAttachments();
    }, [currentPage, viewMode]);

    const fetchUserAttachments = async () => {
        setLoading(true);
        try {
            let endpoint;
            if (viewMode === 'normal') {
                endpoint = '/attachments/page';
            } else {
                endpoint = '/attachments/page-deleted-only';
            }
            
            const response = await apiClient.get(endpoint, {
                params: { page: currentPage, size: pageSize }
            });
            
            if (response.code === 200) {
                setAttachments(response.data.data || []);
                setTotal(response.data.total || 0);
            } else {
                console.error('获取附件列表失败:', response.message);
            }
        } catch (error) {
            console.error('获取附件列表错误:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (attachmentId) => {
        if (!window.confirm('确定要删除这个附件吗？删除后6小时内可以撤销。')) {
            return;
        }
        try {
            const response = await apiClient.delete(`/attachments/${attachmentId}`);
            if (response.code === 200) {
                alert('删除成功');
                fetchUserAttachments();
            } else {
                alert('删除失败: ' + response.message);
            }
        } catch (error) {
            console.error('删除附件错误:', error);
            alert('删除失败: ' + (error.response?.data?.message || '未知错误'));
        }
    };

    const handleRestore = async (attachmentId) => {
        if (!window.confirm('确定要撤销删除这个附件吗？')) {
            return;
        }
        try {
            const response = await apiClient.post(`/attachments/${attachmentId}/restore`);
            if (response.code === 200) {
                alert('撤销删除成功');
                fetchUserAttachments();
            } else {
                alert('撤销删除失败: ' + response.message);
            }
        } catch (error) {
            console.error('撤销删除附件错误:', error);
            alert('撤销删除失败: ' + (error.response?.data?.message || '未知错误'));
        }
    };

    const getFileType = (attachmentPath) => {
        const lastDotIndex = attachmentPath.lastIndexOf('.');
        if (lastDotIndex === -1) return 'other';

        const ext = attachmentPath.substring(lastDotIndex + 1).toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
        if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return 'audio';
        if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return 'video';
        if (['pdf'].includes(ext)) return 'pdf';
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
        return 'other';
    };

    const getFileUrl = (accessKey) => {
        return getConfig().getFullUrl(`/file/${accessKey}`);
    };

    const getFileName = (attachmentPath) => {
        const lastSlashIndex = Math.max(attachmentPath.lastIndexOf('/'), attachmentPath.lastIndexOf('\\'));
        return attachmentPath.substring(lastSlashIndex + 1);
    };

    const getFileExtension = (attachmentPath) => {
        if (!attachmentPath) return 'unknown';
        const lastDotIndex = attachmentPath.lastIndexOf('.');
        if (lastDotIndex !== -1 && lastDotIndex < attachmentPath.length - 1) {
            return attachmentPath.substring(lastDotIndex + 1);
        }
        return 'unknown';
    };

    const getStatusBadge = (status, deletedTime) => {
        if (status === 1) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">正常</span>;
        } else if (status === 0 && deletedTime) {
            const deletedDate = new Date(deletedTime);
            const now = new Date();
            const hoursDiff = (now - deletedDate) / (1000 * 60 * 60);
            
            if (hoursDiff <= 6) {
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">已删除 ({Math.floor(hoursDiff)}小时前)</span>;
            } else {
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">已清理</span>;
            }
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">未知</span>;
    };

    const renderPreview = (attachment) => {
        const fileType = getFileType(attachment.attachment_path);
        const fileUrl = getFileUrl(attachment.access_key);
        const fileName = getFileName(attachment.attachment_path);
        const truncatedFileName = fileName.length > 20 ? `${fileName.substring(0, 20)}...` : fileName;

        const opacityClass = attachment.status === 0 ? 'opacity-50' : '';

        switch (fileType) {
            case 'image':
                return (
                    <div className={`w-32 h-32 flex items-center justify-center bg-gray-100 rounded ${opacityClass}`}>
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="max-w-full max-h-full object-contain rounded"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="text-gray-500 text-xs">加载失败</div>';
                            }}
                        />
                    </div>
                );

            case 'audio':
                return (
                    <div className={`w-64 ${opacityClass}`}>
                        <audio controls className="w-full">
                            <source src={fileUrl} />
                            您的浏览器不支持音频播放。
                        </audio>
                    </div>
                );

            case 'video':
                return (
                    <div className={`w-64 ${opacityClass}`}>
                        <video controls className="w-full max-h-48">
                            <source src={fileUrl} />
                            您的浏览器不支持视频播放。
                        </video>
                    </div>
                );

            case 'pdf':
                return (
                    <div className={`flex items-center gap-2 p-2 bg-red-50 rounded ${opacityClass}`} title={fileName}>
                        <FileText className="w-8 h-8 text-red-600" />
                        <span className="text-sm text-gray-700 truncate">{truncatedFileName}</span>
                    </div>
                );

            case 'archive':
                return (
                    <div className={`flex items-center gap-2 p-2 bg-yellow-50 rounded ${opacityClass}`} title={fileName}>
                        <FileArchive className="w-8 h-8 text-yellow-600" />
                        <span className="text-sm text-gray-700 truncate">{truncatedFileName}</span>
                    </div>
                );

            default:
                return (
                    <div className={`flex items-center gap-2 p-2 bg-gray-50 rounded ${opacityClass}`} title={fileName}>
                        <File className="w-8 h-8 text-gray-600" />
                        <span className="text-sm text-gray-700 truncate">{truncatedFileName}</span>
                    </div>
                );
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="mx-auto">
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {viewMode === 'normal' ? '我的附件' : '我的已删除附件'}
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('normal')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === 'normal'
                                            ? 'bg-white text-gray-900 shadow'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    正常附件
                                </button>
                                <button
                                    onClick={() => setViewMode('deleted')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        viewMode === 'deleted'
                                            ? 'bg-white text-gray-900 shadow'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    已删除附件
                                </button>
                            </div>
                            <p className="text-sm text-gray-600">总共 {total} 个附件</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-500">加载中...</div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        预览
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        文件类型
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        状态
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        上传时间
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {attachments.map((attachment, index) => (
                                    <tr key={`${attachment.uuid}-${index}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {renderPreview(attachment)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                .{getFileExtension(attachment.attachment_path)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(attachment.status, attachment.deleted_time)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(attachment.create_time).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {viewMode === 'normal' ? (
                                                <>
                                                    <a
                                                        href={getFileUrl(attachment.access_key)}
                                                        download
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        下载
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(attachment.attachment_id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        删除
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleRestore(attachment.attachment_id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    撤销删除
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {attachments.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-500">
                                {viewMode === 'normal' 
                                    ? '暂无附件' 
                                    : '暂无已删除的附件'}
                            </div>
                        )}

                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                第 {currentPage} 页，共 {totalPages} 页
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    上一页
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    下一页
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserAttachmentsManager;