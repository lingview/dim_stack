import { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import { showToast } from '../../utils/toastManager.jsx';
import { getConfig } from '../../utils/config.jsx';

const getFullAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    try {
        return getConfig().getFullUrl(url);
    } catch {
        return url.startsWith('/') ? url : `/upload/${url}`;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
};

const STATUS_MAP = { 1: '已通过', 3: '待审核', 4: '违规' };
const STATUS_COLOR = {
    1: 'bg-green-100 text-green-800',
    3: 'bg-blue-100 text-blue-800',
    4: 'bg-red-100 text-red-800'
};

export default function CommentsReview() {
    const [mode, setMode] = useState('pending');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchComments = async (p) => {
        setLoading(true);
        try {
            const endpoint = mode === 'pending' ? '/commentreview/pending' : '/commentreview/all';
            const response = await apiClient.get(`${endpoint}?page=${p}&size=10`);
            const data = response.data || response;
            setComments(data.data || []);
            setTotalPages(data.total_pages || 1);
            setPage(p);
        } catch (err) {
            showToast('获取评论列表失败');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchComments(1); }, [mode]);

    const handleUpdateStatus = async (commentId, status) => {
        try {
            const response = await apiClient.put(`/commentreview/${commentId}/status`, { status });
            if (response.code !== 200) {
                showToast('操作失败: ' + (response.message || '未知错误'));
                return;
            }
            showToast('操作成功');
            fetchComments(page);
        } catch (err) {
            showToast('操作失败');
            console.error(err);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">评论审核</h2>
                        <p className="mt-1 text-sm text-gray-500">审核用户提交的评论</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setMode('pending')}
                            className={`px-3 py-1.5 text-sm rounded-md transition ${
                                mode === 'pending'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            待审核
                        </button>
                        <button
                            onClick={() => setMode('all')}
                            className={`px-3 py-1.5 text-sm rounded-md transition ${
                                mode === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            全部
                        </button>
                    </div>
                </div>
            </div>

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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">评论内容</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">所属文章</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {comments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            {mode === 'pending' ? '暂无待审核评论' : '暂无评论'}
                                        </td>
                                    </tr>
                                ) : (
                                    comments.map((comment) => (
                                        <tr key={comment.comment_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {comment.content}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {comment.avatar && (
                                                        <img
                                                            src={getFullAvatarUrl(comment.avatar)}
                                                            alt=""
                                                            className="h-6 w-6 rounded-full mr-2"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    )}
                                                    <span className="text-sm text-gray-900">
                                                        {comment.username || '未知用户'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-[120px] truncate">
                                                {comment.article_title || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                {formatDate(comment.create_time)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLOR[comment.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {STATUS_MAP[comment.status] || comment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    {comment.status === 3 && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(comment.comment_id, 1)}
                                                                className="text-green-600 hover:text-green-900 text-sm"
                                                            >
                                                                通过
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(comment.comment_id, 4)}
                                                                className="text-red-600 hover:text-red-900 text-sm"
                                                            >
                                                                违规
                                                            </button>
                                                        </>
                                                    )}
                                                    {comment.status === 1 && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(comment.comment_id, 3)}
                                                            className="text-blue-600 hover:text-blue-900 text-sm"
                                                        >
                                                            退回
                                                        </button>
                                                    )}
                                                    {comment.status === 4 && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(comment.comment_id, 3)}
                                                            className="text-blue-600 hover:text-blue-900 text-sm"
                                                        >
                                                            重审
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                第 {page} / {totalPages} 页
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => fetchComments(1)}
                                    disabled={page === 1}
                                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                >
                                    首页
                                </button>
                                <button
                                    onClick={() => fetchComments(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                >
                                    上一页
                                </button>
                                <button
                                    onClick={() => fetchComments(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                >
                                    下一页
                                </button>
                                <button
                                    onClick={() => fetchComments(totalPages)}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                >
                                    末页
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
