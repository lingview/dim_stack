import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';

export default function ThemesStoreView() {
    const [localThemes, setLocalThemes] = useState([]);
    const [cloudThemes, setCloudThemes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cloudLoading, setCloudLoading] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadLocalThemes();
    }, []);

    const loadLocalThemes = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/theme/list');
            const themes = parseLocalThemes(response);
            setLocalThemes(themes);
        } catch (error) {
            console.error('获取本地主题列表失败:', error);
            setMessage({ type: 'error', text: '获取本地主题列表失败' });
        } finally {
            setLoading(false);
        }
    };

    const parseLocalThemes = (text) => {
        const lines = text.split('\n');
        const themes = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('- ')) {
                const themeInfo = line.substring(2);
                const [name, status] = themeInfo.split(' (');
                const isCurrent = status && status.includes('current');
                themes.push({
                    name: name,
                    slug: name,
                    isCurrent: isCurrent,
                    type: 'local'
                });
            }
        }

        return themes;
    };

    const fetchCloudThemes = async () => {
        try {
            setCloudLoading(true);
            const response = await apiClient.post('/getthemeslist');

            if (response.code === 200) {
                const themesData = response.data;
                const themes = themesData && themesData.data ?
                    (Array.isArray(themesData.data) ? themesData.data : []) : [];
                setCloudThemes(themes);
                setMessage({ type: 'success', text: '云端主题列表获取成功' });
            } else {
                setMessage({ type: 'error', text: response.message || '获取云端主题列表失败' });
            }
        } catch (error) {
            console.error('获取云端主题列表失败:', error);
            setMessage({ type: 'error', text: '获取云端主题列表失败' });
        } finally {
            setCloudLoading(false);
        }
    };

    const installTheme = async (slug) => {
        try {
            setInstalling(true);
            const response = await apiClient.post('/gettheme', { slug });

            if (response.code === 200) {
                setMessage({ type: 'success', text: response.message || `主题 ${slug} 安装成功` });
                loadLocalThemes();
                setShowPreview(false);
            } else {
                setMessage({ type: 'error', text: response.message || `安装主题 ${slug} 失败` });
            }
        } catch (error) {
            console.error('安装主题失败:', error);
            setMessage({ type: 'error', text: `安装主题失败: ${error.message}` });
        } finally {
            setInstalling(false);
        }
    };

    const deleteTheme = async (slug) => {
        if (window.confirm(`确定要删除主题 "${slug}" 吗？`)) {
            try {
                const response = await apiClient.post('/deletetheme', { slug });

                if (response.code === 200) {
                    setMessage({ type: 'success', text: response.message || `主题 ${slug} 删除成功` });
                    loadLocalThemes();
                } else {
                    setMessage({ type: 'error', text: response.message || `删除主题 ${slug} 失败` });
                }
            } catch (error) {
                console.error('删除主题失败:', error);
                setMessage({ type: 'error', text: `删除主题失败: ${error.message}` });
            }
        }
    };

    const switchTheme = async (themeName) => {
        try {
            const response = await apiClient.post(`/theme/switch?themeName=${themeName}`);

            if (response.includes('successfully')) {
                setMessage({ type: 'success', text: `主题已切换为 ${themeName}` });
                loadLocalThemes();
            } else {
                setMessage({ type: 'error', text: response });
            }
        } catch (error) {
            console.error('切换主题失败:', error);
            setMessage({ type: 'error', text: `切换主题失败: ${error.message}` });
        }
    };

    const showThemePreview = (theme) => {
        setSelectedTheme(theme);
        setShowPreview(true);
    };

    const closePreview = () => {
        setShowPreview(false);
        setSelectedTheme(null);
    };

    return (
        <div className="mx-auto">
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">主题商店</h2>
                    <p className="mt-1 text-sm text-gray-500">管理本地主题和获取云端主题</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">本地主题</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : localThemes.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">暂无本地主题</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {localThemes.map((theme) => (
                                    <div key={theme.slug} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{theme.name}</h3>
                                                    {theme.isCurrent && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                            当前使用
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex space-x-2">
                                                {!theme.isCurrent && (
                                                    <button
                                                        onClick={() => switchTheme(theme.slug)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        使用
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteTheme(theme.slug)}
                                                    disabled={theme.isCurrent}
                                                    className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white ${
                                                        theme.isCurrent
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-red-600 hover:bg-red-700'
                                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">云端主题</h2>
                            <button
                                onClick={fetchCloudThemes}
                                disabled={cloudLoading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {cloudLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        获取中...
                                    </>
                                ) : (
                                    '获取云端主题'
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        {cloudThemes.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无云端主题</h3>
                                <p className="mt-1 text-sm text-gray-500">点击上方按钮获取云端主题列表</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cloudThemes.map((theme) => (
                                    <div key={theme.slug} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                            {theme.preview_url ? (
                                                <img
                                                    src={theme.preview_url}
                                                    alt={theme.name}
                                                    className="object-cover w-full h-48 cursor-pointer"
                                                    onClick={() => showThemePreview(theme)}
                                                />
                                            ) : (
                                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                                                    <span className="text-gray-500">无预览图</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900">{theme.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {theme.tags && theme.tags.map((tag, index) => (
                                                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex justify-between items-center">
                                                <span className="text-sm text-gray-500">{theme.version}</span>
                                                <button
                                                    onClick={() => installTheme(theme.slug)}
                                                    disabled={installing}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                                >
                                                    {installing ? '安装中...' : '安装'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {showPreview && selectedTheme && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{selectedTheme.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{selectedTheme.description}</p>
                                    </div>
                                    <button
                                        onClick={closePreview}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mt-4">
                                    {selectedTheme.preview_url ? (
                                        <img
                                            src={selectedTheme.preview_url}
                                            alt={selectedTheme.name}
                                            className="w-full rounded-lg"
                                        />
                                    ) : (
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center">
                                            <span className="text-gray-500">无预览图</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">作者</h4>
                                        <p className="text-sm text-gray-500">{selectedTheme.author}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">版本</h4>
                                        <p className="text-sm text-gray-500">{selectedTheme.version}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">文件大小</h4>
                                        <p className="text-sm text-gray-500">{selectedTheme.file_size}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">上传时间</h4>
                                        <p className="text-sm text-gray-500">
                                            {new Date(selectedTheme.upload_time).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-900">标签</h4>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {selectedTheme.tags && selectedTheme.tags.map((tag, index) => (
                                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={closePreview}
                                        className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        关闭
                                    </button>
                                    <button
                                        onClick={() => {
                                            installTheme(selectedTheme.slug);
                                            closePreview();
                                        }}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        安装主题
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
