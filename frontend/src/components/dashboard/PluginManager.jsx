import React, { useState, useEffect, useRef } from 'react';
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

const stateBadge = (plugin) => {
    const state = plugin.state || 'UNLOADED';
    if (state === 'STARTED') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">启用</span>;
    }
    if (state === 'FAILED') {
        return (
            <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 cursor-help"
                title={plugin.last_error || '插件启动失败'}
            >
                失败
            </span>
        );
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">停用</span>;
};

export default function PluginManager() {
    const [plugins, setPlugins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [operating, setOperating] = useState('');

    const installInputRef = useRef(null);
    const upgradeInputRefs = useRef({});

    useEffect(() => {
        fetchPlugins();
    }, []);

    const fetchPlugins = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/plugins');
            if (response.code === 200) {
                setPlugins(response.data || []);
            } else {
                showToast(response.message || '获取插件列表失败');
            }
        } catch (error) {
            console.error('获取插件列表失败:', error);
            showToast('获取插件列表失败');
        } finally {
            setLoading(false);
        }
    };

    const doAction = async (action, name, successText) => {
        if (operating) return;
        setOperating(name);
        try {
            const response = await apiClient.post(`/plugins/${name}/${action}`);
            if (response.code === 200) {
                showToast(response.message || successText);
                fetchPlugins();
            } else {
                showToast(response.message || '操作失败');
            }
        } catch (error) {
            console.error(`插件${action}失败:`, error);
            showToast(`插件${action}失败`);
        } finally {
            setOperating('');
        }
    };

    const handleInstall = (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file) return;
        uploadPlugin(file, '/plugins/install', '插件安装成功');
    };

    const handleUpgrade = (plugin, event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file) return;
        uploadPlugin(file, `/plugins/${plugin.name}/upgrade`, '插件升级成功');
    };

    const uploadPlugin = async (file, url, successText) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await apiClient.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.code === 200) {
                showToast(response.message || successText);
                fetchPlugins();
            } else {
                showToast(response.message || '操作失败');
            }
        } catch (error) {
            console.error('插件上传失败:', error);
            showToast('插件上传失败');
        }
    };

    const handleUninstall = async (plugin) => {
        if (!window.confirm(`确定要卸载插件「${plugin.display_name}」吗？插件文件与相关配置将被删除，此操作不可恢复。`)) {
            return;
        }
        if (operating) return;
        setOperating(plugin.name);
        try {
            const response = await apiClient.delete(`/plugins/${plugin.name}`);
            if (response.code === 200) {
                showToast(response.message || '插件已卸载');
                fetchPlugins();
            } else {
                showToast(response.message || '卸载失败');
            }
        } catch (error) {
            console.error('卸载插件失败:', error);
            showToast('卸载插件失败');
        } finally {
            setOperating('');
        }
    };

    return (
        <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">插件管理</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        管理已安装的插件：启用 / 停用 / 升级 / 卸载。插件为 jar 文件，仅支持系统管理员操作。
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => installInputRef.current && installInputRef.current.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                >
                    安装插件
                </button>
                <input
                    ref={installInputRef}
                    type="file"
                    accept=".jar"
                    className="hidden"
                    onChange={handleInstall}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">加载中...</span>
                </div>
            ) : plugins.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">暂无插件，点击右上角「安装插件」上传 jar 文件</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr className="text-left text-gray-500">
                                <th className="px-4 py-2 font-medium">名称</th>
                                <th className="px-4 py-2 font-medium">版本</th>
                                <th className="px-4 py-2 font-medium">作者</th>
                                <th className="px-4 py-2 font-medium">状态</th>
                                <th className="px-4 py-2 font-medium">安装时间</th>
                                <th className="px-4 py-2 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {plugins.map((plugin) => (
                                <tr key={plugin.name}>
                                    <td className="px-4 py-3">
                                        <div className="text-gray-900">{plugin.display_name}</div>
                                        <div className="text-xs text-gray-400">{plugin.name}</div>
                                        {plugin.last_error && (
                                            <div className="text-xs text-red-500 mt-0.5" title={plugin.last_error}>
                                                失败原因: {plugin.last_error}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{plugin.version}</td>
                                    <td className="px-4 py-3 text-gray-600">{plugin.author || '-'}</td>
                                    <td className="px-4 py-3">{stateBadge(plugin)}</td>
                                    <td className="px-4 py-3 text-gray-500">{formatTime(plugin.create_time)}</td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        {plugin.state === 'STARTED' ? (
                                            <button
                                                type="button"
                                                onClick={() => doAction('stop', plugin.name, '插件已停用')}
                                                disabled={!!operating}
                                                className="text-blue-600 hover:text-blue-800 mr-4 disabled:opacity-50"
                                            >
                                                停用
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => doAction('start', plugin.name, '插件已启用')}
                                                disabled={!!operating || plugin.state === 'FAILED'}
                                                className="text-blue-600 hover:text-blue-800 mr-4 disabled:opacity-50"
                                            >
                                                启用
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => upgradeInputRefs.current[plugin.name] && upgradeInputRefs.current[plugin.name].click()}
                                            disabled={!!operating}
                                            className="text-blue-600 hover:text-blue-800 mr-4 disabled:opacity-50"
                                        >
                                            升级
                                        </button>
                                        <input
                                            ref={(el) => (upgradeInputRefs.current[plugin.name] = el)}
                                            type="file"
                                            accept=".jar"
                                            className="hidden"
                                            onChange={(e) => handleUpgrade(plugin, e)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleUninstall(plugin)}
                                            disabled={!!operating}
                                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                        >
                                            卸载
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
