import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import DOMPurify from 'dompurify';

export default function ArticlesReview() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [articleDetail, setArticleDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchArticles(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const sanitizeHtml = (html) => {
        try {
            if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
                const clean = DOMPurify.sanitize(html, {
                    USE_PROFILES: { html: true },
                    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|data:image\/)/i
                });

                try {
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = clean;
                    const anchors = wrapper.querySelectorAll('a');
                    anchors.forEach(a => {
                        a.setAttribute('target', '_blank');
                        a.setAttribute('rel', 'noopener noreferrer');
                        const href = a.getAttribute('href') || '';
                        if (!/^(?:https?:|mailto:|tel:|\/|#)/i.test(href) && !/^data:image\//i.test(href)) {
                            a.removeAttribute('href');
                        }
                    });
                    return wrapper.innerHTML;
                } catch (e) {
                    return clean;
                }
            }
        } catch (e) {
            console.warn('DOMPurify sanitize failed:', e);
        }

        try {
            const textWrapper = document.createElement('div');
            textWrapper.textContent = html;
            return `<pre class="whitespace-pre-wrap">${textWrapper.innerHTML}</pre>`;
        } catch (e) {
            return '';
        }
    };

    const fetchArticles = async (page, size) => {
        setLoading(true);
        try {
            const res = await apiClient.get('/articlereview/getarticlelist', {
                params: { page, size }
            });

            const response = res.data ?? res;
            if (response && Array.isArray(response.articles)) {
                setArticles(response.articles);
                setTotalPages(Math.ceil((response.total || response.articles.length) / (response.size || size)));
            } else {
                setArticles([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('获取文章列表失败:', error);
            setArticles([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
    };

    const handleViewDetail = async (articleId) => {
        setDetailLoading(true);
        setShowDetail(true);
        setSelectedArticle(articleId);

        try {
            const res = await apiClient.get('/articlereview/getarticlecontent', {
                params: { articleId }
            });

            const response = res.data ?? res;

            if (response) {
                const safeHtml = sanitizeHtml(response.article_content || '');
                setArticleDetail({ ...response, article_content: safeHtml });
            } else {
                setArticleDetail(null);
            }
        } catch (error) {
            console.error('获取文章详情失败:', error);
            setArticleDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleStatusChange = async (articleId, status) => {
        try {
            const res = await apiClient.post('/articlereview/articlestatus', {
                articleId,
                status
            });
            const response = res.data ?? res;

            if (response && response.success) {
                setArticles(prev => prev.map(article =>
                    article.article_id === articleId
                        ? { ...article, status }
                        : article
                ));

                if (articleDetail && articleDetail.article_id === articleId) {
                    setArticleDetail(prev => ({ ...prev, status }));
                }

                alert('文章状态更新成功');

                if (status !== 3) {
                    setShowDetail(false);
                    setSelectedArticle(null);
                    setArticleDetail(null);
                    fetchArticles(currentPage, pageSize);
                }
            } else {
                throw new Error('后端返回失败或 success=false');
            }
        } catch (error) {
            console.error('更新文章状态失败:', error);
            alert('更新文章状态失败');
        }
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedArticle(null);
        setArticleDetail(null);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">文章审核</h2>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">文章审核</h2>
            </div>

            {articles.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">暂无需要审核的文章</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    文章标题
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    作者
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    分类
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    标签
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    创建时间
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {articles.map((article) => (
                                <tr key={article.article_id} className={selectedArticle === article.article_id ? 'bg-blue-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{article.article_name}</div>
                                        <div className="text-sm text-gray-500 line-clamp-1">{article.excerpt}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {article.author_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {article.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {article.tag}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(article.create_time).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetail(article.article_id)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            查看
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 分页组件 */}
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
                                        第 <span className="font-medium">{currentPage}</span> 页，共 <span className="font-medium">{totalPages}</span> 页
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <span className="sr-only">上一页</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {[...Array(totalPages)].map((_, i) => {
                                            const page = i + 1;
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                        currentPage === page
                                                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <span className="sr-only">下一页</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showDetail && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseDetail}
                >
                    <div
                        className="absolute inset-0 bg-white/5 backdrop-blur-sm transition-opacity"
                        aria-hidden="true"
                    />
                    <div
                        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">文章详情</h3>
                            <button
                                onClick={handleCloseDetail}
                                className="text-gray-400 hover:text-gray-500"
                                aria-label="关闭"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : articleDetail ? (
                            <div className="overflow-y-auto flex-1">
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{articleDetail.article_name}</h2>
                                    <div className="flex items-center text-sm text-gray-500 mb-6">
                                        <span>状态:
                                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                                articleDetail.status === 1 ? 'bg-green-100 text-green-800' :
                                                    articleDetail.status === 2 ? 'bg-yellow-100 text-yellow-800' :
                                                        articleDetail.status === 3 ? 'bg-blue-100 text-blue-800' :
                                                            articleDetail.status === 0 ? 'bg-gray-100 text-gray-800' :
                                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {articleDetail.status === 1 ? '已发布' :
                                                    articleDetail.status === 2 ? '未发布' :
                                                        articleDetail.status === 3 ? '待审核' :
                                                            articleDetail.status === 0 ? '已删除' : '违规'}
                                            </span>
                                        </span>
                                        <span className="mx-2">•</span>
                                        <span>分类: {articleDetail.category}</span>
                                        <span className="mx-2">•</span>
                                        <span>标签: {articleDetail.tag}</span>
                                    </div>

                                    {articleDetail.excerpt && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">摘要</h4>
                                            <p className="text-gray-600">{articleDetail.excerpt}</p>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">正文</h4>
                                        <div className="prose max-w-none border border-gray-200 rounded p-4">
                                            <div dangerouslySetInnerHTML={{ __html: articleDetail.article_content }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                                    {articleDetail.status === 3 && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(articleDetail.article_id, 1)}
                                                className="px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                通过审核
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(articleDetail.article_id, 4)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                标记违规
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleCloseDetail}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        关闭
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-64">
                                <p className="text-gray-500">无法加载文章详情</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
