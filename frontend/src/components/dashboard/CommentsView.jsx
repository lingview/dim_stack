import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import { getConfig } from "../../utils/config.jsx";
import {showToast} from "../../utils/toastManager.jsx";
import DataTable from './DataTable';

const STATUS_MAP = { 1: '已发布', 3: '待审核', 4: '违规' };
const STATUS_COLOR = {
    1: 'bg-green-100 text-green-800',
    3: 'bg-blue-100 text-blue-800',
    4: 'bg-red-100 text-red-800'
};

export default function CommentsView() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState('');
    const [articles, setArticles] = useState([]);
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editingTime, setEditingTime] = useState(null);
    const [editTimeValue, setEditTimeValue] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editUserValue, setEditUserValue] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

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
                    const escapedArticles = response.data.articles.map(article => ({
                        ...article,
                        title: escapeHtml(article.title) || ''
                    }));
                    setArticles(escapedArticles);
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

                if (response && response.code === 200 && response.data) {
                    const data = response.data;
                    if (selectedArticle) {
                        const escapedComments = (data.comments || []).map(comment => ({
                            ...comment,
                            content: escapeHtml(comment.content) || '',
                            username: escapeHtml(comment.username) || '',
                            to_comment_username: escapeHtml(comment.to_comment_username) || '',
                            article_title: escapeHtml(comment.article_title) || ''
                        }));
                        setComments(escapedComments);
                    } else {
                        const escapedComments = (data.comments || []).map(comment => ({
                            ...comment,
                            content: escapeHtml(comment.content) || '',
                            username: escapeHtml(comment.username) || '',
                            to_comment_username: escapeHtml(comment.to_comment_username) || '',
                            article_title: escapeHtml(comment.article_title) || ''
                        }));
                        setComments(escapedComments);
                        setTotalPages(data.totalPages || 1);
                    }
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
            const response = await apiClient.delete(`/backentcomments/${comment_id}`);
            if (response.code === 200) {
                setComments(comments.filter(comment => comment.comment_id !== comment_id));
                showToast('评论删除成功');
            } else {
                showToast('删除评论失败: ' + (response.message || '未知错误'));
            }
        } catch (err) {
            showToast('删除评论失败: ' + (err.message || '未知错误'));
            console.error('删除评论失败:', err);
        }
    };

    // 编辑评论
    const startEditComment = (comment) => {
        setEditingComment(comment.comment_id);
        setEditContent(unescapeHtml(comment.content));
    };

    const saveEditComment = async () => {
        if (!editContent.trim()) {
            showToast('评论内容不能为空');
            return;
        }
        try {
            const escapedContent = escapeHtml(editContent);
            const response = await apiClient.put(`/backentcomments/${editingComment}`, { content: escapedContent });
            if (response.code !== 200) {
                showToast('更新评论失败: ' + (response.message || '未知错误'));
                return;
            }
            setComments(comments.map(comment =>
                comment.comment_id === editingComment
                    ? { ...comment, content: escapedContent }
                    : comment
            ));
            setEditingComment(null);
            setEditContent('');
            showToast('评论更新成功');
        } catch (err) {
            showToast('更新评论失败: ' + (err.message || '未知错误'));
            console.error('更新评论失败:', err);
        }
    };

    const cancelEditComment = () => {
        setEditingComment(null);
        setEditContent('');
    };

    const startEditTime = (comment) => {
        setEditingTime(comment.comment_id);
        const datePart = comment.create_time.slice(0, 16);
        setEditTimeValue(datePart);
    };

    const saveEditTime = async () => {
        if (!editTimeValue) {
            showToast('请选择时间');
            return;
        }
        try {
            const create_time = editTimeValue + ':00';
            const response = await apiClient.put(`/backentcomments/${editingTime}/time`, { create_time });
            if (response.code !== 200) {
                showToast('更新时间失败: ' + (response.message || '未知错误'));
                return;
            }
            setComments(comments.map(comment =>
                comment.comment_id === editingTime
                    ? { ...comment, create_time: create_time }
                    : comment
            ));
            setEditingTime(null);
            setEditTimeValue('');
            showToast('评论时间更新成功');
        } catch (err) {
            showToast('更新时间失败: ' + (err.message || '未知错误'));
            console.error('更新时间失败:', err);
        }
    };

    const cancelEditTime = () => {
        setEditingTime(null);
        setEditTimeValue('');
    };

    const startEditUser = (comment) => {
        setEditingUser(comment.comment_id);
        setEditUserValue(unescapeHtml(comment.username));
        setUserSearchResults([]);
    };

    const handleUserSearch = async (value) => {
        setEditUserValue(value);
        if (!value.trim()) {
            setUserSearchResults([]);
            return;
        }
        try {
            const response = await apiClient.get(`/backentcomments/users/search?q=${encodeURIComponent(value)}`);
            const data = response.data || response;
            setUserSearchResults(Array.isArray(data) ? data : []);
        } catch {
            setUserSearchResults([]);
        }
    };

    const selectUser = (user) => {
        setEditUserValue(user.username);
        setUserSearchResults([]);
    };

    const saveEditUser = async () => {
        if (!editUserValue.trim()) {
            showToast('用户名不能为空');
            return;
        }
        try {
            const response = await apiClient.put(`/backentcomments/${editingUser}/user`, { username: editUserValue });
            if (response.code !== 200) {
                showToast('更新用户失败: ' + (response.message || '未知错误'));
                return;
            }
            setComments(comments.map(comment =>
                comment.comment_id === editingUser
                    ? { ...comment, username: escapeHtml(editUserValue), user_id: comment.user_id }
                    : comment
            ));
            setEditingUser(null);
            setEditUserValue('');
            showToast('评论用户更新成功');
        } catch (err) {
            showToast('更新用户失败: ' + (err.message || '未知错误'));
            console.error('更新用户失败:', err);
        }
    };

    const cancelEditUser = () => {
        setEditingUser(null);
        setEditUserValue('');
    };

    // 格式化日期
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    };

    // 获取文章标题
    const getArticleTitle = (article_id) => {
        const article = articles.find(a => a.article_id === article_id);
        return article ? unescapeHtml(article.title) : '未知文章';
    };

    const columns = [
        {
            key: 'content',
            label: '评论内容',
            className: '',
            render: (_, comment) => (
                editingComment === comment.comment_id ? (
                    <div className="flex flex-col space-y-2">
                        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" rows="3" />
                        <div className="flex space-x-2">
                            <button onClick={saveEditComment} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">保存</button>
                            <button onClick={cancelEditComment} className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400">取消</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-900 max-w-md truncate">{unescapeHtml(comment.content)}</div>
                )
            )
        },
        {
            key: 'username',
            label: '作者',
            className: '',
            render: (_, comment) => (
                editingUser === comment.comment_id ? (
                    <div className="relative">
                        <input type="text" value={editUserValue} onChange={(e) => handleUserSearch(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36" placeholder="搜索用户..." autoFocus />
                        {userSearchResults.length > 0 && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                                {userSearchResults.map((user) => (
                                    <div key={user.user_id} className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm" onClick={() => selectUser(user)}>
                                        {user.avatar && <img src={getFullAvatarUrl(user.avatar)} alt="" className="h-6 w-6 rounded-full mr-2" onError={(e) => { e.target.style.display = 'none'; }} />}
                                        <span className="text-gray-900">{user.username}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex space-x-2 mt-1">
                            <button onClick={saveEditUser} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">保存</button>
                            <button onClick={cancelEditUser} className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400">取消</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center">
                        {comment.avatar && <img src={getFullAvatarUrl(comment.avatar)} alt={unescapeHtml(comment.username)} className="h-8 w-8 rounded-full mr-2" onError={(e) => { e.target.src = '/image_error.svg'; }} />}
                        <div>
                            <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline" onClick={() => startEditUser(comment)} title="点击修改用户">{unescapeHtml(comment.username)}</div>
                            {comment.to_comment_username && <div className="text-xs text-gray-500">回复 @{unescapeHtml(comment.to_comment_username)}</div>}
                        </div>
                    </div>
                )
            )
        },
        ...(!selectedArticle ? [{
            key: 'article_title',
            label: '所属文章',
            className: 'text-gray-500 max-w-xs truncate',
            render: (_, comment) => unescapeHtml(comment.article_title) || getArticleTitle(comment.article_id)
        }] : []),
        {
            key: 'create_time',
            label: '时间',
            className: 'text-gray-500 whitespace-nowrap',
            render: (_, comment) => (
                editingTime === comment.comment_id ? (
                    <div className="flex items-center space-x-2">
                        <input type="datetime-local" value={editTimeValue} onChange={(e) => setEditTimeValue(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={saveEditTime} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">保存</button>
                        <button onClick={cancelEditTime} className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400">取消</button>
                    </div>
                ) : (
                    <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={() => startEditTime(comment)} title="点击修改时间">
                        {formatDate(comment.create_time)}
                    </span>
                )
            )
        },
        { key: 'comment_like_count', label: '点赞数', className: 'text-gray-500' },
        {
            key: 'status',
            label: '状态',
            className: '',
            render: (status) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLOR[status] || 'bg-gray-100 text-gray-800'}`}>
                    {STATUS_MAP[status] || status}
                </span>
            )
        },
        {
            key: 'actions',
            label: '操作',
            className: 'text-right font-medium',
            headerClassName: 'text-right',
            render: (_, comment) => (
                editingComment !== comment.comment_id && editingTime !== comment.comment_id && editingUser !== comment.comment_id ? (
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => startEditComment(comment)} className="text-blue-600 hover:text-blue-900">编辑内容</button>
                        <button onClick={() => handleDeleteComment(comment.comment_id)} className="text-red-600 hover:text-red-900">删除</button>
                    </div>
                ) : null
            )
        }
    ];

    return (
        <DataTable
            title="评论管理"
            loading={loading}
            columns={columns}
            data={comments}
            keyExtractor={(item) => item.comment_id}
            emptyText="暂无评论数据"
            error={error}
            pagination={!selectedArticle && totalPages > 1 ? {
                currentPage,
                totalPages,
                pageSize,
                onPageChange: setCurrentPage
            } : null}
        />
    );
}
