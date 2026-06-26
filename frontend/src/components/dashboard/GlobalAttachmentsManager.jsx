import { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import { getConfig } from "../../utils/config.jsx";
import { FileArchive, FileText, File, Download } from 'lucide-react';
import {showToast} from "../../utils/toastManager.jsx";

const GlobalAttachmentsManager = () => {
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [jumpPage, setJumpPage] = useState('');
    const [viewMode, setViewMode] = useState('normal');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [userLoading, setUserLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchAttachments();
    }, [currentPage, viewMode, selectedUser]);

    const fetchUsers = async () => {
        setUserLoading(true);
        try {
            const response = await apiClient.get('/user/listall');
            if (response && Array.isArray(response)) {
                setUsers(response);
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
        } finally {
            setUserLoading(false);
        }
    };

    const fetchAttachments = async () => {
        setLoading(true);
        try {
            let endpoint;
            const params = {
                page: currentPage,
                size: pageSize
            };

            if (selectedUser) {
                endpoint = viewMode === 'normal'
                    ? '/attachments/admin/page-by-user'
                    : '/attachments/admin/page-deleted-only-by-user';
                params.userUuid = selectedUser;
            } else {
                endpoint = viewMode === 'normal'
                    ? '/attachments/admin/page'
                    : '/attachments/admin/page-deleted-only';
            }

            const response = await apiClient.get(endpoint, { params });

            if (response.code === 200) {
                setAttachments(response.data.data || []);
                const total = response.data.total || 0;
                setTotalItems(total);
                setTotalPages(response.data.totalPages || Math.ceil(total / pageSize) || 1);
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
            const response = await apiClient.delete(`/attachments/admin/${attachmentId}`);

            if (response.code === 200) {
                showToast('删除成功');
                fetchAttachments();
            } else {
                showToast('删除失败: ' + response.message);
            }
        } catch (error) {
            console.error('删除附件错误:', error);
            showToast('删除失败');
        }
    };

    const handleRestore = async (attachmentId) => {
        if (!window.confirm('确定要撤销删除这个附件吗?')) {
            return;
        }

        try {
            const response = await apiClient.post(`/attachments/admin/${attachmentId}/restore`);

            if (response.code === 200) {
                showToast('撤销删除成功');
                fetchAttachments();
            } else {
                showToast('撤销删除失败: ' + response.message);
            }
        } catch (error) {
            console.error('撤销删除附件错误:', error);
            showToast('撤销删除失败');
        }
    };

    const handleUserChange = (userUuid) => {
        setSelectedUser(userUuid);
        setCurrentPage(1);
    };

    const getDownloadUrl = (accessKey) => {
        return `${getFileUrl(accessKey)}?download=true`;
    };

    const getFileType = (attachmentPath) => {
        if (!attachmentPath) return 'other';

        const lastDotIndex = attachmentPath.lastIndexOf('.');
        if (lastDotIndex === -1) return 'other';

        const ext = attachmentPath.substring(lastDotIndex + 1).toLowerCase();

        const typeMap = {
            image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
            audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
            video: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'],
            pdf: ['pdf'],
            archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
            document: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
        };

        for (const [type, extensions] of Object.entries(typeMap)) {
            if (extensions.includes(ext)) return type;
        }

        return 'other';
    };

    const getFileUrl = (accessKey) => {
        return getConfig().getFullUrl(`/file/${accessKey}`);
    };

    const getFilePath = (attachmentPath) => {
        if (!attachmentPath) return 'unknown';
        const lastSlashIndex = Math.max(
            attachmentPath.lastIndexOf('/'),
            attachmentPath.lastIndexOf('\\')
        );
        return attachmentPath.substring(lastSlashIndex + 1);
    };

    const getFileExtension = (attachmentPath) => {
        if (!attachmentPath) return 'unknown';
        const lastDotIndex = attachmentPath.lastIndexOf('.');
        if (lastDotIndex !== -1 && lastDotIndex < attachmentPath.length - 1) {
            return attachmentPath.substring(lastDotIndex + 1).toUpperCase();
        }
        return 'unknown';
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text || text.length <= maxLength) return text;
        return `${text.substring(0, maxLength)}...`;
    };

    const getStatusBadge = (status, deletedTime) => {
        if (status === 1) {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    正常
                </span>
            );
        } else if (status === 0 && deletedTime) {
            const deletedDate = new Date(deletedTime);
            const now = new Date();
            const hoursDiff = (now - deletedDate) / (1000 * 60 * 60);

            if (hoursDiff <= 6) {
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        已删除 ({Math.floor(hoursDiff)}小时前)
                    </span>
                );
            }
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    已清理
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                未知
            </span>
        );
    };

    const renderPreview = (attachment) => {
        const fileType = getFileType(attachment.attachment_path);
        const fileUrl = getFileUrl(attachment.access_key);
        const FilePath = getFilePath(attachment.attachment_path);
        const truncatedFilePath = truncateText(FilePath, 20);
        const opacityClass = attachment.status === 0 ? 'opacity-50' : '';

        switch (fileType) {
            case 'image':
                return (
                    <div className={`w-32 h-32 flex items-center justify-center bg-gray-100 rounded ${opacityClass}`}>
                        <img
                            src={fileUrl}
                            alt={FilePath}
                            className="max-w-full max-h-full object-contain rounded"
                            loading="lazy"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="text-gray-500 text-xs">加载失败</div>';
                            }}
                        />
                    </div>
                );

            case 'audio':
                return (
                    <div className={`w-64 ${opacityClass}`}>
                        <audio controls className="w-full" preload="metadata">
                            <source src={fileUrl} />
                            您的浏览器不支持音频播放
                        </audio>
                    </div>
                );

            case 'video':
                return (
                    <div className={`w-64 ${opacityClass}`}>
                        <video controls className="w-full max-h-48" preload="metadata">
                            <source src={fileUrl} />
                            您的浏览器不支持视频播放
                        </video>
                    </div>
                );

            case 'pdf':
                return (
                    <div className={`flex items-center gap-2 p-2 rounded ${opacityClass}`} title={FilePath}>
                        <FileText className="w-8 h-8  flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{truncatedFilePath}</span>
                    </div>
                );

            case 'archive':
                return (
                    <div className={`flex items-center gap-2 p-2 rounded ${opacityClass}`} title={FilePath}>
                        <FileArchive className="w-8 h-8 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{truncatedFilePath}</span>
                    </div>
                );

            default:
                return (
                    <div className={`flex items-center gap-2 p-2 rounded ${opacityClass}`} title={FilePath}>
                        <File className="w-8 h-8 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{truncatedFilePath}</span>
                    </div>
                );
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
    };

    const handleJumpPage = (e) => {
        e.preventDefault();
        const pageNum = parseInt(jumpPage);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            handlePageChange(pageNum);
            setJumpPage('');
        }
    };

    return (
        <div className="mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {viewMode === 'normal' ? '全局附件管理' : '已删除附件管理'}
                        </h2>
                        <p className="text-sm text-orange-600 mt-1">
                            注：附件删除后有6小时冷静期，超期将会彻底删除
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => {
                                    setViewMode('normal');
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'normal'
                                        ? 'bg-white text-gray-900 shadow'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                正常附件
                            </button>
                            <button
                                onClick={() => {
                                    setViewMode('deleted');
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'deleted'
                                        ? 'bg-white text-gray-900 shadow'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                已删除附件
                            </button>
                        </div>
                        <div className="text-sm text-gray-500">
                            总共 {totalItems} 个附件
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        按用户筛选
                    </label>
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedUser}
                            onChange={(e) => handleUserChange(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                            disabled={userLoading}
                        >
                            <option value="">所有用户</option>
                            {users.map(user => (
                                <option key={user.uuid} value={user.uuid}>
                                    {user.username} ({user.role_name})
                                </option>
                            ))}
                        </select>
                        {userLoading && (
                            <div className="text-sm text-gray-500">加载中...</div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
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
                                        原始文件名
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        文件类型
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        所属用户
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        状态
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        上传时间
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        文件路径
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {attachments.map((attachment) => (
                                    <tr key={attachment.attachment_id || attachment.uuid} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {renderPreview(attachment)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" title={attachment.original_filename || '未记录'}>
                                            {attachment.original_filename 
                                                ? truncateText(attachment.original_filename, 30)
                                                : '未记录'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {getFileExtension(attachment.attachment_path)}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {attachment.username || '未知用户'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(attachment.status, attachment.deleted_time)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(attachment.create_time).toLocaleString('zh-CN')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500" title={attachment.attachment_path}>
                                            {truncateText(attachment.attachment_path)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {viewMode === 'normal' ? (
                                                <div className="flex items-center justify-end gap-3">
                                                    <a
                                                        href={getDownloadUrl(attachment.access_key)}
                                                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        下载
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(attachment.attachment_id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
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

                        {attachments.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                {selectedUser
                                    ? (viewMode === 'normal' ? '该用户暂无附件' : '该用户暂无已删除的附件')
                                    : (viewMode === 'normal' ? '暂无附件' : '暂无已删除的附件')
                                }
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        上一页
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        下一页
                                    </button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            显示第 <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> 到 <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> 条结果,共 <span className="font-medium">{totalItems}</span> 条
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">首页</span>
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">上一页</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {(() => {
                                                const delta = 2;
                                                const range = [];
                                                for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                                                    range.push(i);
                                                }

                                                if (currentPage - delta > 2) {
                                                    range.unshift('...');
                                                }
                                                if (currentPage + delta < totalPages - 1) {
                                                    range.push('...');
                                                }

                                                return [
                                                    1,
                                                    ...range,
                                                    totalPages
                                                ].map((page, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                                                        disabled={page === '...' || page === currentPage}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                            page === currentPage
                                                                ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                                : page === '...'
                                                                    ? 'text-gray-700'
                                                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ));
                                            })()}

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">下一页</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">末页</span>
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>

                                        <form onSubmit={handleJumpPage} className="flex items-center gap-2">
                                            <span className="text-sm text-gray-700">跳转到</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max={totalPages}
                                                value={jumpPage}
                                                onChange={(e) => setJumpPage(e.target.value)}
                                                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="页码"
                                            />
                                            <button
                                                type="submit"
                                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                            >
                                                跳转
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default GlobalAttachmentsManager;