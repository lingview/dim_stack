import { Plus, Edit, Trash2, EyeOff, Send } from 'lucide-react';
import apiClient from "../../utils/axios.jsx";

export default function ArticlesView({ onNewArticle, articles, onEditArticle }) {
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

    // 按日期排序文章（最新的在最上面）
    const sortArticlesByDate = (articles) => {
        if (!articles || !Array.isArray(articles)) return [];

        return [...articles].sort((a, b) => {
            if (!a.create_time && !b.create_time) return 0;
            if (!a.create_time) return 1;
            if (!b.create_time) return -1;

            const dateA = new Date(a.create_time).getTime();
            const dateB = new Date(b.create_time).getTime();

            return dateB - dateA;
        });
    };

    const sortedArticles = sortArticlesByDate(articles);

    const handleDeleteArticle = async (articleId) => {
        if (!window.confirm('确定要删除这篇文章吗？')) {
            return;
        }

        try {
            const response = await apiClient.post('/deletearticle', { article_id: articleId });

            if (response.success) {
                alert('文章删除成功');
                window.location.reload();
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
                window.location.reload();
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
                window.location.reload();
            } else {
                alert(response.message || '发布失败');
            }
        } catch (error) {
            console.error('发布文章时出错:', error);
            alert('发布文章时出错');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">文章管理</h2>
                <button
                    onClick={onNewArticle}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    新建文章
                </button>
            </div>

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
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {sortedArticles && sortedArticles.length > 0 ? (
                        sortedArticles.map((article, index) => {
                            if (!article) return null;

                            return (
                                <tr key={article.article_id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{article.article_name || '无标题'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{article.author_name || '未知作者'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{formatDate(article.create_time)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(article.status)}`}>
                                            {getStatusLabel(article.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => onEditArticle(article.article_id)}
                                            className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            编辑
                                        </button>
                                        {article.status === 1 && (
                                            <button
                                                onClick={() => handleUnpublishArticle(article.article_id)}
                                                className="text-yellow-600 hover:text-yellow-900 mr-3 flex items-center"
                                            >
                                                <EyeOff className="h-4 w-4 mr-1" />
                                                取消发布
                                            </button>
                                        )}
                                        {article.status === 2 && (
                                            <button
                                                onClick={() => handlePublishArticle(article.article_id)}
                                                className="text-green-600 hover:text-green-900 mr-3 flex items-center"
                                            >
                                                <Send className="h-4 w-4 mr-1" />
                                                发布
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteArticle(article.article_id)}
                                            className="text-red-600 hover:text-red-900 flex items-center"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            删除
                                        </button>
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
        </div>
    );
}
