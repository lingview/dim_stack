import { Plus, Edit, Trash2, EyeOff, Send, Upload } from 'lucide-react';
import apiClient from "../../utils/axios.jsx";
import React, { useState, useEffect, useRef } from 'react';

export default function ArticlesView({ onNewArticle, onEditArticle, onImportArticle, articles: externalArticles, shouldRefresh, setShouldRefresh }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalArticles, setTotalArticles] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [localArticles, setLocalArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const importFileInputRef = useRef(null);

    useEffect(() => {
        fetchArticles(currentPage, pageSize);
    }, [currentPage, pageSize]);

    useEffect(() => {
        if (shouldRefresh) {
            fetchArticles(currentPage, pageSize);
            setShouldRefresh(false);
        }
    }, [shouldRefresh, currentPage, pageSize, setShouldRefresh]);

    useEffect(() => {
        if (externalArticles && Array.isArray(externalArticles.articles)) {
            setLocalArticles(externalArticles.articles);
            setTotalArticles(externalArticles.total || 0);
            setTotalPages(externalArticles.totalPages || Math.ceil((externalArticles.total || 0) / (externalArticles.size || pageSize)));
            setLoading(false);
        }
    }, [externalArticles]);

    const fetchArticles = async (page, size) => {
        setLoading(true);
        try {
            const response = await apiClient.get('/getarticlelist', {
                params: { page, size }
            });

            if (response.success && response.data) {
                setLocalArticles(response.data.articles || []);
                setTotalArticles(response.data.total || 0);
                setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / size));
            } else {
                setLocalArticles([]);
                setTotalArticles(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('获取文章列表失败:', error);
            setLocalArticles([]);
            setTotalArticles(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleImportClick = () => {
        importFileInputRef.current?.click();
    };

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
            alert('请选择 Markdown 文件（.md 或 .markdown）');
            e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('文件大小不能超过 5MB');
            e.target.value = '';
            return;
        }

        try {
            const content = await file.text();

            const lines = content.split('\n');
            let title = '';
            let articleContent = content;

            if (lines.length > 0) {
                const firstLine = lines[0].trim();

                if (firstLine.startsWith('#')) {
                    title = firstLine.replace(/^#+\s*/, '').trim();
                    articleContent = lines.slice(1).join('\n').trim();
                } else if (firstLine) {
                    title = firstLine;
                    articleContent = lines.slice(1).join('\n').trim();
                }
            }

            if (!title) {
                title = file.name.replace(/\.(md|markdown)$/i, '');
            }

            if (onImportArticle) {
                onImportArticle({
                    article_name: title,
                    article_content: articleContent
                });
            }

        } catch (error) {
            console.error('导入文件失败:', error);
            alert('导入文件失败: ' + error.message);
        } finally {
            e.target.value = '';
        }
    };

    const escapeHtml = (unsafe) => {
        if (!unsafe) return unsafe;

        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const unescapeHtml = (safe) => {
        if (!safe) return safe;

        return safe
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");
    };

    const formatDate = (dateString) => {
        if (!dateString) return '未知日期';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '日期格式错误';
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        } catch (e) {
            return '日期格式错误';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 1: return '已发布';
            case 2: return '未发布';
            case 3: return '待审核';
            case 4: return '违规 - 请编辑后重新发布';
            default: return '未知';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 1: return 'bg-green-100 text-green-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            case 3: return 'bg-red-100 text-red-800';
            case 4: return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
    };

    const handleDeleteArticle = async (articleId) => {
        if (!window.confirm('确定要删除这篇文章吗？')) {
            return;
        }

        try {
            const response = await apiClient.post('/deletearticle', { article_id: articleId });

            if (response.success) {
                alert('文章删除成功');
                fetchArticles(currentPage, pageSize);
            } else {
                alert(response.message || '删除失败');
            }
        } catch (error) {
            console.error('删除文章时出错:', error);
            alert('删除文章时出错');
        }
    };

    const handleUnpublishArticle = async (articleId) => {
        if (!window.confirm('确定要取消发布这篇文章吗？')) {
            return;
        }

        try {
            const response = await apiClient.post('/unpublisharticle', { article_id: articleId });

            if (response.success) {
                alert('文章已取消发布');
                fetchArticles(currentPage, pageSize);
            } else {
                alert(response.message || '取消发布失败');
            }
        } catch (error) {
            console.error('取消发布文章时出错:', error);
            alert('取消发布文章时出错');
        }
    };

    const handlePublishArticle = async (articleId) => {
        if (!window.confirm('确定要发布这篇文章吗？')) {
            return;
        }

        try {
            const response = await apiClient.post('/publisharticle', { article_id: articleId });

            if (response.success) {
                alert('文章已发布');
                fetchArticles(currentPage, pageSize);
            } else {
                alert(response.message || '发布失败');
            }
        } catch (error) {
            console.error('发布文章时出错:', error);
            alert('发布文章时出错');
        }
    };

    const handleRemovePassword = async (articleId) => {
        if (!window.confirm('确定要移除这篇文章的密码吗？')) {
            return;
        }

        try {
            const response = await apiClient.post('/removearticlepassword', { article_id: articleId });

            if (response.success) {
                alert('文章密码已移除');
                fetchArticles(currentPage, pageSize);
            } else {
                alert(response.message || '移除密码失败');
            }
        } catch (error) {
            console.error('移除文章密码时出错:', error);
            alert('移除文章密码时出错');
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">文章管理</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onNewArticle}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            新建文章
                        </button>
                    </div>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">文章管理</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleImportClick}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                        <Upload className="h-4 w-4 mr-1" />
                        导入文章
                    </button>
                    <button
                        onClick={onNewArticle}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        新建文章
                    </button>
                </div>
            </div>

            <input
                ref={importFileInputRef}
                type="file"
                accept=".md,.markdown"
                onChange={handleImportFile}
                className="hidden"
            />

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            标题
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            作者
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            日期
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            状态
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {localArticles && localArticles.length > 0 ? (
                        localArticles.map((article, index) => {
                            if (!article) return null;

                            return (
                                <tr key={article.article_id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{unescapeHtml(article.article_name) || '无标题'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{unescapeHtml(article.author_name) || '未知作者'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{formatDate(article.create_time)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(article.status)}`}>
                                            {getStatusLabel(article.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            <button
                                                onClick={() => onEditArticle(article.article_id)}
                                                className="text-blue-600 hover:text-blue-900 flex items-center mr-2"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                编辑
                                            </button>
                                            {article.status === 1 && (
                                                <button
                                                    onClick={() => handleUnpublishArticle(article.article_id)}
                                                    className="text-yellow-600 hover:text-yellow-900 flex items-center mr-2"
                                                >
                                                    <EyeOff className="h-4 w-4 mr-1" />
                                                    取消发布
                                                </button>
                                            )}
                                            {article.status === 2 && (
                                                <button
                                                    onClick={() => handlePublishArticle(article.article_id)}
                                                    className="text-green-600 hover:text-green-900 flex items-center mr-2"
                                                >
                                                    <Send className="h-4 w-4 mr-1" />
                                                    发布
                                                </button>
                                            )}
                                            {article.hasPassword && (
                                                <button
                                                    onClick={() => handleRemovePassword(article.article_id)}
                                                    className="text-purple-600 hover:text-purple-900 flex items-center mr-2"
                                                >
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    关闭密码
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteArticle(article.article_id)}
                                                className="text-red-600 hover:text-red-900 flex items-center"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                删除
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                暂无文章数据
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

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
                                显示第 <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> 到 <span className="font-medium">{Math.min(currentPage * pageSize, totalArticles)}</span> 条结果,共 <span className="font-medium">{totalArticles}</span> 条
                            </p>
                        </div>
                        <div>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
