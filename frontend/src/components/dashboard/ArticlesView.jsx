import { Plus, Edit, Trash2, EyeOff, Send, Upload, Download } from 'lucide-react';
import apiClient from "../../utils/axios.jsx";
import React, { useState, useEffect, useRef } from 'react';
import { showToast } from "../../utils/toastManager";
import DataTable from './DataTable';
export default function ArticlesView({ onNewArticle, onEditArticle, onImportArticle, shouldRefresh, setShouldRefresh }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalArticles, setTotalArticles] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [localArticles, setLocalArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const searchTimeoutRef = useRef(null);
    const importFileInputRef = useRef(null);

    useEffect(() => {
        fetchArticles(currentPage, pageSize, searchKeyword);
    }, [currentPage, pageSize]);

    useEffect(() => {
        if (shouldRefresh) {
            fetchArticles(currentPage, pageSize, searchKeyword);
            setShouldRefresh(false);
        }
    }, [shouldRefresh, pageSize, setShouldRefresh]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);



    const fetchArticles = async (page, size, keyword = '') => {
        setLoading(true);
        try {
            const params = { page, size };
            if (keyword && keyword.trim()) {
                params.keyword = keyword.trim();
            }
            
            const response = await apiClient.get('/getarticlelist', {
                params
            });

            if (response.code === 200 && response.data) {
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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchKeyword(value);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            setCurrentPage(1);
            fetchArticles(1, pageSize, value);
        }, 300);
    };

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
            showToast('请选择 Markdown 文件（.md 或 .markdown）', 'warning');
            e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('文件大小不能超过 5MB', 'warning');
            e.target.value = '';
            return;
        }

        try {
            const content = await file.text();
            const title = file.name.replace(/\.(md|markdown)$/i, '');

            if (onImportArticle) {
                onImportArticle({
                    article_name: title,
                    article_content: content
                });
            }

        } catch (error) {
            console.error('导入文件失败:', error);
            showToast('导入文件失败: ' + error.message, 'error');
        } finally {
            e.target.value = '';
        }
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

    const handleDeleteArticle = async (articleId) => {
        if (!window.confirm('确定要删除这篇文章吗？')) {
            return;
        }

        try {
            const response = await apiClient.post('/deletearticle', { article_id: articleId });

            if (response.code === 200) {
                showToast('文章删除成功', 'info');
                fetchArticles(currentPage, pageSize, searchKeyword);
            } else {
                showToast(response.message || '删除失败', 'error');
            }
        } catch (error) {
            console.error('删除文章时出错:', error);
            showToast('删除文章时出错', 'error');
        }
    };

    const handleUnpublishArticle = async (articleId) => {
        if (!window.confirm('确定要取消发布这篇文章吗？')) {
            return;
        }

        try {
            const response = await apiClient.post('/unpublisharticle', { article_id: articleId });

            if (response.code === 200) {
                showToast('文章已取消发布', 'info');
                fetchArticles(currentPage, pageSize, searchKeyword);
            } else {
                showToast(response.message || '取消发布失败', 'error');
            }
        } catch (error) {
            console.error('取消发布文章时出错:', error);
            showToast('取消发布文章时出错', 'error');
        }
    };

    const handlePublishArticle = async (articleId) => {
        if (!window.confirm('确定要发布这篇文章吗？')) {
            return;
        }

        try {
            const response = await apiClient.post('/publisharticle', { article_id: articleId });

            if (response.code === 200) {
                showToast('文章已发布', 'info');
                fetchArticles(currentPage, pageSize, searchKeyword);
            } else {
                showToast(response.message || '发布失败', 'error');
            }
        } catch (error) {
            console.error('发布文章时出错:', error);
            showToast('发布文章时出错', 'error');
        }
    };

    const handleRemovePassword = async (articleId) => {
        if (!window.confirm('确定要移除这篇文章的密码吗？')) {
            return;
        }

        try {
            const response = await apiClient.post('/removearticlepassword', { article_id: articleId });

            if (response.code === 200) {
                showToast('文章密码已移除', 'info');
                fetchArticles(currentPage, pageSize, searchKeyword);
            } else {
                showToast(response.message || '移除密码失败', 'error');
            }
        } catch (error) {
            console.error('移除文章密码时出错:', error);
            showToast('移除文章密码时出错', 'error');
        }
    };

    const handleExportArticle = async (articleId) => {
        try {
            const response = await apiClient.get(`/getarticle/${articleId}`);

            if (response.code === 200 && response.data) {
                const article = response.data;
                
                const markdownContent = article.article_content || '';
                
                const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${article.article_name || 'article'}.md`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                showToast('文章导出成功');
            } else {
                showToast(response.message || '导出失败', 'error');
            }
        } catch (error) {
            console.error('导出文章时出错:', error);
            showToast('导出文章时出错', 'error');
        }
    };

    const handleSearchClear = () => {
        setSearchKeyword('');
        setCurrentPage(1);
        fetchArticles(1, pageSize, '');
    };

    const columns = [
        { key: 'article_name', label: '标题', className: 'font-medium text-gray-900', render: (val) => unescapeHtml(val) || '无标题' },
        { key: 'author_name', label: '作者', className: 'text-gray-500', render: (val) => unescapeHtml(val) || '未知作者' },
        { key: 'category', label: '分类', className: 'text-gray-500', render: (val) => val ? (val.includes('/') ? val.split('/').pop() : val) : '-' },
        { key: 'tag', label: '标签', className: 'text-gray-500', render: (val) => val || '-' },
        { key: 'create_time', label: '日期', className: 'text-gray-500', render: (val) => formatDate(val) },
        {
            key: 'status', label: '状态', className: '',
            render: (status) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(status)}`}>
                    {getStatusLabel(status)}
                </span>
            )
        },
        {
            key: 'actions', label: '操作', className: '',
            render: (_, article) => (
                <div className="flex items-center space-x-2">
                    <button onClick={() => onEditArticle(article.article_id)} className="text-blue-600 hover:text-blue-900 flex items-center">
                        <Edit className="h-4 w-4 mr-1" />编辑
                    </button>
                    <button onClick={() => handleExportArticle(article.article_id)} className="text-green-600 hover:text-green-900 flex items-center">
                        <Download className="h-4 w-4 mr-1" />导出
                    </button>
                    {article.status === 1 && (
                        <button onClick={() => handleUnpublishArticle(article.article_id)} className="text-yellow-600 hover:text-yellow-900 flex items-center">
                            <EyeOff className="h-4 w-4 mr-1" />取消发布
                        </button>
                    )}
                    {article.status === 2 && (
                        <button onClick={() => handlePublishArticle(article.article_id)} className="text-green-600 hover:text-green-900 flex items-center">
                            <Send className="h-4 w-4 mr-1" />发布
                        </button>
                    )}
                    {article.hasPassword && (
                        <button onClick={() => handleRemovePassword(article.article_id)} className="text-purple-600 hover:text-purple-900 flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            关闭密码
                        </button>
                    )}
                    <button onClick={() => handleDeleteArticle(article.article_id)} className="text-red-600 hover:text-red-900 flex items-center">
                        <Trash2 className="h-4 w-4 mr-1" />删除
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <input ref={importFileInputRef} type="file" accept=".md,.markdown" onChange={handleImportFile} className="hidden" />
            <DataTable
                title="文章管理"
                loading={loading}
                columns={columns}
                data={localArticles}
                keyExtractor={(item) => item.article_id}
                emptyText="暂无文章数据"
                searchValue={searchKeyword}
                onSearchChange={handleSearchChange}
                onSearchClear={handleSearchClear}
                searchPlaceholder="搜索文章标题或摘要..."
                headerActions={
                    <>
                        <button onClick={handleImportClick} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            <Upload className="h-4 w-4 mr-1" />导入文章
                        </button>
                        <button onClick={onNewArticle} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            <Plus className="h-4 w-4 mr-1" />新建文章
                        </button>
                    </>
                }
                pagination={totalPages > 1 ? {
                    currentPage,
                    totalPages,
                    totalItems: totalArticles,
                    pageSize,
                    onPageChange: setCurrentPage
                } : null}
            />
        </>
    );
}
