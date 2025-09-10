import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import { getConfig } from "../../utils/config.jsx";

export default function CommentsView() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState('');
    const [articles, setArticles] = useState([]);
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

    const getFullAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        try {
            const config = getConfig();
            return config.getFullUrl(url);
        } catch (error) {
            if (url.startsWith('/')) {
                return url;
            }
            return `/upload/${url}`;
        }
    };

    // 获取文章列表
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await apiClient.get('/articles');
                if (response && response.data && response.data.articles) {
                    setArticles(response.data.articles);
                }
            } catch (err) {
                console.error('获取文章列表失败:', err);
            }
        };
        fetchArticles();
    }, []);

    // 获取评论列表
    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            setError(null);
            try {
                let response;
                if (selectedArticle) {
                    response = await apiClient.get(`/backentcomments/article/${selectedArticle}`);
                } else {
                    response = await apiClient.get(`/backentcomments?page=${currentPage}&size=${pageSize}`);
                }
                if (selectedArticle) {
                    setComments(response.comments || []);
                } else {
                    setComments(response.comments || []);
                    setTotalPages(response.totalPages || 1);
                }
            } catch (err) {
                setError('获取评论失败: ' + (err.message || '未知错误'));
                console.error('获取评论失败:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [selectedArticle, currentPage, pageSize]);

    // 删除评论
    const handleDeleteComment = async (comment_id) => {
        if (!window.confirm('确定要删除这条评论吗？')) return;
        try {
            await apiClient.delete(`/backentcomments/${comment_id}`);
            setComments(comments.filter(comment => comment.comment_id !== comment_id));
            alert('评论删除成功');
        } catch (err) {
            alert('删除评论失败: ' + (err.message || '未知错误'));
            console.error('删除评论失败:', err);
        }
    };

    // 编辑评论
    const startEditComment = (comment) => {
        setEditingComment(comment.comment_id);
        setEditContent(comment.content);
    };

    const saveEditComment = async () => {
        if (!editContent.trim()) {
            alert('评论内容不能为空');
            return;
        }
        try {
            await apiClient.put(`/backentcomments/${editingComment}`, { content: editContent });
            setComments(comments.map(comment =>
                comment.comment_id === editingComment
                    ? { ...comment, content: editContent }
                    : comment
            ));
            setEditingComment(null);
            setEditContent('');
            alert('评论更新成功');
        } catch (err) {
            alert('更新评论失败: ' + (err.message || '未知错误'));
            console.error('更新评论失败:', err);
        }
    };

    const cancelEditComment = () => {
        setEditingComment(null);
        setEditContent('');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // 格式化日期
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    };

    // 获取文章标题
    const getArticleTitle = (article_id) => {
        const article = articles.find(a => a.article_id === article_id);
        return article ? article.title : '未知文章';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">评论管理</h2>
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedArticle}
                        onChange={(e) => setSelectedArticle(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">所有评论</option>
                        {articles.map(article => (
                            <option key={article.article_id} value={article.article_id}>
                                {article.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    评论内容
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    作者
                                </th>
                                {!selectedArticle && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        所属文章
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    时间
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    点赞数
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {comments.length === 0 ? (
                                <tr>
                                    <td colSpan={selectedArticle ? 5 : 6} className="px-6 py-4 text-center text-gray-500">
                                        暂无评论数据
                                    </td>
                                </tr>
                            ) : (
                                comments.map((comment) => (
                                    <tr key={comment.comment_id}>
                                        <td className="px-6 py-4">
                                            {editingComment === comment.comment_id ? (
                                                <div className="flex flex-col space-y-2">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            rows="3"
                                                        />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={saveEditComment}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                                                        >
                                                            保存
                                                        </button>
                                                        <button
                                                            onClick={cancelEditComment}
                                                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                                                        >
                                                            取消
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-900 max-w-md break-words whitespace-pre-line">
                                                    {comment.content}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {comment.avatar && (
                                                    <img
                                                        src={getFullAvatarUrl(comment.avatar)}
                                                        alt={comment.username}
                                                        className="h-8 w-8 rounded-full mr-2"
                                                        onError={(e) => { e.target.src = '/image_error.svg'; }}
                                                    />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {comment.username}
                                                    </div>
                                                    {comment.to_comment_username && (
                                                        <div className="text-xs text-gray-500">
                                                            回复 @{comment.to_comment_username}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {!selectedArticle && (
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {comment.article_title || getArticleTitle(comment.article_id)}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(comment.create_time)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {comment.comment_like_count}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            {editingComment !== comment.comment_id && (
                                                <>
                                                    <button
                                                        onClick={() => startEditComment(comment)}
                                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                                    >
                                                        编辑
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.comment_id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        删除
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {!selectedArticle && totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    上一页
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                        >
                                            <span className="sr-only">上一页</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                        >
                                            <span className="sr-only">下一页</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
        </div>
    );
}
