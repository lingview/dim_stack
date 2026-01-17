import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axios.jsx';

export default function CustomPageManager() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        pageName: '',
        pageCode: '',
        alias: '',
        status: 1
    });
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/custom-pages/user');
            if (response.code === 200) {
                setPages(response.data || []);
            } else {
                console.error('获取页面列表失败:', response.message);
            }
        } catch (error) {
            console.error('获取页面列表错误:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingPage) {
                response = await apiClient.put(`/custom-pages/${editingPage.id}`, formData);
            } else {
                response = await apiClient.post('/custom-pages', formData);
            }

            if (response.code === 200) {
                setMessage({ type: 'success', content: editingPage ? '页面更新成功' : '页面创建成功' });
                setFormData({ pageName: '', pageCode: '', alias: '', status: 1 });
                setEditingPage(null);
                setShowForm(false);
                loadPages();
            } else {
                setMessage({ type: 'error', content: response.message || '操作失败' });
            }
        } catch (error) {
            console.error('保存页面错误:', error);
            setMessage({ type: 'error', content: '保存页面失败，请重试' });
        }
    };

    const handleCreateNew = () => {
        setEditingPage(null);
        setFormData({ pageName: '', pageCode: '', alias: '', status: 1 });
        setShowForm(true);
    };

    const handleEdit = (page) => {
        setEditingPage(page);
        setFormData({
            pageName: page.pageName,
            pageCode: page.pageCode,
            alias: page.alias,
            status: page.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('确定要删除这个页面吗？此操作不可恢复。')) {
            try {
                const response = await apiClient.delete(`/custom-pages/${id}`);
                if (response.code === 200) {
                    setMessage({ type: 'success', content: '页面删除成功' });
                    loadPages();
                } else {
                    setMessage({ type: 'error', content: response.message || '删除失败' });
                }
            } catch (error) {
                console.error('删除页面错误:', error);
                setMessage({ type: 'error', content: '删除页面失败，请重试' });
            }
        }
    };

    const handlePreview = (alias) => {
        window.open(`/custom-page/${alias}`, '_blank');
    };


    const cancelEdit = () => {
        setEditingPage(null);
        setFormData({ pageName: '', pageCode: '', alias: '', status: 1 });
        setShowForm(false);
        setMessage('');
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">自定义页面管理</h2>
                <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    新建页面
                </button>
            </div>

            {message.content && (
                <div className={`mb-4 p-3 rounded-lg ${
                    message.type === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                }`}>
                    {message.content}
                </div>
            )}

            {showForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">
                        {editingPage ? `编辑页面: ${editingPage.pageName}` : '新建自定义页面'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                页面名称 *
                            </label>
                            <input
                                type="text"
                                name="pageName"
                                value={formData.pageName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                访问地址 *
                            </label>
                            <input
                                type="text"
                                name="alias"
                                value={formData.alias}
                                onChange={handleInputChange}
                                required
                                placeholder="如: about, contact, custom-page"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                页面代码
                            </label>
                            <textarea
                                name="pageCode"
                                value={formData.pageCode}
                                onChange={handleInputChange}
                                rows={10}
                                placeholder="输入HTML/CSS/JavaScript代码..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                状态
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={1}>正常</option>
                                <option value={0}>删除</option>
                            </select>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {editingPage ? '更新页面' : '创建页面'}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                取消
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : pages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>暂无自定义页面</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                页面名称
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                访问地址
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                状态
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
                        {pages.map(page => (
                            <tr key={page.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {page.pageName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <code className="bg-gray-100 px-2 py-1 rounded">{`/custom-page/${page.alias}`}</code>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                page.status === 1
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {page.status === 1 ? '正常' : '已删除'}
                                            </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(page.createTime).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handlePreview(page.alias)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        访问
                                    </button>
                                    <button
                                        onClick={() => handleEdit(page)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        编辑
                                    </button>
                                    <button
                                        onClick={() => handleDelete(page.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        删除
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            <p className="text-red-600">注：使用该功能可能会增大系统被攻击面，如果有处理用户输入的功能点，请务必注意进行清洗。</p>
        </div>
    );
}
