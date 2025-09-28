import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../utils/axios';
import {getConfig} from "../../utils/config.jsx";

const getFullImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    try {
        const config = getConfig();
        return config.getFullUrl(url);
    } catch (error) {
        if (url.startsWith('/')) {
            return url;
        }

        return `/upload/${url}`;
    }
};

const escapeHtml = (unsafe) => {
    if (!unsafe) return unsafe;

    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const unescapeHtml = (safe) => {
    if (!safe) return safe;

    return safe
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
};

export default function SiteSettingsView() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [iconUploading, setIconUploading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [articleStatusOptions, setArticleStatusOptions] = useState([]);
    const fileInputRef = useRef(null);
    const iconFileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        site_name: '',
        copyright: '',
        hero_title: '',
        hero_subtitle: '',
        hero_image: '',
        site_icon: '',
        register_user_permission: '2',
        article_status: 3,
        expansion_server: ''
    });

    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        Promise.all([
            fetchSiteConfig(),
            fetchRoles(),
            fetchArticleStatusOptions()
        ]).finally(() => {
            setLoading(false);
        });
    }, []);

    const fetchSiteConfig = async () => {
        try {
            const response = await apiClient.get('/site/getsiteconfig');

            if (response.success) {
                const escapedData = {
                    ...response.data,
                    site_name: escapeHtml(response.data.site_name) || '',
                    copyright: escapeHtml(response.data.copyright) || '',
                    hero_title: escapeHtml(response.data.hero_title) || '',
                    hero_subtitle: escapeHtml(response.data.hero_subtitle) || '',
                    hero_image: response.data.hero_image || '',
                    site_icon: response.data.site_icon || '' // 初始化站点图标
                };
                setFormData(escapedData);
            } else {
                showMessage('error', response.message || '获取站点配置失败');
            }
        } catch (error) {
            console.error('获取站点配置失败:', error);
            showMessage('error', '获取站点配置时发生错误');
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await apiClient.get('/site/roles');

            if (response.success) {
                const escapedRoles = response.data.map(role => ({
                    ...role,
                    name: escapeHtml(role.name) || '',
                    description: escapeHtml(role.description) || ''
                }));
                setRoles(escapedRoles);
            } else {
                showMessage('error', response.message || '获取角色列表失败');
            }
        } catch (error) {
            console.error('获取角色列表失败:', error);
            showMessage('error', '获取角色列表时发生错误');
        }
    };

    const fetchArticleStatusOptions = async () => {
        try {
            const response = await apiClient.get('/site/article-status-options');

            if (response.success) {
                const escapedOptions = response.data.map(option => ({
                    ...option,
                    label: escapeHtml(option.label) || ''
                }));
                setArticleStatusOptions(escapedOptions);
            } else {
                showMessage('error', response.message || '获取文章状态选项失败');
            }
        } catch (error) {
            console.error('获取文章状态选项失败:', error);
            showMessage('error', '获取文章状态选项时发生错误');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const escapedValue = escapeHtml(value);
        setFormData(prev => ({
            ...prev,
            [name]: escapedValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);

            const unescapedData = {
                ...formData,
                site_name: unescapeHtml(formData.site_name),
                copyright: unescapeHtml(formData.copyright),
                hero_title: unescapeHtml(formData.hero_title),
                hero_subtitle: unescapeHtml(formData.hero_subtitle)
            };

            const response = await apiClient.post('/site/editsiteconfig', unescapedData);

            if (response.success) {
                showMessage('success', '站点配置保存成功');
            } else {
                showMessage('error', response.message || '保存失败');
            }
        } catch (error) {
            console.error('保存站点配置失败:', error);
            showMessage('error', '保存站点配置时发生错误');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const response = await apiClient.post('/uploadattachment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.fileUrl) {
                setFormData(prev => ({
                    ...prev,
                    hero_image: response.fileUrl
                }));
                showMessage('success', '图片上传成功');
            } else {
                showMessage('error', response.error || '图片上传失败');
            }
        } catch (error) {
            console.error('图片上传失败:', error);
            showMessage('error', '图片上传时发生错误');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleIconUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIconUploading(true);
            const response = await apiClient.post('/uploadattachment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.fileUrl) {
                setFormData(prev => ({
                    ...prev,
                    site_icon: response.fileUrl
                }));
                showMessage('success', '站点图标上传成功');
            } else {
                showMessage('error', response.error || '站点图标上传失败');
            }
        } catch (error) {
            console.error('站点图标上传失败:', error);
            showMessage('error', '站点图标上传时发生错误');
        } finally {
            setIconUploading(false);
            if (iconFileInputRef.current) {
                iconFileInputRef.current.value = '';
            }
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // 触发站点图标文件选择
    const triggerIconFileInput = () => {
        if (iconFileInputRef.current) {
            iconFileInputRef.current.click();
        }
    };

    const showMessage = (type, content) => {
        setMessage({ type, content });
        setTimeout(() => {
            setMessage({ type: '', content: '' });
        }, 3000);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    const previewImageUrl = formData.hero_image ? getFullImageUrl(formData.hero_image) : null;
    const previewIconUrl = formData.site_icon ? getFullImageUrl(formData.site_icon) : null;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">站点信息设置</h2>

            {message.content && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.content}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-1">
                            站点名称
                        </label>
                        <input
                            type="text"
                            id="site_name"
                            name="site_name"
                            value={unescapeHtml(formData.site_name)}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="copyright" className="block text-sm font-medium text-gray-700 mb-1">
                            版权信息
                        </label>
                        <input
                            type="text"
                            id="copyright"
                            name="copyright"
                            value={unescapeHtml(formData.copyright)}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="hero_title" className="block text-sm font-medium text-gray-700 mb-1">
                            首页标题
                        </label>
                        <input
                            type="text"
                            id="hero_title"
                            name="hero_title"
                            value={unescapeHtml(formData.hero_title)}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="hero_subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                            首页副标题
                        </label>
                        <textarea
                            id="hero_subtitle"
                            name="hero_subtitle"
                            value={unescapeHtml(formData.hero_subtitle)}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            首页头图
                        </label>
                        <div className="flex items-start space-x-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    id="hero_image"
                                    name="hero_image"
                                    value={formData.hero_image}
                                    onChange={handleInputChange}
                                    placeholder="点击上传按钮或输入图片URL"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={triggerFileInput}
                                disabled={uploading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {uploading ? '上传中...' : '上传图片'}
                            </button>
                        </div>
                        {previewImageUrl && (
                            <div className="mt-2">
                                <img
                                    src={previewImageUrl}
                                    alt="首页头图预览"
                                    className="max-w-full h-48 object-cover rounded-md"
                                    onError={(e) => {
                                        e.target.src = '/default-image.png';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            站点图标
                        </label>
                        <div className="flex items-start space-x-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    id="site_icon"
                                    name="site_icon"
                                    value={formData.site_icon}
                                    onChange={handleInputChange}
                                    placeholder="点击上传按钮或输入图标URL"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="file"
                                    ref={iconFileInputRef}
                                    onChange={handleIconUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={triggerIconFileInput}
                                disabled={iconUploading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {iconUploading ? '上传中...' : '上传图标'}
                            </button>
                        </div>
                        {previewIconUrl && (
                            <div className="mt-2">
                                <img
                                    src={previewIconUrl}
                                    alt="站点图标预览"
                                    className="w-16 h-16 object-contain rounded-md"
                                    onError={(e) => {
                                        e.target.src = '/default-icon.png';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="register_user_permission" className="block text-sm font-medium text-gray-700 mb-1">
                            注册用户默认角色
                        </label>
                        <select
                            id="register_user_permission"
                            name="register_user_permission"
                            value={formData.register_user_permission}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {unescapeHtml(role.name)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="article_status" className="block text-sm font-medium text-gray-700 mb-1">
                            文章默认状态
                        </label>
                        <select
                            id="article_status"
                            name="article_status"
                            value={formData.article_status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {articleStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {unescapeHtml(option.label)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="expansion_server" className="block text-sm font-medium text-gray-700 mb-1">
                            扩展服务器地址
                        </label>
                        <input
                            type="text"
                            id="expansion_server"
                            name="expansion_server"
                            value={unescapeHtml(formData.expansion_server)}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入扩展服务器地址"
                        />
                    </div>

                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {saving ? '保存中...' : '保存设置'}
                    </button>
                </div>
            </form>
        </div>
    );
}
