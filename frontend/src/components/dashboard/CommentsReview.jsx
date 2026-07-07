import { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import { showToast } from '../../utils/toastManager.jsx';
import { getConfig } from '../../utils/config.jsx';
import DataTable from './DataTable';

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

    const columns = [
        { key: 'content', label: '评论内容', className: 'text-gray-900 max-w-xs truncate' },
        {
            key: 'username', label: '用户', className: '',
            render: (val, comment) => (
                <div className="flex items-center">
                    {comment.avatar && (
                        <img src={getFullAvatarUrl(comment.avatar)} alt="" className="h-6 w-6 rounded-full mr-2"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                    <span className="text-sm text-gray-900">{val || '未知用户'}</span>
                </div>
            )
        },
        { key: 'article_title', label: '所属文章', className: 'text-gray-500 max-w-[120px] truncate', render: (val) => val || '-' },
        { key: 'create_time', label: '时间', className: 'text-gray-500 whitespace-nowrap', render: (val) => formatDate(val) },
        {
            key: 'status', label: '状态', className: '',
            render: (status) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLOR[status] || 'bg-gray-100 text-gray-800'}`}>
                    {STATUS_MAP[status] || status}
                </span>
            )
        },
        {
            key: 'actions', label: '操作', className: 'text-right font-medium',
            headerClassName: 'text-right',
            render: (_, comment) => (
                <div className="flex justify-end space-x-2">
                    {comment.status === 3 && (
                        <>
                            <button onClick={() => handleUpdateStatus(comment.comment_id, 1)} className="text-green-600 hover:text-green-900 text-sm">通过</button>
                            <button onClick={() => handleUpdateStatus(comment.comment_id, 4)} className="text-red-600 hover:text-red-900 text-sm">违规</button>
                        </>
                    )}
                    {comment.status === 1 && (
                        <button onClick={() => handleUpdateStatus(comment.comment_id, 3)} className="text-blue-600 hover:text-blue-900 text-sm">退回</button>
                    )}
                    {comment.status === 4 && (
                        <button onClick={() => handleUpdateStatus(comment.comment_id, 3)} className="text-blue-600 hover:text-blue-900 text-sm">重审</button>
                    )}
                </div>
            )
        }
    ];

    return (
        <DataTable
            title="评论审核"
            loading={loading}
            columns={columns}
            data={comments}
            keyExtractor={(item) => item.comment_id}
            emptyText={mode === 'pending' ? '暂无待审核评论' : '暂无评论'}
            headerExtra={<p className="mt-1 text-sm text-gray-500">审核用户提交的评论</p>}
            headerActions={
                <div className="flex space-x-2">
                    <button onClick={() => setMode('pending')}
                        className={`px-3 py-1.5 text-sm rounded-md transition ${mode === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        待审核
                    </button>
                    <button onClick={() => setMode('all')}
                        className={`px-3 py-1.5 text-sm rounded-md transition ${mode === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        全部
                    </button>
                </div>
            }
            pagination={totalPages > 1 ? {
                currentPage,
                totalPages,
                totalItems,
                pageSize,
                onPageChange: handlePageChange
            } : null}
        />
    );
}
