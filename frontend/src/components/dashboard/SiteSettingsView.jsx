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
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [iconUploading, setIconUploading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [articleStatusOptions, setArticleStatusOptions] = useState([]);
    const [musics, setMusics] = useState([]);
    const [loadingMusics, setLoadingMusics] = useState(false);
    const fileInputRef = useRef(null);
    const iconFileInputRef = useRef(null);
    const audioFileInputRef = useRef(null);

    const [editingMusic, setEditingMusic] = useState(null);
    const [audioUploading, setAudioUploading] = useState(false);

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
        mail_enable_ssl: false,
        icp_record_number: '',
        mps_record_number: '',
        enable_register: 1,
        enable_music: 0,
        admin_post_no_review: 0
    });

    const [newMusic, setNewMusic] = useState({
        musicName: '',
        musicAuthor: '',
        musicUrl: ''
    });

    const [message, setMessage] = useState({ type: '', content: '' });

    const tabs = [
        { id: 'basic', name: '站点信息' },
        { id: 'media', name: '媒体设置' },
        { id: 'music', name: '音乐配置' },
        { id: 'filing', name: '备案信息' },
        { id: 'user', name: '用户权限' },
        { id: 'notification', name: '通知服务' },
        { id: 'extension', name: '扩展设置' }
    ];

    useEffect(() => {
        Promise.all([
            fetchSiteConfig(),
            fetchRoles(),
            fetchArticleStatusOptions(),
            fetchMusics()
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
                    mail_protocol: escapeHtml(response.data.mail_protocol) || 'smtp',
                    smtp_port: response.data.smtp_port || '',
                    mail_enable_tls: response.data.mail_enable_tls !== undefined ? response.data.mail_enable_tls : true,
                    mail_enable_ssl: response.data.mail_enable_ssl !== undefined ? response.data.mail_enable_ssl : false,
                    icp_record_number: escapeHtml(response.data.icp_record_number) || '',
                    mps_record_number: escapeHtml(response.data.mps_record_number) || '',
                    enable_register: response.data.enable_register !== undefined ? response.data.enable_register : 1,
                    enable_music: response.data.enable_music !== undefined ? response.data.enable_music : 0,
                    admin_post_no_review: response.data.admin_post_no_review !== undefined ? response.data.admin_post_no_review : 0
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
                setRoles(response.data);
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
                setArticleStatusOptions(response.data);
            } else {
                showMessage('error', response.message || '获取文章状态选项失败');
            }
        } catch (error) {
            console.error('获取文章状态选项失败:', error);
            showMessage('error', '获取文章状态选项时发生错误');
        }
    };

    const fetchMusics = async () => {
        try {
            setLoadingMusics(true);
            const response = await apiClient.get('/music/admin/enabled');

            if (response.success) {
                setMusics(response.data);
            } else {
                showMessage('error', response.message || '获取音乐列表失败');
            }
        } catch (error) {
            console.error('获取音乐列表失败:', error);
            showMessage('error', '获取音乐列表时发生错误');
        } finally {
            setLoadingMusics(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue;

        if (type === 'checkbox') {
            finalValue = checked;
        } else if (name === 'smtp_port' || name === 'article_status') {
            finalValue = value === '' ? '' : parseInt(value, 10);
        } else if (name === 'enable_music' || name === 'admin_post_no_review') {
            finalValue = checked ? 1 : 0;
        } else {
            finalValue = escapeHtml(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    // 编辑音频
    const startEditMusic = (music) => {
        setEditingMusic({
            id: music.id,
            musicName: music.musicName || '',
            musicAuthor: music.musicAuthor || '',
            musicUrl: music.musicUrl || ''
        });
    };

    // 取消编辑
    const cancelEditMusic = () => {
        setEditingMusic(null);
    };

    // 保存编辑的音乐
    const saveEditMusic = async () => {
        if (!editingMusic.musicName || !editingMusic.musicAuthor || !editingMusic.musicUrl) {
            showMessage('error', '请填写完整的音乐信息');
            return;
        }

        try {
            const response = await apiClient.put(`/music/update/${editingMusic.id}`, {
                musicName: editingMusic.musicName,
                musicAuthor: editingMusic.musicAuthor,
                musicUrl: editingMusic.musicUrl
            });

            if (response.success) {
                showMessage('success', '音乐更新成功');
                setEditingMusic(null);
                fetchMusics();
            } else {
                showMessage('error', response.message || '音乐更新失败');
            }
        } catch (error) {
            console.error('更新音乐失败:', error);
            showMessage('error', '更新音乐时发生错误');
        }
    };

    // 普通上传(小文件)
    const normalAudioUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/uploadattachment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.fileUrl || response.data?.fileUrl) {
                return response.fileUrl || response.data?.fileUrl;
            } else {
                throw new Error(response.error || '上传失败');
            }
        } catch (error) {
            console.error('音频上传失败:', error);
            throw error;
        }
    };

    // 分片上传
    const multipartAudioUpload = async (file) => {
        const CHUNK_SIZE = 5 * 1024 * 1024;
        const chunks = Math.ceil(file.size / CHUNK_SIZE);

        try {
            const initResponse = await apiClient.post('/uploadattachment/init', {
                filename: file.name
            });
            const uploadId = initResponse.data?.uploadId || initResponse.uploadId;

            for (let i = 0; i < chunks; i++) {
                const start = i * CHUNK_SIZE;
                const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));

                await apiClient.post('/uploadattachment/part', chunk, {
                    headers: {
                        'Upload-Id': uploadId,
                        'Chunk-Index': i,
                        'Content-Type': 'application/octet-stream'
                    }
                });
            }

            const completeResponse = await apiClient.post('/uploadattachment/complete', {
                uploadId,
                filename: file.name
            });

            return completeResponse.data?.fileUrl || completeResponse.fileUrl;
        } catch (error) {
            console.error('分片上传失败:', error);
            throw new Error('分片上传失败: ' + (error.response?.data?.error || error.message));
        }
    };

    // 上传音频文件
    const uploadAudioFile = async (file) => {
        const FILE_SIZE_THRESHOLD = 10 * 1024 * 1024; // 10MB

        if (file.size > FILE_SIZE_THRESHOLD) {
            return await multipartAudioUpload(file);
        } else {
            return await normalAudioUpload(file);
        }
    };
    const handleAudioUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            showMessage('error', '请选择音频文件');
            return;
        }
        setAudioUploading(true);

        const fileSize = (file.size / (1024 * 1024)).toFixed(2);
        const uploadMethod = file.size > 10 * 1024 * 1024 ? '（大文件,使用分片上传）' : '（小文件,使用普通上传）';

        try {
            showMessage('info', `正在上传音频 ${uploadMethod}... (${fileSize}MB)`);
            const fileUrl = await uploadAudioFile(file);

            setNewMusic(prev => ({
                ...prev,
                musicUrl: fileUrl
            }));

            showMessage('success', `音频上传成功 (${fileSize}MB)`);
        } catch (error) {
            console.error('上传音频失败:', error);
            showMessage('error', '音频上传失败: ' + error.message);
        } finally {
            setAudioUploading(false);
            if (audioFileInputRef.current) {
                audioFileInputRef.current.value = '';
            }
        }
    };

    const addMusic = async () => {
        if (!newMusic.musicName || !newMusic.musicAuthor || !newMusic.musicUrl) {
            showMessage('error', '请填写完整的音乐信息');
            return;
        }

        try {
            const response = await apiClient.post('/music/add', {
                musicName: newMusic.musicName,
                musicAuthor: newMusic.musicAuthor,
                musicUrl: newMusic.musicUrl
            });

            if (response.success) {
                showMessage('success', '音乐添加成功');
                setNewMusic({ musicName: '', musicAuthor: '', musicUrl: '' });
                fetchMusics();
            } else {
                showMessage('error', response.message || '音乐添加失败');
            }
        } catch (error) {
            console.error('添加音乐失败:', error);
            showMessage('error', '添加音乐时发生错误');
        }
    };

    const deleteMusic = async (id) => {
        if (!window.confirm('确定要删除这首音乐吗？')) {
            return;
        }

        try {
            const response = await apiClient.delete(`/music/delete/${id}`);

            if (response.success) {
                showMessage('success', '音乐删除成功');
                fetchMusics();
            } else {
                showMessage('error', response.message || '音乐删除失败');
            }
        } catch (error) {
            console.error('删除音乐失败:', error);
            showMessage('error', '删除音乐时发生错误');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);

            const unescapedData = {
                site_name: unescapeHtml(formData.site_name),
                copyright: unescapeHtml(formData.copyright),
                hero_title: unescapeHtml(formData.hero_title),
                hero_subtitle: unescapeHtml(formData.hero_subtitle),
                hero_image: formData.hero_image,
                site_icon: formData.site_icon,
                register_user_permission: parseInt(formData.register_user_permission, 10),
                article_status: parseInt(formData.article_status, 10),
                expansion_server: unescapeHtml(formData.expansion_server),
                enable_notification: formData.enable_notification,
                smtp_host: unescapeHtml(formData.smtp_host),
                smtp_port: formData.smtp_port === '' ? null : parseInt(formData.smtp_port, 10),
                mail_sender_email: unescapeHtml(formData.mail_sender_email),
                mail_sender_name: unescapeHtml(formData.mail_sender_name),
                mail_username: unescapeHtml(formData.mail_username),
                mail_protocol: unescapeHtml(formData.mail_protocol),
                mail_enable_tls: formData.mail_enable_tls,
                mail_enable_ssl: formData.mail_enable_ssl,
                icp_record_number: unescapeHtml(formData.icp_record_number),
                mps_record_number: unescapeHtml(formData.mps_record_number),
                enable_register: formData.enable_register,
                enable_music: formData.enable_music,
                admin_post_no_review: formData.admin_post_no_review  // 添加管理员文章审核字段
            };

            if (formData.mail_password && formData.mail_password.trim() !== '') {
                unescapedData.mail_password = formData.mail_password;
            }

            const response = await apiClient.post('/site/editsiteconfig', unescapedData);

            if (response.success) {
                showMessage('success', '站点配置保存成功');
                setFormData(prev => ({
                    ...prev,
                    mail_password: ''
                }));
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
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">站点配置管理</h2>
                <p className="mt-1 text-sm text-gray-500">修改后请点击底部的保存按钮</p>
            </div>

            {message.content && (
                <div className="mx-4 md:mx-6 mt-4">
                    <div className={`p-4 rounded-lg ${
                        message.type === 'success' ? 'bg-green-50 text-green-800' :
                            message.type === 'error' ? 'bg-red-50 text-red-800' :
                                'bg-blue-50 text-blue-800'
                    }`}>
                        {message.content}
                    </div>
                </div>
            )}

            <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex space-x-2 px-4 md:px-6 min-w-max" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                            `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="p-4 md:p-6">
                    {activeTab === 'basic' && (
                        <div className="space-y-6">
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
                    )}

                    {/* 图标设置 */}
                    {activeTab === 'media' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    首页头图
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        id="hero_image"
                                        name="hero_image"
                                        value={formData.hero_image}
                                        onChange={handleInputChange}
                                        placeholder="点击上传按钮或输入图片URL"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        disabled={uploading}
                                        className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {uploading ? '上传中...' : '上传图片'}
                                    </button>
                                </div>
                                {previewImageUrl && (
                                    <div className="mt-3">
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    站点图标
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        id="site_icon"
                                        name="site_icon"
                                        value={formData.site_icon}
                                        onChange={handleInputChange}
                                        placeholder="点击上传按钮或输入图标URL"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="file"
                                        ref={iconFileInputRef}
                                        onChange={handleIconUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={triggerIconFileInput}
                                        disabled={iconUploading}
                                        className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {iconUploading ? '上传中...' : '上传图标'}
                                    </button>
                                </div>
                                {previewIconUrl && (
                                    <div className="mt-3">
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
                    )}

                    {/* 音乐配置 */}
                    {activeTab === 'music' && (
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.enable_music === 1}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, enable_music: e.target.checked ? 1 : 0 }));
                                        }}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">启用悬浮音乐播放器</span>
                                </label>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-4">添加新音乐</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">曲名</label>
                                        <input
                                            type="text"
                                            value={newMusic.musicName}
                                            onChange={(e) => setNewMusic(prev => ({ ...prev, musicName: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="请输入曲名"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">歌手名</label>
                                        <input
                                            type="text"
                                            value={newMusic.musicAuthor}
                                            onChange={(e) => setNewMusic(prev => ({ ...prev, musicAuthor: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="请输入歌手名"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">音乐地址</label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                value={newMusic.musicUrl}
                                                onChange={(e) => setNewMusic(prev => ({ ...prev, musicUrl: e.target.value }))}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="请输入音乐地址或上传文件"
                                            />
                                            <label className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50">
                                                <input
                                                    type="file"
                                                    ref={audioFileInputRef}
                                                    accept="audio/*"
                                                    onChange={handleAudioUpload}
                                                    className="hidden"
                                                    disabled={audioUploading}
                                                />
                                                {audioUploading ? '上传中...' : '上传音频'}
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addMusic}
                                        className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        添加音乐
                                    </button>
                                </div>
                            </div>

                            {/* 音乐列表 */}
                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-4">音乐列表</h4>
                                {loadingMusics ? (
                                    <div className="text-center py-8 text-gray-500">加载中...</div>
                                ) : musics.filter(music => music.status === 1).length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">暂无音乐</div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="block md:hidden space-y-4">
                                            {musics.filter(music => music.status === 1).map((music) => (
                                                <div key={music.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                                    <div>
                                                        <label className="text-xs text-gray-500 block mb-1">曲名</label>
                                                        {editingMusic && editingMusic.id === music.id ? (
                                                            <input
                                                                type="text"
                                                                value={editingMusic.musicName}
                                                                onChange={(e) => setEditingMusic(prev => ({ ...prev, musicName: e.target.value }))}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                            />
                                                        ) : (
                                                            <div className="font-medium">{music.musicName}</div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="text-xs text-gray-500 block mb-1">歌手</label>
                                                        {editingMusic && editingMusic.id === music.id ? (
                                                            <input
                                                                type="text"
                                                                value={editingMusic.musicAuthor}
                                                                onChange={(e) => setEditingMusic(prev => ({ ...prev, musicAuthor: e.target.value }))}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                            />
                                                        ) : (
                                                            <div className="text-sm text-gray-700">{music.musicAuthor}</div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="text-xs text-gray-500 block mb-1">音乐地址</label>
                                                        {editingMusic && editingMusic.id === music.id ? (
                                                            <input
                                                                type="text"
                                                                value={editingMusic.musicUrl}
                                                                onChange={(e) => setEditingMusic(prev => ({ ...prev, musicUrl: e.target.value }))}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                            />
                                                        ) : (
                                                            <div className="text-sm text-blue-600 break-all">{music.musicUrl}</div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                        <span className="text-xs text-green-600 font-medium">启用</span>
                                                        <div className="flex gap-2">
                                                            {editingMusic && editingMusic.id === music.id ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={saveEditMusic}
                                                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                                    >
                                                                        保存
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelEditMusic}
                                                                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                                                                    >
                                                                        取消
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => startEditMusic(music)}
                                                                        className="px-3 py-1 text-blue-600 text-sm hover:bg-blue-50 rounded"
                                                                    >
                                                                        编辑
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => deleteMusic(music.id)}
                                                                        className="px-3 py-1 text-red-600 text-sm hover:bg-red-50 rounded"
                                                                    >
                                                                        删除
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">曲名</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">歌手</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">音乐地址</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {musics.filter(music => music.status === 1).map((music) => (
                                                    <tr key={music.id}>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            {editingMusic && editingMusic.id === music.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingMusic.musicName}
                                                                    onChange={(e) => setEditingMusic(prev => ({ ...prev, musicName: e.target.value }))}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                                />
                                                            ) : (
                                                                music.musicName
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            {editingMusic && editingMusic.id === music.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingMusic.musicAuthor}
                                                                    onChange={(e) => setEditingMusic(prev => ({ ...prev, musicAuthor: e.target.value }))}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                                />
                                                            ) : (
                                                                music.musicAuthor
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {editingMusic && editingMusic.id === music.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingMusic.musicUrl}
                                                                    onChange={(e) => setEditingMusic(prev => ({ ...prev, musicUrl: e.target.value }))}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                                />
                                                            ) : (
                                                                <div className="max-w-xs truncate text-blue-600">{music.musicUrl}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className="font-medium">启用</span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            {editingMusic && editingMusic.id === music.id ? (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={saveEditMusic}
                                                                        className="text-green-600 hover:text-green-900"
                                                                    >
                                                                        保存
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelEditMusic}
                                                                        className="text-gray-600 hover:text-gray-900"
                                                                    >
                                                                        取消
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => startEditMusic(music)}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                    >
                                                                        编辑
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => deleteMusic(music.id)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                    >
                                                                        删除
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 备案信息 */}
                    {activeTab === 'filing' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="icp_record_number" className="block text-sm font-medium text-gray-700 mb-1">
                                        ICP备案号
                                    </label>
                                    <input
                                        type="text"
                                        id="icp_record_number"
                                        name="icp_record_number"
                                        value={unescapeHtml(formData.icp_record_number)}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="请输入ICP备案号"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="mps_record_number" className="block text-sm font-medium text-gray-700 mb-1">
                                        公安联网备案号
                                    </label>
                                    <input
                                        type="text"
                                        id="mps_record_number"
                                        name="mps_record_number"
                                        value={unescapeHtml(formData.mps_record_number)}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="请输入公安联网备案号"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 用户与权限 */}
                    {activeTab === 'user' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="enable_register" className="block text-sm font-medium text-gray-700 mb-1">
                                        用户注册开关
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            id="enable_register"
                                            name="enable_register"
                                            type="checkbox"
                                            checked={formData.enable_register === 1}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    enable_register: e.target.checked ? 1 : 0
                                                }));
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="enable_register" className="ml-2 block text-sm text-gray-700">
                                            启用用户注册功能
                                        </label>
                                    </div>
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
                                                {role.name}
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
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        管理员文章审核
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            id="admin_post_no_review"
                                            name="admin_post_no_review"
                                            type="checkbox"
                                            checked={formData.admin_post_no_review === 1}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    admin_post_no_review: e.target.checked ? 1 : 0
                                                }));
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="admin_post_no_review" className="ml-2 block text-sm text-gray-700">
                                            管理员文章无需审核
                                        </label>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        启用后管理员发布的文章将直接发布，无需等待审核
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 通知服务配置 */}
                    {activeTab === 'notification' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-3 rounded-md">
                                <p className="text-sm text-blue-700">
                                    <strong>说明：</strong>通常来说465端口对应ssl加密,587端口对应tls加密,请检查你的邮件服务商支持的加密方式,如果ssl和tls都勾选系统会使用tls加密
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
                                            启用通知功能（该选项不影响安全模块的邮件通知功能,如:忘记密码）（配置邮箱信息后才能使用邮件通知）
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
                                        placeholder="例如: smtp.qq.com"
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
                                        placeholder="邮箱密码或授权码（留空表示不修改）"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {formData.mail_password && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            注意:输入新密码将会覆盖现有密码
                                        </p>
                                    )}
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
                    )}

                    {/* 扩展服务器设置 */}
                    {activeTab === 'extension' && (
                        <div className="space-y-6">
                            <div>
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
                    )}
                </div>

                <div className="border-t border-gray-200 px-4 md:px-6 py-4 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-wait flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>保存中...</span>
                            </>
                        ) : (
                            <span>保存全部设置</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}