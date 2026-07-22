import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../utils/axios';
import { showToast } from '../../utils/toastManager';

const STORAGE_TYPE_OPTIONS = [
    { value: 's3', label: '对象存储' },
    { value: 'webdav', label: 'WebDAV' },
];

const EMPTY_S3_CONFIG = {
    endpoint: '',
    region: '',
    bucket: '',
    accessKey: '',
    secretKey: '',
    pathStyleAccess: false,
};

const EMPTY_WEBDAV_CONFIG = {
    url: '',
    username: '',
    password: '',
};

const emptyConfigFor = (type) => (type === 'webdav' ? { ...EMPTY_WEBDAV_CONFIG } : { ...EMPTY_S3_CONFIG });

export default function StorageConfigSection() {
    const [storageMethods, setStorageMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [defaultStorage, setDefaultStorage] = useState(null);
    const [modal, setModal] = useState({ show: false, editing: null });
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        type: 's3',
        config: emptyConfigFor('s3'),
    });

    const fetchStorageMethods = useCallback(async () => {
        try {
            const response = await apiClient.get('/storage/list');
            if (response.code === 200) {
                setStorageMethods(response.data);
            } else {
                showToast(response.message || '获取存储方式失败', 'error');
            }
        } catch (error) {
            console.error('获取存储方式失败:', error);
            showToast('获取存储方式时发生错误', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDefaultStorage = useCallback(async () => {
        try {
            const response = await apiClient.get('/site/getsiteconfig');
            if (response.code === 200) {
                setDefaultStorage(response.data.default_storage);
            }
        } catch (error) {
            console.error('获取默认存储方式失败:', error);
        }
    }, []);

    useEffect(() => {
        fetchStorageMethods();
        fetchDefaultStorage();
    }, [fetchStorageMethods, fetchDefaultStorage]);

    const handleOpenAdd = () => {
        setForm({ name: '', type: 's3', config: emptyConfigFor('s3') });
        setModal({ show: true, editing: null });
    };

    const handleOpenEdit = (method) => {
        let config = emptyConfigFor(method.type);
        if (method.config) {
            try {
                const parsed = JSON.parse(method.config);
                config = { ...config, ...parsed };
            } catch (e) {
                console.error('解析配置失败:', e);
            }
        }
        ['accessKey', 'secretKey', 'password'].forEach(k => {
            if (k in config) config[k] = '';
        });
        setForm({ name: method.name, type: method.type, config });
        setModal({ show: true, editing: method.uuid });
    };

    const handleCloseModal = () => {
        setModal({ show: false, editing: null });
    };

    const handleConfigChange = (key, value) => {
        setForm(prev => ({
            ...prev,
            config: { ...prev.config, [key]: value },
        }));
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            showToast('请输入存储方式名称', 'error');
            return;
        }
        if (form.type === 'webdav') {
            if (!form.config.url || !form.config.username) {
                showToast('请填写WebDAV地址和用户名', 'error');
                return;
            }
            if (!modal.editing && !form.config.password) {
                showToast('请填写WebDAV密码', 'error');
                return;
            }
        } else if (!form.config.endpoint || !form.config.region || !form.config.bucket) {
            showToast('请填写完整的S3配置信息', 'error');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                name: form.name,
                type: form.type,
                config: JSON.stringify(form.config),
            };

            let response;
            if (modal.editing) {
                payload.uuid = modal.editing;
                response = await apiClient.post('/storage/edit', payload);
            } else {
                response = await apiClient.post('/storage/add', payload);
            }

            if (response.code === 200) {
                showToast(response.data?.message || (modal.editing ? '编辑成功' : '新增成功'));
                handleCloseModal();
                fetchStorageMethods();
            } else {
                showToast(response.message || '保存失败', 'error');
            }
        } catch (error) {
            console.error('保存存储方式失败:', error);
            showToast('保存存储方式时发生错误', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (uuid) => {
        if (!window.confirm('确定要永久删除此存储方式吗？删除后无法恢复。')) return;

        try {
            const response = await apiClient.post('/storage/delete', { uuid });
            if (response.code === 200) {
                showToast('已删除');
                fetchStorageMethods();
            } else {
                showToast(response.message || '删除失败', 'error');
            }
        } catch (error) {
            console.error('删除存储方式失败:', error);
            showToast('删除存储方式时发生错误', 'error');
        }
    };

    const handleDisable = async (uuid) => {
        if (!window.confirm('禁用后，该存储方式下的文件将无法访问。确定要禁用吗？')) return;

        try {
            const response = await apiClient.post('/storage/disable', { uuid });
            if (response.code === 200) {
                showToast('已禁用');
                fetchStorageMethods();
            } else {
                showToast(response.message || '禁用失败', 'error');
            }
        } catch (error) {
            console.error('禁用存储方式失败:', error);
            showToast('禁用存储方式时发生错误', 'error');
        }
    };

    const handleEnable = async (uuid) => {
        try {
            const response = await apiClient.post('/storage/enable', { uuid });
            if (response.code === 200) {
                showToast('已启用');
                fetchStorageMethods();
            } else {
                showToast(response.message || '启用失败', 'error');
            }
        } catch (error) {
            console.error('启用存储方式失败:', error);
            showToast('启用存储方式时发生错误', 'error');
        }
    };

    const handleSetDefault = async (uuid) => {
        try {
            const response = await apiClient.post('/storage/set-default', { uuid });
            if (response.code === 200) {
                showToast('默认存储方式已更新');
                setDefaultStorage(uuid);
                fetchStorageMethods();
            } else {
                showToast(response.message || '设置失败', 'error');
            }
        } catch (error) {
            console.error('设置默认存储方式失败:', error);
            showToast('设置默认存储方式时发生错误', 'error');
        }
    };

    const getTypeLabel = (type) => {
        if (type === 'local') return '本地存储';
        if (type === 'webdav') return 'WebDAV';
        return '对象存储';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-gray-700">存储方式管理</h4>
                    <p className="text-xs text-gray-400 mt-1">管理文件存储后端</p>
                    <p className="text-xs text-orange-500 mt-1">禁用或删除后，该存储方式存储的文件将无法访问</p>
                </div>
                <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    新增存储方式
                </button>
            </div>

            <div className="text-sm text-gray-500">
                当前默认存储方式：<span className="font-medium text-gray-700">{storageMethods.find(m => m.uuid === defaultStorage)?.name || '本地存储'}</span>
                <span className="ml-2 text-xs text-gray-400">新上传的文件将使用此存储方式保存，已有文件不受影响</span>
            </div>

            <div className="space-y-3">
                {storageMethods.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        暂无存储方式配置
                    </div>
                )}
                {storageMethods.map((method) => (
                    <div
                        key={method.uuid}
                        className={`border rounded-lg p-4 ${method.status === 0 ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    {method.type === 'local' ? (
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                        </div>
                                    ) : method.type === 'webdav' ? (
                                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">{method.name}</span>
                                        {method.uuid === defaultStorage && method.status === 1 && (
                                            <span className="px-1.5 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded">默认</span>
                                        )}
                                        {method.status === 0 && (
                                            <span className="px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-gray-200 rounded">已禁用</span>
                                        )}
                                        <span className="px-1.5 py-0.5 text-xs text-gray-500 bg-gray-100 rounded">{getTypeLabel(method.type)}</span>
                                    </div>
                                    {method.type !== 'local' && method.config && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {(() => {
                                                try {
                                                    const c = JSON.parse(method.config);
                                                    if (method.type === 'webdav') {
                                                        return c.url;
                                                    }
                                                    return `${c.endpoint} / ${c.bucket}`;
                                                } catch (e) {
                                                    return '';
                                                }
                                            })()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {method.status === 1 && method.uuid !== defaultStorage && (
                                    <button
                                        type="button"
                                        onClick={() => handleSetDefault(method.uuid)}
                                        className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                                    >
                                        设为默认
                                    </button>
                                )}
                                {method.type !== 'local' && method.status === 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEdit(method)}
                                        className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100"
                                    >
                                        编辑
                                    </button>
                                )}
                                {method.type !== 'local' && method.status === 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleDisable(method.uuid)}
                                        disabled={method.uuid === defaultStorage}
                                        className={`px-2 py-1 text-xs font-medium border rounded ${
                                            method.uuid === defaultStorage
                                                ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                                                : 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100'
                                        }`}
                                    >
                                        {method.uuid === defaultStorage ? '默认存储，不可禁用' : '禁用'}
                                    </button>
                                )}
                                {method.type !== 'local' && method.status === 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleEnable(method.uuid)}
                                        className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100"
                                    >
                                        启用
                                    </button>
                                )}
                                {method.type !== 'local' && method.status === 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(method.uuid)}
                                        className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100"
                                    >
                                        删除
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {modal.show && (
                <>
                <div className="fixed inset-0 backdrop-blur-sm bg-transparent z-40" onClick={handleCloseModal}></div>
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {modal.editing ? '编辑存储方式' : '新增存储方式'}
                            </h3>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="如：阿里云OSS-北京"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => {
                                        const newType = e.target.value;
                                        setForm(prev => ({ ...prev, type: newType, config: emptyConfigFor(newType) }));
                                    }}
                                    disabled={modal.editing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    {STORAGE_TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {form.type !== 'webdav' ? (
                            <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">端点</label>
                                <input
                                    type="text"
                                    value={form.config.endpoint}
                                    onChange={(e) => handleConfigChange('endpoint', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                    placeholder="https://oss-cn-beijing.aliyuncs.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">区域</label>
                                <input
                                    type="text"
                                    value={form.config.region}
                                    onChange={(e) => handleConfigChange('region', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                    placeholder="华北2（北京）"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">存储桶</label>
                                <input
                                    type="text"
                                    value={form.config.bucket}
                                    onChange={(e) => handleConfigChange('bucket', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                    placeholder="dimstack-uploads"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">访问密钥 ID</label>
                                <input
                                    type="text"
                                    value={form.config.accessKey}
                                    onChange={(e) => handleConfigChange('accessKey', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                    placeholder={modal.editing ? '留空则不修改' : ''}
                                />
                                {modal.editing && (
                                    <p className="text-xs text-gray-400 mt-1">留空则保留原有值</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">访问密钥</label>
                                <input
                                    type="password"
                                    value={form.config.secretKey}
                                    onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                    placeholder={modal.editing ? '留空则不修改' : ''}
                                />
                                {modal.editing && (
                                    <p className="text-xs text-gray-400 mt-1">留空则保留原有值</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="pathStyleAccess"
                                    checked={form.config.pathStyleAccess}
                                    onChange={(e) => handleConfigChange('pathStyleAccess', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="pathStyleAccess" className="text-sm text-gray-700">Path Style Access（MinIO 需要开启）</label>
                            </div>
                            </>
                            ) : (
                            <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WebDAV 地址</label>
                                <input
                                    type="text"
                                    value={form.config.url}
                                    onChange={(e) => handleConfigChange('url', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                    placeholder="https://cloud.example.com/remote.php/dav/files/user"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                                <input
                                    type="text"
                                    value={form.config.username}
                                    onChange={(e) => handleConfigChange('username', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                    placeholder={modal.editing ? '留空则不修改' : ''}
                                />
                                {modal.editing && (
                                    <p className="text-xs text-gray-400 mt-1">留空则保留原有值</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                                <input
                                    type="password"
                                    value={form.config.password}
                                    onChange={(e) => handleConfigChange('password', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                    placeholder={modal.editing ? '留空则不修改' : ''}
                                />
                                {modal.editing && (
                                    <p className="text-xs text-gray-400 mt-1">留空则保留原有值</p>
                                )}
                            </div>
                            </>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>保存中...</span>
                                    </>
                                ) : (
                                    <span>保存</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}