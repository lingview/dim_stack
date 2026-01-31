import { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';

export default function TagsView() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [formData, setFormData] = useState({
        tag_name: '',
        tag_explain: ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/tags-categories/tags');
            if (response.success) {
                setTags(response.data || []);
            }
        } catch (error) {
            console.error('获取标签列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = () => {
        setEditingTag(null);
        setFormData({
            tag_name: '',
            tag_explain: ''
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEditTag = (tag) => {
        setEditingTag(tag);
        setFormData({
            tag_name: tag.tag_name,
            tag_explain: tag.tag_explain
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleDeleteTag = async (id) => {
        if (window.confirm('确定要禁用这个标签吗？')) {
            try {
                const response = await apiClient.delete(`/tags-categories/tags/${id}`);
                if (response.success) {
                    fetchTags();
                    alert('标签禁用成功');
                } else {
                    alert('标签禁用失败: ' + response.message);
                }
            } catch (error) {
                console.error('禁用标签失败:', error);
                alert('禁用标签失败');
            }
        }
    };

    const handleActivateTag = async (id) => {
        try {
            const response = await apiClient.put(`/tags-categories/tags/${id}/activate`);
            if (response.success) {
                fetchTags();
                alert('标签激活成功');
            } else {
                alert('标签激活失败: ' + response.message);
            }
        } catch (error) {
            console.error('激活标签失败:', error);
            alert('激活标签失败');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = {};
        if (!formData.tag_name.trim()) {
            errors.tag_name = '标签名称不能为空';
        }
        if (!formData.tag_explain.trim()) {
            errors.tag_explain = '标签说明不能为空';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            let response;
            if (editingTag) {
                response = await apiClient.put(`/tags-categories/tags/${editingTag.id}`, formData);
            } else {
                response = await apiClient.post('/tags-categories/tags', formData);
            }

            if (response.success) {
                fetchTags();
                setShowModal(false);
                alert(editingTag ? '标签更新成功' : '标签创建成功');
            } else {
                alert(editingTag ? '标签更新失败: ' + response.message : '标签创建失败: ' + response.message);
            }
        } catch (error) {
            console.error('保存标签失败:', error);
            alert('保存标签失败');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const getStatusText = (status) => {
        return status === 1 ? '启用' : '禁用';
    };

    const getStatusClass = (status) => {
        return status === 1
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">标签管理</h2>
                <button
                    onClick={handleCreateTag}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    新建标签
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标签名称</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">说明</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建者</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tags.map((tag) => (
                            <tr key={tag.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tag.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tag.tag_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{tag.tag_explain}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tag.founder}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(tag.status)}`}>
                                        {getStatusText(tag.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {tag.status === 1 ? (
                                        <>
                                            <button
                                                onClick={() => handleEditTag(tag)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTag(tag.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                禁用
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleActivateTag(tag.id)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            激活
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tags.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">暂无标签数据</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingTag ? '编辑标签' : '新建标签'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <label htmlFor="tag_name" className="block text-sm font-medium text-gray-700">
                                        标签名称 - 不允许使用符号
                                    </label>
                                    <input
                                        type="text"
                                        id="tag_name"
                                        name="tag_name"
                                        value={formData.tag_name}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full border ${formErrors.tag_name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    />
                                    {formErrors.tag_name && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.tag_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="tag_explain" className="block text-sm font-medium text-gray-700">
                                        标签说明
                                    </label>
                                    <textarea
                                        id="tag_explain"
                                        name="tag_explain"
                                        rows={3}
                                        value={formData.tag_explain}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full border ${formErrors.tag_explain ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    />
                                    {formErrors.tag_explain && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.tag_explain}</p>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
