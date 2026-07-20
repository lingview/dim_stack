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

    const [showMigrateModal, setShowMigrateModal] = useState(false);
    const [storageMethods, setStorageMethods] = useState([]);
    const [migrateSource, setMigrateSource] = useState('');
    const [migrateTarget, setMigrateTarget] = useState('');
    const [migrating, setMigrating] = useState(false);
    const [migrateResult, setMigrateResult] = useState(null);
    const [migrateLogs, setMigrateLogs] = useState([]);
    const [migrateLogDetail, setMigrateLogDetail] = useState(null);
    const [migrateTab, setMigrateTab] = useState('migrate');
    const [loadingLogs, setLoadingLogs] = useState(false);

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [allStorageMethods, setAllStorageMethods] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchAllStorageMethods();
    }, []);

    useEffect(() => {
        fetchAttachments();
    }, [currentPage, viewMode, selectedUser]);

    const fetchUsers = async () => {
        setUserLoading(true);
        try {
            const response = await apiClient.get('/user/listall');
            if (response && Array.isArray(response.data)) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
        } finally {
            setUserLoading(false);
        }
    };

    const fetchAttachments = async () => {
        setSelectedIds(new Set());
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

    const handlePhysicallyDelete = async (attachmentId) => {
        if (!window.confirm('确定要彻底删除此附件吗？此操作不可恢复。')) return;
        try {
            const response = await apiClient.post(`/attachments/admin/${attachmentId}/physically-delete`);
            if (response.code === 200) {
                showToast('彻底删除成功');
                fetchAttachments();
            } else {
                showToast('彻底删除失败: ' + (response.message || ''));
            }
        } catch (error) {
            console.error('彻底删除附件错误:', error);
            showToast('彻底删除失败');
        }
    };

    const fetchStorageMethods = async () => {
        try {
            const response = await apiClient.get('/storage/list');
            if (response.code === 200) {
                setStorageMethods(response.data.filter(m => m.status === 1));
            }
        } catch (error) {
            console.error('获取存储方式失败:', error);
        }
    };

    const fetchAllStorageMethods = async () => {
        try {
            const response = await apiClient.get('/storage/list');
            if (response.code === 200) {
                setAllStorageMethods(response.data || []);
            }
        } catch (error) {
            console.error('获取存储方式失败:', error);
        }
    };

    const fetchMigrateLogs = async () => {
        setLoadingLogs(true);
        try {
            const response = await apiClient.get('/attachments/admin/migrate-logs');
            if (response.code === 200) {
                setMigrateLogs(response.data || []);
            }
        } catch (error) {
            console.error('获取迁移历史失败:', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const fetchMigrateLogDetail = async (id) => {
        try {
            const response = await apiClient.get(`/attachments/admin/migrate-logs/${id}`);
            if (response.code === 200) {
                setMigrateLogDetail(response.data);
            }
        } catch (error) {
            console.error('获取迁移详情失败:', error);
        }
    };

    const handleOpenMigrateModal = () => {
        fetchStorageMethods();
        setMigrateSource('');
        setMigrateTarget('');
        setMigrateResult(null);
        setMigrateLogDetail(null);
        setMigrateTab('migrate');
        fetchMigrateLogs();
        setShowMigrateModal(true);
    };

    const handleMigrate = async () => {
        if (!migrateSource || !migrateTarget) {
            showToast('请选择源存储和目标存储', 'error');
            return;
        }
        if (migrateSource === migrateTarget) {
            showToast('源存储和目标存储不能相同', 'error');
            return;
        }
        setMigrating(true);
        setMigrateResult(null);
        try {
            const response = await apiClient.post('/attachments/admin/migrate-storage', {
                sourceStorageId: migrateSource,
                targetStorageId: migrateTarget
            });
            if (response.code === 200) {
                setMigrateResult(response.data);
                if (response.data.failed === 0) {
                    showToast(`迁移完成，成功 ${response.data.success} 个`);
                } else {
                    showToast(`迁移完成，成功 ${response.data.success} 个，失败 ${response.data.failed} 个`, 'error');
                }
            } else {
                showToast(response.message || '迁移失败', 'error');
            }
        } catch (error) {
            console.error('迁移失败:', error);
            showToast('迁移时发生错误', 'error');
        } finally {
            setMigrating(false);
        }
    };

    const handleRetryMigrate = async () => {
        if (!migrateResult || !migrateResult.failedItems || migrateResult.failedItems.length === 0) return;
        setMigrating(true);
        try {
            const response = await apiClient.post('/attachments/admin/migrate-storage/retry', {
                sourceStorageId: migrateSource,
                targetStorageId: migrateTarget,
                attachmentIds: migrateResult.failedItems.map(item => item.attachmentId)
            });
            if (response.code === 200) {
                setMigrateResult(response.data);
                if (response.data.failed === 0) {
                    showToast(`重试完成，成功 ${response.data.success} 个`);
                } else {
                    showToast(`重试完成，成功 ${response.data.success} 个，仍有 ${response.data.failed} 个失败`, 'error');
                }
            } else {
                showToast(response.message || '重试失败', 'error');
            }
        } catch (error) {
            console.error('重试迁移失败:', error);
            showToast('重试迁移时发生错误', 'error');
        } finally {
            setMigrating(false);
        }
    };

    // 批量删除处理
    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 个附件吗？删除后6小时内可以撤销。`)) {
            return;
        }

        try {
            const response = await apiClient.post('/attachments/admin/batch-delete', Array.from(selectedIds));

            if (response.code === 200) {
                const deletedCount = response.data || selectedIds.size;
                showToast(`成功删除 ${deletedCount} 个附件`);
                setSelectedIds(new Set());
                fetchAttachments();
            } else {
                showToast('批量删除失败: ' + response.message);
            }
        } catch (error) {
            console.error('批量删除附件错误:', error);
            showToast('批量删除失败');
        }
    };

    // 批量撤销删除处理
    const handleBatchRestore = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`确定要撤销删除选中的 ${selectedIds.size} 个附件吗？`)) {
            return;
        }

        try {
            const response = await apiClient.post('/attachments/admin/batch-restore', Array.from(selectedIds));

            if (response.code === 200) {
                const restoredCount = response.data || selectedIds.size;
                showToast(`成功撤销 ${restoredCount} 个附件`);
                setSelectedIds(new Set());
                fetchAttachments();
            } else {
                showToast('批量撤销失败: ' + response.message);
            }
        } catch (error) {
            console.error('批量撤销删除附件错误:', error);
            showToast('批量撤销失败');
        }
    };

    // 批量彻底删除处理
    const handleBatchPhysicallyDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`确定要彻底删除选中的 ${selectedIds.size} 个附件吗？此操作不可恢复。`)) {
            return;
        }

        try {
            const response = await apiClient.post('/attachments/admin/batch-physically-delete', Array.from(selectedIds));

            if (response.code === 200) {
                const deletedCount = response.data || selectedIds.size;
                showToast(`成功彻底删除 ${deletedCount} 个附件`);
                setSelectedIds(new Set());
                fetchAttachments();
            } else {
                showToast('批量彻底删除失败: ' + response.message);
            }
        } catch (error) {
            console.error('批量彻底删除附件错误:', error);
            showToast('批量彻底删除失败');
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.size === attachments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(attachments.map(a => a.attachment_id)));
        }
    };

    const handleSelectOne = (attachmentId) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(attachmentId)) {
            newSelected.delete(attachmentId);
        } else {
            newSelected.add(attachmentId);
        }
        setSelectedIds(newSelected);
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
                        <button
                            onClick={handleOpenMigrateModal}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            存储迁移
                        </button>
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
                        {selectedIds.size > 0 && (
                            <div className="flex items-center justify-between mb-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-sm text-gray-700">
                                    已选择 <span className="font-medium text-blue-600">{selectedIds.size}</span> 项
                                </span>
                                {viewMode === 'normal' ? (
                                    <button
                                        onClick={handleBatchDelete}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                        批量删除
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleBatchRestore}
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                        >
                                            批量撤销删除
                                        </button>
                                        <button
                                            onClick={handleBatchPhysicallyDelete}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                        >
                                            批量彻底删除
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                        <input
                                            type="checkbox"
                                            checked={attachments.length > 0 && selectedIds.size === attachments.length}
                                            onClick={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        存储位置
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
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(attachment.attachment_id)}
                                                onChange={() => handleSelectOne(attachment.attachment_id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {(() => {
                                                const s = allStorageMethods.find(m => m.uuid === attachment.storage_id);
                                                return s ? s.name : '未知';
                                            })()}
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
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRestore(attachment.attachment_id)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        撤销删除
                                                    </button>
                                                    <button
                                                        onClick={() => handlePhysicallyDelete(attachment.attachment_id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        彻底删除
                                                    </button>
                                                </div>
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

            {showMigrateModal && (
                <>
                    <div className="fixed inset-0 backdrop-blur-sm bg-transparent z-40" onClick={() => setShowMigrateModal(false)}></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">存储迁移</h3>
                                <button onClick={() => setShowMigrateModal(false)} className="text-gray-400 hover:text-gray-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex border-b border-gray-200">
                                <button onClick={() => { setMigrateTab('migrate'); setMigrateLogDetail(null); }} className={`px-4 py-2 text-sm font-medium ${migrateTab === 'migrate' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>迁移</button>
                                <button onClick={() => { setMigrateTab('history'); fetchMigrateLogs(); }} className={`px-4 py-2 text-sm font-medium ${migrateTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>历史记录</button>
                            </div>

                            {migrateTab === 'migrate' && (
                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">源存储（被迁移）</label>
                                    <select
                                        value={migrateSource}
                                        onChange={(e) => setMigrateSource(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">请选择</option>
                                        {storageMethods.map(m => (
                                            <option key={m.uuid} value={m.uuid}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">目标存储（迁移到）</label>
                                    <select
                                        value={migrateTarget}
                                        onChange={(e) => setMigrateTarget(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">请选择</option>
                                        {storageMethods.filter(m => m.uuid !== migrateSource).map(m => (
                                            <option key={m.uuid} value={m.uuid}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {migrateResult && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="text-sm text-gray-700 mb-2">
                                            迁移结果：共 {migrateResult.total} 个，成功 {migrateResult.success} 个，失败 {migrateResult.failed} 个
                                        </div>
                                        {migrateResult.failedItems && migrateResult.failedItems.length > 0 && (
                                            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                                {migrateResult.failedItems.map((item, idx) => (
                                                    <div key={idx} className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                                                        {item.filePath} — {item.error}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            )}

                            {migrateTab === 'history' && (
                            <div className="px-6 py-4 space-y-2">
                                {loadingLogs ? (
                                    <div className="text-center py-4 text-sm text-gray-400">加载中...</div>
                                ) : migrateLogs.length === 0 ? (
                                    <div className="text-center py-4 text-sm text-gray-400">暂无迁移记录</div>
                                ) : migrateLogDetail ? (
                                    <div>
                                        <button onClick={() => setMigrateLogDetail(null)} className="text-sm text-blue-600 hover:text-blue-800 mb-3">← 返回列表</button>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                            <div className="text-sm text-gray-700">{new Date(migrateLogDetail.created_at).toLocaleString()} — 共 {migrateLogDetail.total} 个，成功 {migrateLogDetail.success} 个，失败 {migrateLogDetail.failed} 个</div>
                                            <div className="text-xs text-gray-500">状态：{migrateLogDetail.status === 0 ? '进行中' : migrateLogDetail.status === 1 ? '已完成' : '失败'}</div>
                                            {migrateLogDetail.failedItems && migrateLogDetail.failedItems.length > 0 && (
                                                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                                    <div className="text-xs font-medium text-red-600 mb-1">失败明细：</div>
                                                    {migrateLogDetail.failedItems.map((item, idx) => (
                                                        <div key={idx} className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{item.file_path} — {item.error_msg}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    migrateLogs.map(log => (
                                        <div key={log.id} onClick={() => fetchMigrateLogDetail(log.id)} className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-700">{new Date(log.created_at).toLocaleString()}</div>
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${log.status === 1 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>{log.status === 0 ? '进行中' : log.status === 1 ? '已完成' : '失败'}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">共 {log.total} 个 · 成功 {log.success} · 失败 {log.failed}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                            )}

                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowMigrateModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    关闭
                                </button>
                                {migrateResult && migrateResult.failed > 0 && (
                                    <button
                                        onClick={handleRetryMigrate}
                                        disabled={migrating}
                                        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        {migrating ? '重试中...' : `重试失败项 (${migrateResult.failed})`}
                                    </button>
                                )}
                                <button
                                    onClick={handleMigrate}
                                    disabled={migrating || !migrateSource || !migrateTarget}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {migrating ? '迁移中...' : '执行迁移'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default GlobalAttachmentsManager;