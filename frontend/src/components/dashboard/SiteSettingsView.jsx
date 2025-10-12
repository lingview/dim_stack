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
        expansion_server: '',
        enable_notification: false,
        smtp_host: '',
        smtp_port: '',
        mail_sender_email: '',
        mail_sender_name: '系统通知',
        mail_username: '',
        mail_password: '',
        mail_protocol: 'smtp',
        mail_enable_tls: true,
        mail_enable_ssl: false
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
                    site_icon: response.data.site_icon || '',
                    enable_notification: response.data.enable_notification !== undefined ? response.data.enable_notification : false,
                    smtp_host: escapeHtml(response.data.smtp_host) || '',
                    mail_sender_email: escapeHtml(response.data.mail_sender_email) || '',
                    mail_sender_name: escapeHtml(response.data.mail_sender_name) || '系统通知',
                    mail_username: escapeHtml(response.data.mail_username) || '',
                    mail_password: response.data.mail_password || '',
                    mail_protocol: escapeHtml(response.data.mail_protocol) || 'smtp',
                    smtp_port: response.data.smtp_port || '',
                    mail_enable_tls: response.data.mail_enable_tls !== undefined ? response.data.mail_enable_tls : true,
                    mail_enable_ssl: response.data.mail_enable_ssl !== undefined ? response.data.mail_enable_ssl : false
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
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : escapeHtml(value);

        if (name === 'smtp_port') {
            finalValue = value === '' ? '' : parseInt(value, 10);
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
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
                hero_subtitle: unescapeHtml(formData.hero_subtitle),
                enable_notification: formData.enable_notification,
                smtp_host: unescapeHtml(formData.smtp_host),
                mail_sender_email: unescapeHtml(formData.mail_sender_email),
                mail_sender_name: unescapeHtml(formData.mail_sender_name),
                mail_username: unescapeHtml(formData.mail_username),
                mail_password: formData.mail_password,
                mail_protocol: unescapeHtml(formData.mail_protocol)
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">站点信息设置 - 修改后请点击页面最下方的保存按钮</h2>

            {message.content && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.content}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基础信息 */}
                <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">基础信息</h3>
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
                    </div>
                </div>

                {/* 图标设置 */}
                <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">媒体设置</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>
                </div>

                {/* 用户与权限 */}
                <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">用户与权限</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>
                </div>

                {/* 通知服务配置 */}
                <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">邮件服务配置</h3>
                    <div className="bg-blue-50 p-3 rounded-md mb-4">
                        <p className="text-sm text-blue-700">
                            <strong>说明：</strong>通常来说465端口对应ssl加密，587端口对应tls加密，请检查你的邮件服务商支持的加密方式，如果ssl和tls都勾选系统会使用tls加密
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <div className="flex items-center">
                                <input
                                    id="enable_notification"
                                    name="enable_notification"
                                    type="checkbox"
                                    checked={formData.enable_notification}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="enable_notification" className="ml-2 block text-sm font-medium text-gray-700">
                                    启用邮件通知功能
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="smtp_host" className="block text-sm font-medium text-gray-700 mb-1">
                                SMTP服务器地址
                            </label>
                            <input
                                type="text"
                                id="smtp_host"
                                name="smtp_host"
                                value={unescapeHtml(formData.smtp_host)}
                                onChange={handleInputChange}
                                placeholder="例如: smtp.mxhichina.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="smtp_port" className="block text-sm font-medium text-gray-700 mb-1">
                                SMTP端口
                            </label>
                            <input
                                type="number"
                                id="smtp_port"
                                name="smtp_port"
                                value={formData.smtp_port}
                                onChange={handleInputChange}
                                placeholder="例如: 465 或 587"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="mail_username" className="block text-sm font-medium text-gray-700 mb-1">
                                邮箱账号
                            </label>
                            <input
                                type="text"
                                id="mail_username"
                                name="mail_username"
                                value={unescapeHtml(formData.mail_username)}
                                onChange={handleInputChange}
                                placeholder="用于登录SMTP服务器的邮箱账号"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="mail_password" className="block text-sm font-medium text-gray-700 mb-1">
                                邮箱密码/授权码
                            </label>
                            <input
                                type="password"
                                id="mail_password"
                                name="mail_password"
                                value={formData.mail_password}
                                onChange={handleInputChange}
                                placeholder="邮箱密码或授权码"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="mail_sender_email" className="block text-sm font-medium text-gray-700 mb-1">
                                发件人邮箱
                            </label>
                            <input
                                type="email"
                                id="mail_sender_email"
                                name="mail_sender_email"
                                value={unescapeHtml(formData.mail_sender_email)}
                                onChange={handleInputChange}
                                placeholder="显示在邮件中的发件人邮箱"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="mail_sender_name" className="block text-sm font-medium text-gray-700 mb-1">
                                发件人名称
                            </label>
                            <input
                                type="text"
                                id="mail_sender_name"
                                name="mail_sender_name"
                                value={unescapeHtml(formData.mail_sender_name)}
                                onChange={handleInputChange}
                                placeholder="显示在邮件中的发件人名称"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="mail_protocol" className="block text-sm font-medium text-gray-700 mb-1">
                                邮件协议
                            </label>
                            <select
                                id="mail_protocol"
                                name="mail_protocol"
                                value={formData.mail_protocol}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="smtp">SMTP</option>
                                <option value="smtps">SMTPS</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex items-center">
                                <input
                                    id="mail_enable_tls"
                                    name="mail_enable_tls"
                                    type="checkbox"
                                    checked={formData.mail_enable_tls}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="mail_enable_tls" className="ml-2 block text-sm text-gray-700">
                                    启用TLS加密
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="mail_enable_ssl"
                                    name="mail_enable_ssl"
                                    type="checkbox"
                                    checked={formData.mail_enable_ssl}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="mail_enable_ssl" className="ml-2 block text-sm text-gray-700">
                                    启用SSL加密
                                </label>
                            </div>
                        </div>
                    </div>
                </div>


                {/* 扩展服务器设置 */}
                <div className="pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">扩展设置</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
