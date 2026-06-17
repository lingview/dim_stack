import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import { showToast } from '../../utils/toastManager.jsx';

const formatTime = (value) => {
    if (!value) return '-';
    try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return value;
    }
};

export default function ApiKeyManager() {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [description, setDescription] = useState('');

    const [newKey, setNewKey] = useState(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/apikey/list');
            if (response.code === 200) {
                setKeys(response.data || []);
            } else {
                showToast(response.message || '获取 API Key 列表失败');
            }
        } catch (error) {
            console.error('获取 API Key 列表失败:', error);
            showToast('获取 API Key 列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            setCreating(true);
            const response = await apiClient.post('/apikey/create', {
                description: description.trim()
            });
            if (response.code === 200 && response.data) {
                setNewKey(response.data.apiKey);
                setDescription('');
                showToast('API Key 创建成功');
                fetchKeys();
            } else {
                showToast(response.message || '创建 API Key 失败');
            }
        } catch (error) {
            console.error('创建 API Key 失败:', error);
            showToast('创建 API Key 失败');
        } finally {
            setCreating(false);
        }
    };

    const handleToggleStatus = async (key) => {
        const nextStatus = key.status === 1 ? 0 : 1;
        try {
            const response = await apiClient.put(`/apikey/${key.id}/status`, null, {
                params: { status: nextStatus }
            });
            if (response.code === 200) {
                showToast(response.message || '操作成功');
                fetchKeys();
            } else {
                showToast(response.message || '操作失败');
            }
        } catch (error) {
            console.error('更新 API Key 状态失败:', error);
            showToast('更新 API Key 状态失败');
        }
    };

    const handleDelete = async (key) => {
        if (!window.confirm('确定要删除该 API Key 吗？删除后将无法恢复。')) {
            return;
        }
        try {
            const response = await apiClient.delete(`/apikey/${key.id}`);
            if (response.code === 200) {
                showToast(response.message || '删除成功');
                fetchKeys();
            } else {
                showToast(response.message || '删除失败');
            }
        } catch (error) {
            console.error('删除 API Key 失败:', error);
            showToast('删除 API Key 失败');
        }
    };

    const handleCopy = async (text) => {
        const clipboard = navigator.clipboard || {
            writeText: (value) => {
                const copyInput = document.createElement('input');
                copyInput.value = value;
                copyInput.style.position = 'fixed';
                copyInput.style.left = '-999999px';
                copyInput.style.top = '-999999px';
                document.body.appendChild(copyInput);
                copyInput.select();
                document.execCommand('copy');
                document.body.removeChild(copyInput);
            }
        };

        try {
            await clipboard.writeText(text);
            showToast('已复制到剪贴板');
        } catch {
            showToast('复制失败，请手动复制');
        }
    };

    return (
        <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">API Key 管理</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        API Key 用于以CLI等方式访问接口。Key 仅在创建时显示一次，请妥善保存<strong>（该Key拥有您账户的完整权限）</strong>。
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={255}
                    placeholder="备注描述（可选，例如：本地脚本）"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={handleCreate}
                    disabled={creating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 whitespace-nowrap"
                >
                    {creating ? '创建中...' : '创建 API Key'}
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">加载中...</span>
                </div>
            ) : keys.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">暂无 API Key</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr className="text-left text-gray-500">
                                <th className="px-4 py-2 font-medium">备注</th>
                                <th className="px-4 py-2 font-medium">状态</th>
                                <th className="px-4 py-2 font-medium">创建时间</th>
                                <th className="px-4 py-2 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {keys.map((key) => (
                                <tr key={key.id}>
                                    <td className="px-4 py-3 text-gray-900">{key.description || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            key.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {key.status === 1 ? '启用' : '禁用'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{formatTime(key.createTime)}</td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(key)}
                                            className="text-blue-600 hover:text-blue-800 mr-4"
                                        >
                                            {key.status === 1 ? '禁用' : '启用'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(key)}
                                            className="text-red-600 hover:text-red-800"
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

            {newKey && (
                <>
                <div className="fixed inset-0 backdrop-blur-sm bg-transparent z-40" onClick={() => setNewKey(null)}></div>
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setNewKey(null)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            aria-label="关闭"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>

                        <h4 className="text-lg font-semibold text-gray-900 mb-2 pr-6">请保存你的 API Key</h4>
                        <p className="text-sm text-gray-500 mb-4">
                            出于安全考虑，该 Key 仅显示这一次，关闭后将无法再次查看。请立即复制并妥善保存。
                        </p>
                        <div className="flex items-stretch gap-2 mb-2">
                            <code className="apikey-key-code flex-1 px-3 py-2 rounded-md text-sm break-all select-all">
                                {newKey}
                            </code>
                            <button
                                type="button"
                                onClick={() => handleCopy(newKey)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                            >
                                复制
                            </button>
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}
