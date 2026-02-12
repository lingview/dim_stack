import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [topLevelCategories, setTopLevelCategories] = useState([]);
    const [formData, setFormData] = useState({
        category_name: '',
        category_explain: '',
        parent_id: null
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchCategories();
        fetchTopLevelCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/tags-categories/categories');
            if (response.success) {
                const treeData = buildTreeStructure(response.data || []);
                setCategories(treeData);
            }
        } catch (error) {
            console.error('获取分类列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopLevelCategories = async () => {
        try {
            const response = await apiClient.get('/tags-categories/categories/top-level');
            if (response.success) {
                setTopLevelCategories(response.data || []);
            }
        } catch (error) {
            console.error('获取顶级分类失败:', error);
        }
    };

    const handleCreateCategory = () => {
        setEditingCategory(null);
        setFormData({
            category_name: '',
            category_explain: '',
            parent_id: null
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleCreateSubCategory = (parentCategory) => {
        if (parentCategory.parent_id !== null) {
            alert('只能创建一级子分类，不能创建三级分类');
            return;
        }

        setEditingCategory(null);
        setFormData({
            category_name: '',
            category_explain: '',
            parent_id: parentCategory.id
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setFormData({
            category_name: category.category_name,
            category_explain: category.category_explain,
            parent_id: category.parent_id
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('确定要禁用这个分类吗？\n\n注意：此操作将级联禁用该分类及其所有子分类，确保分类体系的完整性。')) {
            try {
                const response = await apiClient.delete(`/tags-categories/categories/${id}`);
                if (response.success) {
                    fetchCategories();
                    alert('分类禁用成功\n\n已同步禁用所有相关子分类');
                } else {
                    alert('分类禁用失败: ' + response.message);
                }
            } catch (error) {
                console.error('禁用分类失败:', error);
                alert('禁用分类失败');
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
                fetchTopLevelCategories();
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
            [name]: name === 'parent_id' ? (value ? parseInt(value) : null) : value
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


    const buildTreeStructure = (flatList) => {
        const nodeMap = {};
        const roots = [];

        flatList.forEach(node => {
            nodeMap[node.id] = { ...node, children: [] };
        });

        flatList.forEach(node => {
            if (node.parent_id === null) {
                roots.push(nodeMap[node.id]);
            } else {
                const parent = nodeMap[node.parent_id];
                if (parent) {
                    parent.children.push(nodeMap[node.id]);
                }
            }
        });

        return roots;
    };

    const getStatusClass = (status) => {
        return status === 1
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const renderCategoryTree = (categories, level = 0) => {
        return categories.map((category) => (
            <div key={category.id}>
                <div className={`flex items-center justify-between py-3 px-4 bg-white border-b border-gray-200 hover:bg-gray-50 ${level > 0 ? 'ml-8' : ''}`}>
                    <div className="flex items-center space-x-3">
                        {level > 0 && (
                            <div className="flex items-center -ml-8 mr-2">
                                <div className="w-6 h-6 border-l-2 border-b-2 border-gray-300 rounded-bl"></div>
                                <div className="w-2 h-px bg-gray-300"></div>
                            </div>
                        )}

                        <div>
                            <div className="font-medium text-gray-900">{category.category_name}</div>
                            <div className="text-sm text-gray-500">{category.category_explain}</div>
                            {category.parent_name && (
                                <div className="text-xs text-gray-400">父分类: {category.parent_name}</div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(category.status)}`}>
                        {getStatusText(category.status)}
                    </span>
                        <span className="text-sm text-gray-500">
                        文章数: {category.article_count || 0}
                    </span>
                        <span className="text-sm text-gray-500">
                        子分类: {category.child_count || 0}
                    </span>
                        <div className="flex space-x-2">
                            {category.status === 1 ? (
                                <>
                                    {category.parent_id === null && (
                                        <button
                                            onClick={() => handleCreateSubCategory(category)}
                                            className="text-blue-600 hover:text-blue-900 text-sm"
                                            title="创建子分类"
                                        >
                                            + 子分类
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEditCategory(category)}
                                        className="text-blue-600 hover:text-blue-900 text-sm"
                                    >
                                        编辑
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="text-red-600 hover:text-red-900 text-sm"
                                    >
                                        禁用
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleActivateCategory(category.id)}
                                    className="text-green-600 hover:text-green-900 text-sm"
                                >
                                    激活
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {category.children && category.children.length > 0 && (
                    <div>
                        {renderCategoryTree(category.children, level + 1)}
                    </div>
                )}
            </div>
        ));
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">分类管理</h2>
                <button
                    onClick={handleCreateCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    新建顶级分类
                </button>
            </div>

            <div className="divide-y divide-gray-200">
                {categories.length > 0 ? (
                    renderCategoryTree(categories)
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">暂无分类数据</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingCategory ? '编辑分类' :
                                    formData.parent_id ? '创建子分类' : '新建顶级分类'}
                            </h3>
                            {formData.parent_id && (
                                <p className="text-sm text-gray-500 mt-1">
                                    父分类: {topLevelCategories.find(c => c.id === formData.parent_id)?.category_name}
                                </p>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-4 space-y-4">
                                {!editingCategory && (
                                    <div>
                                        <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700">
                                            父分类 (可选)
                                        </label>
                                        <select
                                            id="parent_id"
                                            name="parent_id"
                                            value={formData.parent_id || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        >
                                            <option value="">选择父分类 (留空则为顶级分类)</option>
                                            {topLevelCategories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.category_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

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
                                        placeholder="请输入分类名称"
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
                                        placeholder="请输入分类说明"
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