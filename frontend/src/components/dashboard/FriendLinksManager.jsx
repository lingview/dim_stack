import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';
import { showToast } from '../../utils/toastManager.jsx';

export default function FriendLinksManager() {
    const [friendLinks, setFriendLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filterStatus, setFilterStatus] = useState(null);

    const [editingLink, setEditingLink] = useState(null);
    const [editForm, setEditForm] = useState({
        siteName: '',
        siteUrl: '',
        siteIcon: '',
        siteDescription: '',
        webmasterName: '',
        contact: ''
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        siteName: '',
        siteUrl: '',
        siteIcon: '',
        siteDescription: '',
        webmasterName: '',
        contact: ''
    });
    const [savingAdd, setSavingAdd] = useState(false);

    const [showSiteConfigModal, setShowSiteConfigModal] = useState(false);
    const [siteConfigForm, setSiteConfigForm] = useState({
        siteName: '',
        siteUrl: '',
        siteLogo: '',
        description: '',
        applyRules: ''
    });
    const [loadingSiteConfig, setLoadingSiteConfig] = useState(false);

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

            if (response.code === 200) {
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

            if (response.code === 200) {
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

            if (response.code === 200) {
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

            if (response.code === 200) {
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

    const startEdit = (link) => {
        setEditingLink(link.id);
        setEditForm({
            siteName: link.siteName || '',
            siteUrl: link.siteUrl || '',
            siteIcon: link.siteIcon || '',
            siteDescription: link.siteDescription || '',
            webmasterName: link.webmasterName || '',
            contact: link.contact || ''
        });
    };

    const cancelEdit = () => {
        setEditingLink(null);
        setEditForm({
            siteName: '',
            siteUrl: '',
            siteIcon: '',
            siteDescription: '',
            webmasterName: '',
            contact: ''
        });
    };

    const saveEdit = async (id) => {
        try {
            const response = await apiClient.put(`/friend-links/${id}`, editForm);

            if (response.code === 200) {
                showMessage('success', response.message || '友链信息更新成功');
                setEditingLink(null);
                loadFriendLinks();
            } else {
                showMessage('error', response.message || '更新失败');
            }
        } catch (error) {
            console.error('更新友链失败:', error);
            showMessage('error', '更新友链时发生错误');
        }
    };

    const showMessage = (type, content) => {
        showToast(content, type === 'success' ? 'info' : type);
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
        if (!url) return '/image_error.svg';

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        if (url.startsWith('/')) {
            return url;
        }

        return `/upload/${url}`;
    };

    const truncateText = (text, maxLength = 30) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                showMessage('success', '已复制到剪贴板');
            })
            .catch(err => {
                console.error('复制失败:', err);
                showMessage('error', '复制失败');
            });
    };

    const openAddModal = () => {
        setAddForm({
            siteName: '',
            siteUrl: '',
            siteIcon: '',
            siteDescription: '',
            webmasterName: '',
            contact: ''
        });
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
    };

    const handleAddFriendLink = async () => {
        try {
            setSavingAdd(true);
            const response = await apiClient.post('/friend-links', addForm);
            if (response?.code === 200) {
                showMessage('success', response.message || '友链添加成功');
                closeAddModal();
                setCurrentPage(1);
                loadFriendLinks();
            } else {
                showMessage('error', response?.message || '友链添加失败');
            }
        } catch (error) {
            console.error('添加友链失败:', error);
            showMessage('error', error?.response?.data?.message || '添加友链时发生错误');
        } finally {
            setSavingAdd(false);
        }
    };

    const openSiteConfigModal = async () => {
        try {
            setLoadingSiteConfig(true);
            const response = await apiClient.get('/friend-links/site-info');
            if (response?.code === 200 && response?.data) {
                setSiteConfigForm({
                    siteName: response.data.siteName || '',
                    siteUrl: response.data.siteUrl || '',
                    siteLogo: response.data.siteLogo || '',
                    description: response.data.description || '',
                    applyRules: response.data.applyRules || ''
                });
            }
            setShowSiteConfigModal(true);
        } catch (error) {
            console.error('获取本站友链配置失败:', error);
            showMessage('error', '获取配置失败');
        } finally {
            setLoadingSiteConfig(false);
        }
    };

    const closeSiteConfigModal = () => {
        setShowSiteConfigModal(false);
        setSiteConfigForm({
            siteName: '',
            siteUrl: '',
            siteLogo: '',
            description: '',
            applyRules: ''
        });
    };

    const saveSiteConfig = async () => {
        try {
            const response = await apiClient.put('/friend-links/site-info', siteConfigForm);
            if (response?.code === 200) {
                showMessage('success', response.message || '配置保存成功');
                closeSiteConfigModal();
            } else {
                showMessage('error', response.message || '保存失败');
            }
        } catch (error) {
            console.error('保存本站友链配置失败:', error);
            showMessage('error', '保存失败');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">友链管理</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        添加友链
                    </button>
                    <button
                        onClick={openSiteConfigModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        配置本站友链信息
                    </button>
                </div>
            </div>

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
                                        {editingLink === link.id ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">站点名称</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.siteName}
                                                        onChange={(e) => setEditForm({...editForm, siteName: e.target.value})}
                                                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                                        placeholder="站点名称"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">站点URL</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.siteUrl}
                                                        onChange={(e) => setEditForm({...editForm, siteUrl: e.target.value})}
                                                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                                        placeholder="站点URL"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">站点描述</label>
                                                    <textarea
                                                        value={editForm.siteDescription}
                                                        onChange={(e) => setEditForm({...editForm, siteDescription: e.target.value})}
                                                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                                        placeholder="站点描述"
                                                        rows="2"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start space-x-3">
                                                <div>
                                                    <img
                                                        src={getFullImageUrl(link.siteIcon)}
                                                        alt={link.siteName}
                                                        className="h-10 w-10 rounded-md object-contain"
                                                        onError={(e) => { e.target.src = '/image_error.svg'; }}
                                                    />
                                                </div>
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-start">
                                                        <span className="text-xs font-medium text-gray-500 w-16 min-w-[4rem]">站点名称:</span>
                                                        <span className="text-sm font-medium text-gray-900">{link.siteName}</span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-xs font-medium text-gray-500 w-16 min-w-[4rem]">站点URL:</span>
                                                        <a
                                                            href={link.siteUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:text-blue-800 break-all"
                                                        >
                                                            {truncateText(link.siteUrl, 30)}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-xs font-medium text-gray-500 w-16 min-w-[4rem]">站点描述:</span>
                                                        <span className="text-xs text-gray-400">{truncateText(link.siteDescription, 40)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingLink === link.id ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">站长名称</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.webmasterName}
                                                        onChange={(e) => setEditForm({...editForm, webmasterName: e.target.value})}
                                                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                                        placeholder="站长名称"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">联系方式</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.contact}
                                                        onChange={(e) => setEditForm({...editForm, contact: e.target.value})}
                                                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                                        placeholder="联系方式"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">图标URL</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.siteIcon}
                                                        onChange={(e) => setEditForm({...editForm, siteIcon: e.target.value})}
                                                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                                        placeholder="图标URL"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-start">
                                                    <span className="text-xs font-medium text-gray-500 w-16 min-w-[4rem]">站长名称:</span>
                                                    <span className="text-sm text-gray-900">{link.webmasterName}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="text-xs font-medium text-gray-500 w-16 min-w-[4rem]">联系方式:</span>
                                                    <span className="text-sm text-gray-500">{link.contact}</span>
                                                </div>
                                                {link.siteIcon && (
                                                    <div className="flex items-start">
                                                        <span className="text-xs font-medium text-gray-500 w-16 min-w-[4rem]">图标URL:</span>
                                                        <span
                                                            className="text-xs text-gray-500 cursor-pointer hover:text-blue-600 break-all"
                                                            title={link.siteIcon}
                                                            onClick={() => copyToClipboard(link.siteIcon)}
                                                        >
                                                            {truncateText(link.siteIcon, 40)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                                        {editingLink === link.id ? (
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => saveEdit(link.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    保存
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    取消
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEdit(link)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    编辑
                                                </button>
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

            {showAddModal && (
                <>
                <div className="fixed inset-0 backdrop-blur-sm bg-transparent z-40" onClick={closeAddModal}></div>
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">添加友链</h3>
                                <button
                                    onClick={closeAddModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        站点名称 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addForm.siteName}
                                        onChange={(e) => setAddForm({...addForm, siteName: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="请输入站点名称"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        站点 URL <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={addForm.siteUrl}
                                        onChange={(e) => setAddForm({...addForm, siteUrl: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="https://example.com/"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        站点图标 URL
                                    </label>
                                    <input
                                        type="url"
                                        value={addForm.siteIcon}
                                        onChange={(e) => setAddForm({...addForm, siteIcon: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="https://example.com/favicon.ico"
                                    />
                                    {addForm.siteIcon && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 mb-2">预览：</p>
                                            <img
                                                src={addForm.siteIcon}
                                                alt="图标预览"
                                                className="w-16 h-16 rounded-lg object-contain border"
                                                onError={(e) => e.target.src = '/image_error.svg'}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        站点描述 <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={addForm.siteDescription}
                                        onChange={(e) => setAddForm({...addForm, siteDescription: e.target.value})}
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                                        placeholder="请输入站点描述"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            站长名称 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={addForm.webmasterName}
                                            onChange={(e) => setAddForm({...addForm, webmasterName: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="请输入站长名称"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            联系方式 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={addForm.contact}
                                            onChange={(e) => setAddForm({...addForm, contact: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="邮箱 / QQ / 微信等"
                                        />
                                    </div>
                                </div>

                                <div className="px-6 py-4 flex justify-end space-x-3">
                                    <button
                                        onClick={closeAddModal}
                                        className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleAddFriendLink}
                                        disabled={savingAdd || !addForm.siteName || !addForm.siteUrl || !addForm.siteDescription || !addForm.webmasterName || !addForm.contact}
                                        className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {savingAdd ? '添加中...' : '确认添加'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            )}

            {showSiteConfigModal && (
                <>
                <div className="fixed inset-0 backdrop-blur-sm bg-transparent z-40" onClick={closeSiteConfigModal}></div>
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">配置本站友链信息</h3>
                                <button
                                    onClick={closeSiteConfigModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {loadingSiteConfig ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            站点名称 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={siteConfigForm.siteName}
                                            onChange={(e) => setSiteConfigForm({...siteConfigForm, siteName: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="请输入站点名称"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            站点 URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={siteConfigForm.siteUrl}
                                            onChange={(e) => setSiteConfigForm({...siteConfigForm, siteUrl: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="https://example.com/"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            站点 Logo URL
                                        </label>
                                        <input
                                            type="url"
                                            value={siteConfigForm.siteLogo}
                                            onChange={(e) => setSiteConfigForm({...siteConfigForm, siteLogo: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="https://example.com/favicon.ico"
                                        />
                                        {siteConfigForm.siteLogo && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-500 mb-2">预览：</p>
                                                <img
                                                    src={siteConfigForm.siteLogo}
                                                    alt="Logo预览"
                                                    className="w-16 h-16 rounded-lg object-cover border"
                                                    onError={(e) => e.target.src = '/image_error.svg'}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            站点描述
                                        </label>
                                        <textarea
                                            value={siteConfigForm.description}
                                            onChange={(e) => setSiteConfigForm({...siteConfigForm, description: e.target.value})}
                                            rows={4}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                                            placeholder="请输入站点描述，用于友链交换展示"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            友链交换规则
                                        </label>
                                        <textarea
                                            value={siteConfigForm.applyRules}
                                            onChange={(e) => setSiteConfigForm({...siteConfigForm, applyRules: e.target.value})}
                                            rows={6}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                                            placeholder={'例如：\n1. 请先将本站链接添加到您的网站\n2. 网站内容健康向上，无违法违规信息\n3. 网站能正常访问，非临时性页面\n4. 不接受赌博、色情等违法网站'}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">此规则将在前端友链申请页面显示，指导用户如何申请友链</p>
                                    </div>

                                    <div className="px-6 py-4 flex justify-end space-x-3">
                                        <button
                                            onClick={closeSiteConfigModal}
                                            className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={saveSiteConfig}
                                            disabled={!siteConfigForm.siteName || !siteConfigForm.siteUrl}
                                            className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            保存配置
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}
