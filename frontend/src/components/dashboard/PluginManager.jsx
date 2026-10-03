import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../utils/axios.jsx';
import { showToast } from '../../utils/toastManager.jsx';
import DataTable from './DataTable';
import Pagination from './Pagination';
import { ExtensionSlot } from '../ExtensionSlot.jsx';
import { reloadPluginRuntime } from '../../plugin/pluginRuntime.js';
import { hasExtension } from '../../plugin/ExtensionPointRegistry.js';

const AUDIT_CATEGORY_TEXT = {
    ddl: '结构变更',
    core_write: '核心表写入',
    slow: '慢查询'
};

const getAuditCategoryClass = (category) => {
    if (category === 'core_write') return 'bg-red-100 text-red-800';
    if (category === 'slow') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-600';
};

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

const getStatusText = (state) => {
    if (state === 'STARTED') return '启用';
    if (state === 'FAILED') return '失败';
    return '停用';
};

const getStatusClass = (state) => {
    if (state === 'STARTED') return 'bg-green-100 text-green-800';
    if (state === 'FAILED') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-600';
};

export default function PluginManager() {
    const [plugins, setPlugins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [operating, setOperating] = useState('');
    const [settingsPlugin, setSettingsPlugin] = useState(null);
    const [upgradingPlugin, setUpgradingPlugin] = useState(null);
    const [auditPlugin, setAuditPlugin] = useState(null);
    const [auditRows, setAuditRows] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditPage, setAuditPage] = useState(1);
    const [auditTotalPages, setAuditTotalPages] = useState(1);
    const [auditTotalItems, setAuditTotalItems] = useState(0);

    const installInputRef = useRef(null);
    const upgradeInputRef = useRef(null);

    useEffect(() => {
        fetchPlugins();
    }, []);

    useEffect(() => {
        if (!auditPlugin) return;
        fetchAudit(auditPlugin.name, auditPage);
    }, [auditPlugin, auditPage]);

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

    const fetchAudit = async (name, page) => {
        try {
            setAuditLoading(true);
            const response = await apiClient.get(`/plugins/${name}/sql-audit?page=${page}&size=10`);
            if (response.code === 200 && response.data) {
                setAuditRows(response.data.data || []);
                setAuditTotalPages(response.data.total_pages || 1);
                setAuditTotalItems(response.data.total || 0);
            } else {
                showToast(response.message || '获取SQL审计失败');
            }
        } catch (error) {
            console.error('获取SQL审计失败:', error);
            showToast('获取SQL审计失败');
        } finally {
            setAuditLoading(false);
        }
    };

    const handleOpenAudit = (plugin) => {
        setAuditRows([]);
        setAuditTotalItems(0);
        setAuditTotalPages(1);
        setAuditPage(1);
        setAuditPlugin(plugin);
    };

    const handleCloseAudit = () => {
        setAuditPlugin(null);
        setAuditRows([]);
    };

    const doAction = async (action, name, successText) => {
        if (operating) return;
        setOperating(name);
        try {
            const response = await apiClient.post(`/plugins/${name}/${action}`);
            if (response.code === 200) {
                showToast(response.message || successText);

                await reloadPluginRuntime();
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

    const handleUpgrade = (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file || !upgradingPlugin) return;
        const plugin = upgradingPlugin;
        setUpgradingPlugin(null);
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
                if (url.endsWith('/install')) {
                    // 安装后整页刷新, 让前端运行时从零初始化(最稳妥)
                    setTimeout(() => window.location.reload(), 800);
                    return;
                }
                await reloadPluginRuntime();
                fetchPlugins();
            } else {
                showToast(response.message || '操作失败');
            }
        } catch (error) {
            console.error('插件上传失败:', error);
            showToast('插件上传失败');
        }
    };

    const handleOpenSettings = async (plugin) => {
        setSettingsPlugin(plugin);

        if (!hasExtension('plugin:settings:create', plugin.name)) {
            await reloadPluginRuntime();
            setSettingsPlugin((prev) => (prev ? { ...prev } : prev));
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

                await reloadPluginRuntime();
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

    const columns = [
        {
            key: 'display_name',
            label: '名称',
            className: 'font-medium text-gray-900',
            render: (_, plugin) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{plugin.display_name}</div>
                    <div className="text-xs text-gray-400">{plugin.name}</div>
                    {plugin.last_error && (
                        <div className="text-xs text-red-500 mt-0.5" title={plugin.last_error}>
                            失败原因: {plugin.last_error}
                        </div>
                    )}
                </div>
            )
        },
        { key: 'version', label: '版本', className: 'text-gray-500' },
        { key: 'author', label: '作者', className: 'text-gray-500' },
        {
            key: 'state',
            label: '状态',
            className: 'text-gray-500',
            render: (state) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(state)}`}>
                    {getStatusText(state)}
                </span>
            )
        },
        {
            key: 'create_time',
            label: '安装时间',
            className: 'text-gray-500',
            render: (value) => formatTime(value)
        },
        {
            key: 'actions',
            label: '操作',
            className: 'font-medium',
            render: (_, plugin) => (
                <>
                    {plugin.state === 'STARTED' ? (
                        <button
                            type="button"
                            onClick={() => doAction('stop', plugin.name, '插件已停用')}
                            disabled={!!operating}
                            className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50"
                        >
                            停用
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => doAction('start', plugin.name, '插件已启用')}
                            disabled={!!operating || plugin.state === 'FAILED'}
                            className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50"
                        >
                            启用
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => handleOpenSettings(plugin)}
                        disabled={!!operating}
                        className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50"
                    >
                        设置
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOpenAudit(plugin)}
                        disabled={!!operating}
                        className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50"
                    >
                        审计
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setUpgradingPlugin(plugin);
                            upgradeInputRef.current && upgradeInputRef.current.click();
                        }}
                        disabled={!!operating}
                        className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50"
                    >
                        升级
                    </button>
                    <button
                        type="button"
                        onClick={() => handleUninstall(plugin)}
                        disabled={!!operating}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                        卸载
                    </button>
                </>
            )
        }
    ];

    return (
        <>
            <DataTable
                title="插件管理"
                loading={loading}
                columns={columns}
                data={plugins}
                keyExtractor={(plugin) => plugin.name}
                emptyText="暂无插件，点击右上角「安装插件」上传 jar 文件"
                headerActions={
                    <>
                        <button
                            type="button"
                            onClick={() => installInputRef.current && installInputRef.current.click()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
                        <input
                            ref={upgradeInputRef}
                            type="file"
                            accept=".jar"
                            className="hidden"
                            onChange={handleUpgrade}
                        />
                    </>
                }
            />

            {settingsPlugin && (
                <>
                    <div className="fixed inset-0 backdrop-blur-sm bg-transparent z-40" onClick={() => setSettingsPlugin(null)}></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">{settingsPlugin.display_name} 设置</h3>
                            </div>
                            <div className="px-6 py-4 overflow-y-auto">
                                {hasExtension('plugin:settings:create', settingsPlugin.name) ? (
                                    <ExtensionSlot name="plugin:settings:create" pluginName={settingsPlugin.name} />
                                ) : (
                                    <p className="text-sm text-gray-400 py-8 text-center">该插件未启用或没有可用的设置面板</p>
                                )}
                            </div>
                            <div className="px-6 py-4 bg-gray-50 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSettingsPlugin(null)}
                                    className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {auditPlugin && (
                <>
                    <div className="fixed inset-0 backdrop-blur-sm bg-transparent z-40" onClick={handleCloseAudit}></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">{auditPlugin.display_name} SQL 审计</h3>
                                <button
                                    type="button"
                                    onClick={() => fetchAudit(auditPlugin.name, auditPage)}
                                    disabled={auditLoading}
                                    className="text-sm text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                >
                                    刷新
                                </button>
                            </div>
                            <div className="px-6 py-4 overflow-y-auto">
                                <p className="text-xs text-gray-400 mb-4">
                                    插件通过插件数据库访问宿主库的 SQL 记录，仅记录结构变更、核心表写入与慢查询，卸载插件后保留
                                </p>
                                {auditLoading ? (
                                    <div className="flex justify-center items-center h-40">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : auditRows.length > 0 ? (
                                    <>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SQL</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">耗时</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {auditRows.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAuditCategoryClass(item.category)}`}>
                                                                {AUDIT_CATEGORY_TEXT[item.category] || item.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            <div className="font-mono text-xs max-w-[70ch] truncate" title={item.sql_text}>
                                                                {item.sql_text}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cost_millis}ms</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(item.create_time)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <Pagination
                                            currentPage={auditPage}
                                            totalPages={auditTotalPages}
                                            totalItems={auditTotalItems}
                                            pageSize={10}
                                            onPageChange={setAuditPage}
                                        />
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-400 py-8 text-center">暂无审计记录</p>
                                )}
                            </div>
                            <div className="px-6 py-4 bg-gray-50 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleCloseAudit}
                                    className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
