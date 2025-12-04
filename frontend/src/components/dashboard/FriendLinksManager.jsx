import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';

export default function FriendLinksManager() {
    const [friendLinks, setFriendLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filterStatus, setFilterStatus] = useState(null);
    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        loadFriendLinks();
    }, [currentPage, filterStatus]);

    const loadFriendLinks = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/friend-links', {
                params: {
                    page: currentPage,
                    size: 10,
                    status: filterStatus
                }
            });

            if (response.success) {
                setFriendLinks(response.data.data || []);
                setTotalPages(response.data.total_pages || 0);
            } else {
                showMessage('error', response.message || '获取友链列表失败');
                setFriendLinks([]);
            }
        } catch (error) {
            console.error('获取友链列表失败:', error);
            showMessage('error', '获取友链列表时发生错误');
            setFriendLinks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const response = await apiClient.put(`/friend-links/${id}/status`, null, {
                params: { status }
            });

            if (response.success) {
                showMessage('success', response.message || '状态更新成功');
                loadFriendLinks();
            } else {
                showMessage('error', response.message || '状态更新失败');
            }
        } catch (error) {
            console.error('更新友链状态失败:', error);
            showMessage('error', '更新友链状态时发生错误');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('确定要将这条友链标记为删除状态吗？')) {
            return;
        }

        try {
            const response = await apiClient.delete(`/friend-links/${id}`);

            if (response.success) {
                showMessage('success', response.message || '友链已标记为删除状态');
                loadFriendLinks();
            } else {
                showMessage('error', response.message || '操作失败');
            }
        } catch (error) {
            console.error('删除友链失败:', error);
            showMessage('error', '删除友链时发生错误');
        }
    };

    const handlePermanentDelete = async (id) => {
        if (!window.confirm('确定要彻底删除这条友链吗？此操作不可恢复！')) {
            return;
        }

        try {
            const response = await apiClient.delete(`/friend-links/${id}/permanent`);

            if (response.success) {
                showMessage('success', response.message || '友链彻底删除成功');
                loadFriendLinks();
            } else {
                showMessage('error', response.message || '彻底删除失败');
            }
        } catch (error) {
            console.error('彻底删除友链失败:', error);
            showMessage('error', '彻底删除友链时发生错误');
        }
    };

    const showMessage = (type, content) => {
        setMessage({ type, content });
        setTimeout(() => {
            setMessage({ type: '', content: '' });
        }, 3000);
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0: return '已删除';
            case 1: return '已通过';
            case 2: return '待审核';
            default: return '未知';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 0: return 'bg-red-100 text-red-800';
            case 1: return 'bg-green-100 text-green-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getFullImageUrl = (url) => {
        if (!url) return '/default-icon.png';

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        if (url.startsWith('/')) {
            return url;
        }

        return `/upload/${url}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">友链管理</h2>

            {message.content && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-50 text-green-800' :
                        message.type === 'error' ? 'bg-red-50 text-red-800' :
                            'bg-blue-50 text-blue-800'
                }`}>
                    {message.content}
                </div>
            )}

            <div className="mb-6 flex flex-wrap gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态筛选</label>
                    <select
                        value={filterStatus || ''}
                        onChange={(e) => {
                            setFilterStatus(e.target.value ? parseInt(e.target.value) : null);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">全部状态</option>
                        <option value="2">待审核</option>
                        <option value="1">已通过</option>
                        <option value="0">已删除</option>
                    </select>
                </div>
            </div>

            {/* 友链列表 */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : friendLinks.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">站点信息</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">站长信息</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请时间</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {friendLinks.map((link) => (
                                <tr key={link.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                src={getFullImageUrl(link.siteIcon)}
                                                alt={link.siteName}
                                                className="h-10 w-10 rounded-md object-contain mr-3"
                                                onError={(e) => { e.target.src = '/default-icon.png'; }}
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{link.siteName}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    <a href={link.siteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                                        {link.siteUrl}
                                                    </a>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">{link.siteDescription}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{link.webmasterName}</div>
                                        <div className="text-sm text-gray-500">{link.contact}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(link.status)}`}>
                                                {getStatusText(link.status)}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(link.createTime).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {link.status === 2 && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(link.id, 1)}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    通过
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(link.id, 0)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    删除
                                                </button>
                                            </>
                                        )}
                                        {link.status === 1 && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(link.id, 2)}
                                                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                                                >
                                                    待审核
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(link.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    删除
                                                </button>
                                            </>
                                        )}
                                        {link.status === 0 && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(link.id, 1)}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    恢复
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDelete(link.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    彻底删除
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                                上一页
                            </button>

                            <span className="text-sm text-gray-600">
                                第 {currentPage} 页，共 {totalPages} 页
                            </span>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                                下一页
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-500">暂无友链数据</div>
                </div>
            )}
        </div>
    );
}
