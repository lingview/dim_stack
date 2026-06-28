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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [jumpPage, setJumpPage] = useState('');
    const pageSize = 10;

    const fetchComments = async (p) => {
        setLoading(true);
        try {
            const endpoint = mode === 'pending' ? '/commentreview/pending' : '/commentreview/all';
            const response = await apiClient.get(`${endpoint}?page=${p}&size=10`);
            const data = response.data || response;
            setComments(data.data || []);
            setTotalPages(data.total_pages || 1);
            setTotalItems(data.total || (data.data ? data.data.length : 0));
            setCurrentPage(p);
        } catch (err) {
            showToast('获取评论列表失败');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchComments(1); }, [mode]);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        fetchComments(newPage);
    };

    const handleJumpPage = (e) => {
        e.preventDefault();
        const pageNum = parseInt(jumpPage);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            handlePageChange(pageNum);
            setJumpPage('');
        }
    };

    const handleUpdateStatus = async (commentId, status) => {
        try {
            const response = await apiClient.put(`/commentreview/${commentId}/status`, { status });
            if (response.code !== 200) {
                showToast('操作失败: ' + (response.message || '未知错误'));
                return;
            }
            showToast('操作成功');
            fetchComments(currentPage);
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
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            待审核
                        </button>
                        <button
                            onClick={() => setMode('all')}
                            className={`px-3 py-1.5 text-sm rounded-md transition ${
                                mode === 'all'
                                    ? 'bg-blue-500 text-white'
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
    );
}
