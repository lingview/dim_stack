import { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';

export default function CategoriesView() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        category_name: '',
        category_explain: ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/tags-categories/categories');
            if (response.success) {
                setCategories(response.data || []);
            }
        } catch (error) {
            console.error('获取分类列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = () => {
        setEditingCategory(null);
        setFormData({
            category_name: '',
            category_explain: ''
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setFormData({
            category_name: category.category_name,
            category_explain: category.category_explain
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('确定要删除这个分类吗？')) {
            try {
                const response = await apiClient.delete(`/tags-categories/categories/${id}`);
                if (response.success) {
                    fetchCategories();
                    alert('分类删除成功');
                } else {
                    alert('分类删除失败: ' + response.message);
                }
            } catch (error) {
                console.error('删除分类失败:', error);
                alert('删除分类失败');
            }
        }
    };

    const handleActivateCategory = async (id) => {
        try {
            const response = await apiClient.put(`/tags-categories/categories/${id}/activate`);
            if (response.success) {
                fetchCategories();
                alert('分类激活成功');
            } else {
                alert('分类激活失败: ' + response.message);
            }
        } catch (error) {
            console.error('激活分类失败:', error);
            alert('激活分类失败');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = {};
        if (!formData.category_name.trim()) {
            errors.category_name = '分类名称不能为空';
        }
        if (!formData.category_explain.trim()) {
            errors.category_explain = '分类说明不能为空';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            let response;
            if (editingCategory) {
                response = await apiClient.put(`/tags-categories/categories/${editingCategory.id}`, formData);
            } else {
                response = await apiClient.post('/tags-categories/categories', formData);
            }

            if (response.success) {
                fetchCategories();
                setShowModal(false);
                alert(editingCategory ? '分类更新成功' : '分类创建成功');
            } else {
                alert(editingCategory ? '分类更新失败: ' + response.message : '分类创建失败: ' + response.message);
            }
        } catch (error) {
            console.error('保存分类失败:', error);
            alert('保存分类失败');
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
                <h2 className="text-lg font-semibold text-gray-900">分类管理</h2>
                <button
                    onClick={handleCreateCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    新建分类
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类名称</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">说明</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建者</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.category_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{category.category_explain}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.founder}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(category.status)}`}>
                                        {getStatusText(category.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {category.status === 1 ? (
                                        <>
                                            <button
                                                onClick={() => handleEditCategory(category)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                禁用
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleActivateCategory(category.id)}
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

                {categories.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">暂无分类数据</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingCategory ? '编辑分类' : '新建分类'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <label htmlFor="category_name" className="block text-sm font-medium text-gray-700">
                                        分类名称
                                    </label>
                                    <input
                                        type="text"
                                        id="category_name"
                                        name="category_name"
                                        value={formData.category_name}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full border ${formErrors.category_name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    />
                                    {formErrors.category_name && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.category_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="category_explain" className="block text-sm font-medium text-gray-700">
                                        分类说明
                                    </label>
                                    <textarea
                                        id="category_explain"
                                        name="category_explain"
                                        rows={3}
                                        value={formData.category_explain}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full border ${formErrors.category_explain ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    />
                                    {formErrors.category_explain && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.category_explain}</p>
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
