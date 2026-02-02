import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';

const MediaPreviewModal = ({ mediaItem, onClose }) => {
    if (!mediaItem) return null;

    const { type, src, filename } = mediaItem;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
                aria-hidden="true"
            />

            <div
                className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                        {type} 预览
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                        aria-label="关闭"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {type === 'image' && (
                        <div className="flex justify-center">
                            <img
                                src={src}
                                alt="预览图片"
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </div>
                    )}

                    {type === 'video' && (
                        <div className="flex justify-center">
                            <iframe
                                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { margin: 0; padding: 20px; background: #f3f4f6; }
                      video { max-width: 100%; max-height: 70vh; }
                    </style>
                  </head>
                  <body>
                    <video src="${src}" controls style="width: 100%;"></video>
                  </body>
                  </html>
                `}
                                title="视频预览"
                                className="w-full h-[70vh] border-0"
                            />
                        </div>
                    )}

                    {type === 'audio' && (
                        <div className="flex justify-center">
                            <iframe
                                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { margin: 0; padding: 20px; background: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100%; }
                      audio { width: 100%; }
                    </style>
                  </head>
                  <body>
                    <audio src="${src}" controls></audio>
                  </body>
                  </html>
                `}
                                title="音频预览"
                                className="w-full h-32 border-0"
                            />
                        </div>
                    )}

                    {type === 'archive' && (
                        <div className="text-center py-10">
                            <div className="mx-auto bg-gray-100 p-6 rounded-lg max-w-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">压缩包文件</h4>
                                <p className="text-gray-600 mb-4 truncate">{filename}</p>
                                <a
                                    href={src}
                                    download
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    下载文件
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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
    const [reviewMode, setReviewMode] = useState('pending');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [showMediaPreview, setShowMediaPreview] = useState(false);

    useEffect(() => {
        fetchArticles(currentPage, pageSize);
    }, [currentPage, pageSize, reviewMode]);

    const fetchArticles = async (page, size) => {
        setLoading(true);
        try {
            const endpoint = reviewMode === 'pending'
                ? '/articlereview/getarticlelist'
                : '/articlereview/getallarticles';

            const res = await apiClient.get(endpoint, {
                params: { page, size }
            });

            const response = res;
            if (response && response.code === 200 && response.data && Array.isArray(response.data.articles)) {
                setArticles(response.data.articles);
                setTotalPages(Math.ceil((response.data.total || response.data.articles.length) / (response.data.size || size)));
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

            const response = res;

            if (response && response.code === 200 && response.data) {
                setArticleDetail(response.data);
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
            const response = res;

            if (response && response.code === 200 && response.data && response.data.success) {
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

    const toggleReviewMode = () => {
        setReviewMode(prevMode => prevMode === 'pending' ? 'all' : 'pending');
        setCurrentPage(1);
    };

    // 解析文章内容中的资源文件
    const parseMediaFromContent = (content) => {
        if (!content) return [];

        const mediaItems = [];

        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let match;
        while ((match = imageRegex.exec(content)) !== null) {
            mediaItems.push({
                type: 'image',
                src: match[2],
                filename: match[1]
            });
        }

        // 视频格式
        const videoRegex = /<video\s+src=["']([^"']+)["'][^>]*>/gi;
        while ((match = videoRegex.exec(content)) !== null) {
            mediaItems.push({
                type: 'video',
                src: match[1],
                filename: 'video'
            });
        }

        // 音频格式
        const audioRegex = /<audio\s+src=["']([^"']+)["'][^>]*>/gi;
        while ((match = audioRegex.exec(content)) !== null) {
            mediaItems.push({
                type: 'audio',
                src: match[1],
                filename: match.input.match(/data-filename=["']([^"']+)["']/)?.[1] || 'audio'
            });
        }

        // 压缩包格式
        const archiveRegex = /<archive\s+src=["']([^"']+)["']\s+data-filename=["']([^"']+)["']\s*\/?>/gi;
        while ((match = archiveRegex.exec(content)) !== null) {
            mediaItems.push({
                type: 'archive',
                src: match[1],
                filename: match[2]
            });
        }

        return mediaItems;
    };

    const handleMediaClick = (mediaItem) => {
        setSelectedMedia(mediaItem);
        setShowMediaPreview(true);
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
                <button
                    onClick={toggleReviewMode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    {reviewMode === 'pending' ? '查看全部文章' : '仅查看待审核'}
                </button>
            </div>

            {articles.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        {reviewMode === 'pending'
                            ? '暂无需要审核的文章'
                            : '暂无文章'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    封面图
                                </th>
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
                                    状态
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
                                        {article.article_cover ? (
                                            <div className="relative group w-20 h-20">
                                                <div className="w-full h-full overflow-hidden rounded-md">
                                                    <img
                                                        src={article.article_cover}
                                                        alt="封面图"
                                                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                                    />
                                                </div>
                                                <div
                                                    className="absolute inset-0
               flex items-center justify-center
               opacity-0 group-hover:opacity-100
               cursor-pointer
               transition-opacity duration-200"
                                                    onClick={() => handleMediaClick({type: 'image', src: article.article_cover, filename: 'cover'})}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-8 w-8 text-white pointer-events-none"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs" style={{ width: '20rem' }}>
                                        <div
                                            className="text-sm font-medium text-gray-900 truncate"
                                            title={article.article_name}
                                        >
                                            {article.article_name}
                                        </div>
                                        <div
                                            className="text-sm text-gray-500 truncate"
                                            title={article.excerpt || '无摘要'}
                                        >
                                            {article.excerpt || '无摘要'}
                                        </div>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            article.status === 1 ? 'bg-green-100 text-green-800' :
                                            article.status === 2 ? 'bg-yellow-100 text-yellow-800' :
                                            article.status === 3 ? 'bg-blue-100 text-blue-800' :
                                            article.status === 0 ? 'bg-gray-100 text-gray-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {article.status === 1 ? '已发布' :
                                             article.status === 2 ? '未发布' :
                                             article.status === 3 ? '待审核' :
                                             article.status === 0 ? '已删除' : '违规'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetail(article.article_id)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            查看
                                        </button>
                                        {reviewMode === 'all' && article.status !== 3 && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(article.article_id, 3)}
                                                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                                                >
                                                    设为待审核
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(article.article_id, 4)}
                                                    className="text-red-600 hover:text-red-900"
                                                    disabled={article.status === 4}
                                                >
                                                    标记违规
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
                                        显示第 <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> 到 <span className="font-medium">{Math.min(currentPage * pageSize, totalPages * pageSize)}</span> 条结果,共 <span className="font-medium">{totalPages * pageSize}</span> 条
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
                </>
            )}

            {showDetail && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseDetail}
                >
                    <div
                        className="absolute inset-0 bg-white/20 backdrop-blur-md transition-opacity"
                        aria-hidden="true"
                    />

                    <div
                        className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">文章详情预览</h3>
                            <button
                                onClick={handleCloseDetail}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
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
                            <div className="overflow-y-auto flex-1 flex flex-col md:flex-row">
                                <div className="w-full md:w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
                                    {articleDetail.article_cover && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-2">封面图</h4>
                                            <div className="relative group inline-block">
                                                <img
                                                    src={articleDetail.article_cover}
                                                    alt="文章封面"
                                                    className="max-w-full h-64 object-contain rounded-md border border-gray-200 cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]"
                                                    onClick={() => handleMediaClick({type: 'image', src: articleDetail.article_cover, filename: 'cover'})}
                                                />
                                                <div className="absolute inset-0 group-hover:bg-opacity-20 rounded-md transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                                                     onClick={() => handleMediaClick({type: 'image', src: articleDetail.article_cover, filename: 'cover'})}>
                                                    <div className="bg-white bg-opacity-90 px-4 py-2 rounded-md shadow-lg">
                                                        <div className="flex items-center text-gray-700">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span className="text-sm font-medium">点击查看大图</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                        {articleDetail.article_name}
                                    </h2>

                                    <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 gap-4">
                                        <div className="flex items-center">
                                            <span className="font-medium">状态:</span>
                                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
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
                                        </div>
                                        {articleDetail.category && (
                                            <div className="flex items-center">
                                                <span className="font-medium">分类:</span>
                                                <span className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">{articleDetail.category}</span>
                                            </div>
                                        )}
                                        {articleDetail.tag && (
                                            <div className="flex items-center">
                                                <span className="font-medium">标签:</span>
                                                <span className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">{articleDetail.tag}</span>
                                            </div>
                                        )}
                                    </div>

                                    {articleDetail.excerpt && (
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-300 max-h-40 overflow-y-auto">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-2">文章摘要</h4>
                                            <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                                                {articleDetail.excerpt}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">文章正文</h4>
                                        <div className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap break-words bg-white border border-gray-200 rounded-lg p-6">
                                            {articleDetail.article_content || '无内容'}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            字符数: {(articleDetail.article_content || '').length}
                                        </div>
                                    </div>


                                </div>

                                {/* 媒体资源预览 */}
                                <div className="w-full md:w-1/2 p-6 overflow-y-auto">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">文章媒体资源</h4>

                                    {articleDetail.article_content && parseMediaFromContent(articleDetail.article_content).length > 0 ? (
                                        <div className="space-y-4">
                                            {parseMediaFromContent(articleDetail.article_content).map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() => handleMediaClick(item)}
                                                >
                                                    <div className="flex items-start">
                                                        <div className="mr-4 flex-shrink-0">
                                                            {item.type === 'image' && (
                                                                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                                                    <img
                                                                        src={item.src}
                                                                        alt={item.filename}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = "/fallback-image.svg";
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {item.type === 'video' && (
                                                                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center relative">
                                                                    <video
                                                                        src={item.src}
                                                                        className="w-full h-full object-cover"
                                                                        muted
                                                                        playsInline
                                                                        preload="metadata"
                                                                    />
                                                                    <div className="absolute inset-0  bg-opacity-30 flex items-center justify-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {item.type === 'audio' && (
                                                                <div className="w-16 h-16 bg-green-100 rounded overflow-hidden flex items-center justify-center">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                                    </svg>
                                                                </div>
                                                            )}

                                                            {item.type === 'archive' && (
                                                                <div className="w-16 h-16 bg-purple-100 rounded overflow-hidden flex items-center justify-center">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="font-medium text-gray-900 truncate">{item.filename}</h5>
                                                            <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="mt-2 text-gray-500">暂无媒体资源</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center items-center h-64">
                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-500">无法加载文章详情</p>
                            </div>
                        )}

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                            {articleDetail?.status === 3 && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange(articleDetail.article_id, 1)}
                                        className="px-6 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center border border-green-300"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        通过审核
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(articleDetail.article_id, 4)}
                                        className="px-6 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors flex items-center border border-red-300"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        标记违规
                                    </button>
                                </>
                            )}

                            {/*<button*/}
                            {/*    onClick={handleCloseDetail}*/}
                            {/*    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"*/}
                            {/*>*/}
                            {/*    关闭*/}
                            {/*</button>*/}
                        </div>
                    </div>
                </div>
            )}
            
            {showMediaPreview && selectedMedia && (
                <MediaPreviewModal
                    mediaItem={selectedMedia}
                    onClose={() => {
                        setShowMediaPreview(false);
                        setSelectedMedia(null);
                    }}
                />
            )}
        </div>
    );
}