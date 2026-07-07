import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';
import {showToast} from "../../utils/toastManager.jsx";
import DataTable from './DataTable';

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
            if (response.code === 200) {
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
                if (response.code === 200) {
                    fetchTags();
                    showToast('标签禁用成功');
                } else {
                    showToast('标签禁用失败: ' + response.message);
                }
            } catch (error) {
                console.error('禁用标签失败:', error);
                showToast('禁用标签失败');
            }
        }
    };

    const handleActivateTag = async (id) => {
        try {
            const response = await apiClient.put(`/tags-categories/tags/${id}/activate`);
            if (response.code === 200) {
                fetchTags();
                showToast('标签激活成功');
            } else {
                showToast('标签激活失败: ' + response.message);
            }
        } catch (error) {
            console.error('激活标签失败:', error);
            showToast('激活标签失败');
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

            if (response.code === 200) {
                fetchTags();
                setShowModal(false);
                showToast(editingTag ? '标签更新成功' : '标签创建成功');
            } else {
                showToast(editingTag ? '标签更新失败: ' + response.message : '标签创建失败: ' + response.message);
            }
        } catch (error) {
            console.error('保存标签失败:', error);
            showToast('保存标签失败');
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

    const columns = [
        { key: 'id', label: 'ID', className: 'text-gray-500' },
        { key: 'tag_name', label: '标签名称', className: 'font-medium text-gray-900' },
        { key: 'tag_explain', label: '说明', className: 'text-gray-500' },
        { key: 'founder', label: '创建者', className: 'text-gray-500' },
        {
            key: 'status',
            label: '状态',
            className: 'text-gray-500',
            render: (status) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(status)}`}>
                    {getStatusText(status)}
                </span>
            )
        },
        {
            key: 'actions',
            label: '操作',
            className: 'font-medium',
            render: (_, tag) => (
                tag.status === 1 ? (
                    <>
                        <button onClick={() => handleEditTag(tag)} className="text-blue-600 hover:text-blue-900 mr-3">编辑</button>
                        <button onClick={() => handleDeleteTag(tag.id)} className="text-red-600 hover:text-red-900">禁用</button>
                    </>
                ) : (
                    <button onClick={() => handleActivateTag(tag.id)} className="text-green-600 hover:text-green-900">激活</button>
                )
            )
        }
    ];

    return (
        <>
            <DataTable
                title="标签管理"
                loading={loading}
                columns={columns}
                data={tags}
                keyExtractor={(tag) => tag.id}
                emptyText="暂无标签数据"
                headerActions={
                    <button onClick={handleCreateTag} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        新建标签
                    </button>
                }
            />

            {showModal && (
                <>
                <div className="fixed inset-0 backdrop-blur-sm bg-transparent z-40" onClick={() => setShowModal(false)}></div>
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
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
                </>
            )}
        </>
    );
}
