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
    const [testingSmtp, setTestingSmtp] = useState(false);
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
        admin_post_no_review: 0,
        enable_llm: 0,
        enable_llm_article_review: 0,
        enable_llm_create_article: 0,
        global_head_code: '',
        content_head_code: '',
        footer_code: '',
        enable_image_compression: 1,
        image_compression_threads: 5,
        proxy_resource_download: 0
    });

    const [uploadQueue, setUploadQueue] = useState([]);

    const [message, setMessage] = useState({ type: '', content: '' });
    const [testEmail, setTestEmail] = useState('');
    const [llmConfig, setLlmConfig] = useState({
        api_key: '',
        api_url: '',
        model: ''
    });
    const [loadingLlmConfig, setLoadingLlmConfig] = useState(false);
    const [savingLlmConfig, setSavingLlmConfig] = useState(false);
    const [llmConfigExpanded, setLlmConfigExpanded] = useState(false);
    const [promptModal, setPromptModal] = useState({
        show: false,
        promptName: '',
        promptContent: '',
        loading: false,
        saving: false
    });
    const [clearingCache, setClearingCache] = useState(false);
    const [selectedCacheKeys, setSelectedCacheKeys] = useState([]);

    const tabs = [
        { id: 'basic', name: '站点信息' },
        { id: 'media', name: '媒体设置' },
        { id: 'music', name: '音乐配置' },
        { id: 'filing', name: '备案信息' },
        { id: 'user', name: '用户权限' },
        { id: 'notification', name: '通知服务' },
        { id: 'llm', name: '大模型配置' },
        { id: 'extension', name: '扩展设置' },
        { id: 'codeinjection', name: '代码注入' },
        { id: 'cache', name: '缓存管理' }
    ];

    useEffect(() => {
        Promise.all([
            fetchSiteConfig(),
            fetchRoles(),
            fetchArticleStatusOptions(),
            fetchMusics(),
            fetchLlmConfig()
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
                    global_head_code: escapeHtml(response.data.global_head_code) || '',
                    content_head_code: escapeHtml(response.data.content_head_code) || '',
                    footer_code: escapeHtml(response.data.footer_code) || '',
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
                    admin_post_no_review: response.data.admin_post_no_review !== undefined ? response.data.admin_post_no_review : 0,
                    enable_llm: response.data.enable_llm !== undefined ? response.data.enable_llm : 0,
                    enable_llm_article_review: response.data.enable_llm_article_review !== undefined ? response.data.enable_llm_article_review : 0,
                    enable_llm_create_article: response.data.enable_llm_create_article !== undefined ? response.data.enable_llm_create_article : 0,
                    enable_image_compression: response.data.enable_image_compression != null ? response.data.enable_image_compression : 0,
                    image_compression_threads: response.data.image_compression_threads != null ? response.data.image_compression_threads : 5,
                    proxy_resource_download: response.data.proxy_resource_download != null ? response.data.proxy_resource_download : 0
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

    const fetchLlmConfig = async () => {
        try {
            setLoadingLlmConfig(true);
            const response = await apiClient.get('/llm/config');

            if (response.code === 200) {
                setLlmConfig({
                    api_key: response.data.api_key || '',
                    api_url: response.data.api_url || '',
                    model: response.data.model || ''
                });
            } else {
                showMessage('error', response.message || '获取LLM配置失败');
            }
        } catch (error) {
            console.error('获取LLM配置失败:', error);
            showMessage('error', '获取LLM配置时发生错误');
        } finally {
            setLoadingLlmConfig(false);
        }
    };

    const handleLlmConfigChange = (e) => {
        const { name, value } = e.target;
        setLlmConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveLlmConfig = async () => {
        if (!llmConfig.api_url.trim()) {
            showMessage('error', 'API地址不能为空');
            return;
        }
        if (!llmConfig.model.trim()) {
            showMessage('error', '模型名称不能为空');
            return;
        }

        try {
            setSavingLlmConfig(true);
            const response = await apiClient.post('/llm/config', llmConfig);

            if (response.code === 200) {
                showMessage('success', response.message || 'LLM配置保存成功');
                fetchLlmConfig();
            } else {
                showMessage('error', response.message || 'LLM配置保存失败');
            }
        } catch (error) {
            console.error('保存LLM配置失败:', error);
            showMessage('error', '保存LLM配置时发生错误');
        } finally {
            setSavingLlmConfig(false);
        }
    };

    const openPromptModal = async (promptName) => {
        try {
            setPromptModal(prev => ({ ...prev, show: true, promptName, loading: true }));
            const response = await apiClient.get(`/llm/prompt/${promptName}`);
            
            if (response.code === 200) {
                setPromptModal(prev => ({
                    ...prev,
                    promptContent: response.data.prompt_content || '',
                    loading: false
                }));
            } else {
                showMessage('error', response.message || '获取提示词失败');
                setPromptModal(prev => ({ ...prev, show: false, loading: false }));
            }
        } catch (error) {
            console.error('获取提示词失败:', error);
            showMessage('error', '获取提示词时发生错误');
            setPromptModal(prev => ({ ...prev, show: false, loading: false }));
        }
    };

    const closePromptModal = () => {
        setPromptModal({
            show: false,
            promptName: '',
            promptContent: '',
            loading: false,
            saving: false
        });
    };

    const savePrompt = async () => {
        if (!promptModal.promptContent.trim()) {
            showMessage('error', '提示词内容不能为空');
            return;
        }

        try {
            setPromptModal(prev => ({ ...prev, saving: true }));
            const response = await apiClient.put(`/llm/prompt/${promptModal.promptName}`, {
                prompt_content: promptModal.promptContent
            });

            if (response.code === 200) {
                showMessage('success', response.message || '提示词更新成功');
                closePromptModal();
            } else {
                showMessage('error', response.message || '提示词更新失败');
            }
        } catch (error) {
            console.error('保存提示词失败:', error);
            showMessage('error', '保存提示词时发生错误');
        } finally {
            setPromptModal(prev => ({ ...prev, saving: false }));
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

    const parseFileName = (fileName) => {
        const base = fileName.replace(/\.[^.]+$/, '');
        const match = base.match(/^(.+?)\s*[-–—]\s*(.+)$/);
        if (match) return { musicAuthor: match[1].trim(), musicName: match[2].trim() };
        return { musicAuthor: '', musicName: base };
    };

    const handleAudioUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const audioFiles = files.filter(f => f.type.startsWith('audio/'));
        const invalidCount = files.length - audioFiles.length;
        if (invalidCount > 0) showMessage('error', `已跳过 ${invalidCount} 个非音频文件`);
        if (!audioFiles.length) return;

        const newItems = audioFiles.map((file, i) => ({
            id: Date.now() + i,
            file,
            ...parseFileName(file.name),
            musicUrl: '',
            status: 'uploading'
        }));

        setUploadQueue(prev => [...prev, ...newItems]);

        await Promise.all(newItems.map(async (item) => {
            try {
                const url = await uploadAudioFile(item.file);
                setUploadQueue(prev => prev.map(q =>
                    q.id === item.id ? { ...q, musicUrl: url, status: 'done' } : q
                ));
            } catch (err) {
                setUploadQueue(prev => prev.map(q =>
                    q.id === item.id ? { ...q, status: 'error' } : q
                ));
            }
        }));

        if (audioFileInputRef.current) audioFileInputRef.current.value = '';
    };

    const addAllQueuedMusic = async () => {
        const readyItems = uploadQueue.filter(q => q.status === 'done' && q.musicName && q.musicAuthor && q.musicUrl);
        if (!readyItems.length) {
            showMessage('error', '没有可添加的音乐（请确认上传完成且填写了曲名和歌手名）');
            return;
        }
        try {
            await Promise.all(readyItems.map(item =>
                apiClient.post('/music/add', {
                    musicName: item.musicName,
                    musicAuthor: item.musicAuthor,
                    musicUrl: item.musicUrl
                })
            ));
            showMessage('success', `成功添加 ${readyItems.length} 首音乐`);
            setUploadQueue([]);
            fetchMusics();
        } catch (error) {
            showMessage('error', '部分音乐添加失败');
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

    const handleSmtpTest = async () => {
        if (!testEmail.trim()) {
            showMessage('error', '请输入测试收件邮箱');
            return;
        }
        try {
            setTestingSmtp(true);
            const response = await apiClient.post('/site/test-smtp', {
                email: testEmail.trim()
            });
            if (response.success) {
                showMessage('success', response.message || '测试邮件已发送，请检查收件箱');
            } else {
                showMessage('error', response.message || '测试邮件发送失败');
            }
        } catch (error) {
            console.error('SMTP测试失败:', error);
            const errorMessage = error?.response?.data?.message || '测试邮件发送时发生错误';
            showMessage('error', errorMessage);
        } finally {
            setTestingSmtp(false);
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
                global_head_code: unescapeHtml(formData.global_head_code),
                content_head_code: unescapeHtml(formData.content_head_code),
                footer_code: unescapeHtml(formData.footer_code),
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
                admin_post_no_review: formData.admin_post_no_review,
                enable_llm: formData.enable_llm,
                enable_llm_article_review: formData.enable_llm_article_review,
                enable_llm_create_article: formData.enable_llm_create_article,
                enable_image_compression: formData.enable_image_compression,
                image_compression_threads: parseInt(formData.image_compression_threads, 10),
                proxy_resource_download: formData.proxy_resource_download
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

    const cacheOptions = [
        { key: 'dimstack:site_config', label: '站点配置缓存' },
        { key: 'dimstack:article:', label: '所有文章缓存', isPrefix: true },
        { key: 'dimstack:user:blacklist', label: '用户黑名单缓存' },
        { key: 'dimstack:hot_articles', label: '热门文章缓存' },
        { key: 'dimstack:sitemap:articles', label: '站点地图文章缓存' },
        { key: 'dimstack:sitemap:categories', label: '站点地图分类缓存' },
        { key: 'dimstack:llm_config', label: 'LLM配置缓存' },
        { key: 'dimstack:sitemap:tags', label: '站点地图标签缓存' }
    ];

    const handleCacheKeyToggle = (key) => {
        setSelectedCacheKeys(prev => 
            prev.includes(key) 
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const handleSelectAllCache = () => {
        if (selectedCacheKeys.length === cacheOptions.length) {
            setSelectedCacheKeys([]);
        } else {
            setSelectedCacheKeys(cacheOptions.map(opt => opt.key));
        }
    };

    const handleClearSelectedCache = async () => {
        if (selectedCacheKeys.length === 0) {
            showMessage('error', '请至少选择一个缓存项');
            return;
        }

        try {
            setClearingCache(true);
            
            const keysToClear = selectedCacheKeys.map(key => {
                const option = cacheOptions.find(opt => opt.key === key);
                return option && option.isPrefix ? key : key;
            });
            
            const response = await apiClient.post('/cache/clear/batch', {
                keys: keysToClear
            });

            if (response.success || response.code === 200) {
                showMessage('success', `成功清除 ${response.data?.count || selectedCacheKeys.length} 个缓存`);
                setSelectedCacheKeys([]);
            } else {
                showMessage('error', response.message || '清除缓存失败');
            }
        } catch (error) {
            console.error('清除缓存失败:', error);
            showMessage('error', '清除缓存时发生错误');
        } finally {
            setClearingCache(false);
        }
    };

    const handleClearAllCache = async () => {
        if (!window.confirm('确定要清除所有缓存吗？')) {
            return;
        }

        try {
            setClearingCache(true);
            const response = await apiClient.post('/cache/clear/all');

            if (response.success || response.code === 200) {
                showMessage('success', `成功清除 ${response.data?.count || 7} 个缓存`);
                setSelectedCacheKeys([]);
            } else {
                showMessage('error', response.message || '清除缓存失败');
            }
        } catch (error) {
            console.error('清除所有缓存失败:', error);
            showMessage('error', '清除缓存时发生错误');
        } finally {
            setClearingCache(false);
        }
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
                                                e.target.src = '/image_error.svg';
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
                                                e.target.src = '/image_error.svg';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <div>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.enable_image_compression === 1}
                                            onChange={(e) => {
                                                setFormData(prev => ({ ...prev, enable_image_compression: e.target.checked ? 1 : 0 }));
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">启用图片压缩</span>
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        启用后，首次访问图片时将自动压缩并保存，后续访问优先返回压缩版本以提升加载速度
                                    </p>
                                </div>
                            </div>

                            {formData.enable_image_compression === 1 && (
                                <div className="border-t border-gray-200 pt-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">压缩处理线程数</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.image_compression_threads}
                                            onChange={(e) => {
                                                const value = Math.max(1, parseInt(e.target.value, 10) || 1);
                                                setFormData(prev => ({ ...prev, image_compression_threads: value }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            同时处理的图片数量，建议根据服务器实际CPU核心数和内存大小设置（推荐4-8），默认5
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-6">
                                <div>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.proxy_resource_download === 1}
                                            onChange={(e) => {
                                                setFormData(prev => ({ ...prev, proxy_resource_download: e.target.checked ? 1 : 0 }));
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">启用外部资源代理下载</span>
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        启用后，Markdown编辑器可一键将外部图片、视频、音频下载到本地服务器并替换为本地链接
                                    </p>
                                </div>
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

                                <div
                                    onClick={() => audioFileInputRef.current?.click()}
                                    className="music-upload-zone border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                >
                                    <svg className="mx-auto mb-2 w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                                    </svg>
                                    <p className="text-sm text-gray-600">点击选择音频文件</p>
                                    <p className="text-xs text-gray-400 mt-1">支持一次选择多个文件 · 自动识别歌手名</p>
                                    <p className="text-xs text-gray-400">文件名格式：歌手 - 曲名.mp3</p>
                                    <input
                                        type="file"
                                        ref={audioFileInputRef}
                                        accept="audio/*"
                                        multiple
                                        onChange={handleAudioUpload}
                                        className="hidden"
                                    />
                                </div>

                                {uploadQueue.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        {uploadQueue.map(item => (
                                            <div
                                                key={item.id}
                                                className={`music-queue-item flex items-center gap-3 p-3 rounded-lg border ${
                                                    item.status === 'uploading' ? 'border-blue-200 bg-blue-50 music-queue-uploading' :
                                                        item.status === 'done'      ? 'border-green-200 bg-green-50 music-queue-done' :
                                                            item.status === 'error'     ? 'border-red-200 bg-red-50 music-queue-error' :
                                                                'border-gray-200 bg-white music-queue-pending'
                                                }`}
                                            >
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        value={item.musicName}
                                                        placeholder="曲名"
                                                        onChange={e => setUploadQueue(prev => prev.map(q =>
                                                            q.id === item.id ? { ...q, musicName: e.target.value } : q
                                                        ))}
                                                        className="music-queue-input px-2 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={item.musicAuthor}
                                                        placeholder="歌手名"
                                                        onChange={e => setUploadQueue(prev => prev.map(q =>
                                                            q.id === item.id ? { ...q, musicAuthor: e.target.value } : q
                                                        ))}
                                                        className="music-queue-input px-2 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={item.musicUrl}
                                                        placeholder="上传后自动填充"
                                                        disabled={item.status === 'uploading'}
                                                        onChange={e => setUploadQueue(prev => prev.map(q =>
                                                            q.id === item.id ? { ...q, musicUrl: e.target.value } : q
                                                        ))}
                                                        className="music-queue-input sm:col-span-2 px-2 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-60"
                                                    />
                                                </div>

                                                <div className="flex flex-col items-center gap-1 min-w-[52px]">
                                                    {item.status === 'uploading' && (
                                                        <>
                                                            <div className="music-spinner w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                                                            <span className="text-xs text-blue-600 music-status-uploading">上传中</span>
                                                        </>
                                                    )}
                                                    {item.status === 'done' && (
                                                        <>
                                                            <svg className="w-5 h-5 text-green-600 music-status-done-icon" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                            </svg>
                                                            <span className="text-xs text-green-600 music-status-done">完成</span>
                                                        </>
                                                    )}
                                                    {item.status === 'error' && (
                                                        <>
                                                            <svg className="w-5 h-5 text-red-500 music-status-error-icon" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                                            </svg>
                                                            <span className="text-xs text-red-500 music-status-error">失败</span>
                                                        </>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setUploadQueue(prev => prev.filter(q => q.id !== item.id))}
                                                        className="music-remove-btn text-xs text-gray-400 hover:text-red-500 mt-1"
                                                    >
                                                        移除
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addAllQueuedMusic}
                                            disabled={!uploadQueue.some(q => q.status === 'done')}
                                            className="mt-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            全部加入曲库（{uploadQueue.filter(q => q.status === 'done').length} 首就绪）
                                        </button>
                                    </div>
                                )}
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
                                        {/* 移动端卡片 */}
                                        <div className="block md:hidden space-y-4">
                                            {musics.filter(music => music.status === 1).map((music) => (
                                                <div key={music.id} className="music-list-card border border-gray-200 bg-white rounded-lg p-4 space-y-3">
                                                    <div>
                                                        <label className="text-xs text-gray-500 block mb-1">曲名</label>
                                                        {editingMusic && editingMusic.id === music.id ? (
                                                            <input
                                                                type="text"
                                                                value={editingMusic.musicName}
                                                                onChange={(e) => setEditingMusic(prev => ({ ...prev, musicName: e.target.value }))}
                                                                className="music-edit-input w-full px-2 py-1 border border-gray-300 bg-white text-gray-900 rounded text-sm"
                                                            />
                                                        ) : (
                                                            <div className="font-medium text-gray-900 music-list-name">{music.musicName}</div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="text-xs text-gray-500 block mb-1">歌手</label>
                                                        {editingMusic && editingMusic.id === music.id ? (
                                                            <input
                                                                type="text"
                                                                value={editingMusic.musicAuthor}
                                                                onChange={(e) => setEditingMusic(prev => ({ ...prev, musicAuthor: e.target.value }))}
                                                                className="music-edit-input w-full px-2 py-1 border border-gray-300 bg-white text-gray-900 rounded text-sm"
                                                            />
                                                        ) : (
                                                            <div className="text-sm text-gray-700 music-list-author">{music.musicAuthor}</div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="text-xs text-gray-500 block mb-1">音乐地址</label>
                                                        {editingMusic && editingMusic.id === music.id ? (
                                                            <input
                                                                type="text"
                                                                value={editingMusic.musicUrl}
                                                                onChange={(e) => setEditingMusic(prev => ({ ...prev, musicUrl: e.target.value }))}
                                                                className="music-edit-input w-full px-2 py-1 border border-gray-300 bg-white text-gray-900 rounded text-sm"
                                                            />
                                                        ) : (
                                                            <div className="text-sm text-blue-600 break-all music-list-url">{music.musicUrl}</div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 music-list-card-footer">
                                                        <span className="text-xs text-green-600 font-medium music-status-enabled">启用</span>
                                                        <div className="flex gap-2">
                                                            {editingMusic && editingMusic.id === music.id ? (
                                                                <>
                                                                    <button type="button" onClick={saveEditMusic} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">保存</button>
                                                                    <button type="button" onClick={cancelEditMusic} className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">取消</button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button type="button" onClick={() => startEditMusic(music)} className="px-3 py-1 text-blue-600 text-sm hover:bg-blue-50 rounded music-btn-edit">编辑</button>
                                                                    <button type="button" onClick={() => deleteMusic(music.id)} className="px-3 py-1 text-red-600 text-sm hover:bg-red-50 rounded music-btn-delete">删除</button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 桌面端表格 */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 music-table">
                                                <thead className="bg-gray-50 music-table-head">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">曲名</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">歌手</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">音乐地址</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200 music-table-body">
                                                {musics.filter(music => music.status === 1).map((music) => (
                                                    <tr key={music.id} className="music-table-row">
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-900 music-table-cell">
                                                            {editingMusic && editingMusic.id === music.id ? (
                                                                <input type="text" value={editingMusic.musicName} onChange={(e) => setEditingMusic(prev => ({ ...prev, musicName: e.target.value }))} className="music-edit-input w-full px-2 py-1 border border-gray-300 bg-white text-gray-900 rounded" />
                                                            ) : music.musicName}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-900 music-table-cell">
                                                            {editingMusic && editingMusic.id === music.id ? (
                                                                <input type="text" value={editingMusic.musicAuthor} onChange={(e) => setEditingMusic(prev => ({ ...prev, musicAuthor: e.target.value }))} className="music-edit-input w-full px-2 py-1 border border-gray-300 bg-white text-gray-900 rounded" />
                                                            ) : music.musicAuthor}
                                                        </td>
                                                        <td className="px-4 py-3 music-table-cell">
                                                            {editingMusic && editingMusic.id === music.id ? (
                                                                <input type="text" value={editingMusic.musicUrl} onChange={(e) => setEditingMusic(prev => ({ ...prev, musicUrl: e.target.value }))} className="music-edit-input w-full px-2 py-1 border border-gray-300 bg-white text-gray-900 rounded" />
                                                            ) : (
                                                                <div className="max-w-xs truncate text-blue-600 music-list-url">{music.musicUrl}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap music-table-cell">
                                                            <span className="font-medium text-green-600 music-status-enabled">启用</span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap music-table-cell">
                                                            {editingMusic && editingMusic.id === music.id ? (
                                                                <div className="flex gap-2">
                                                                    <button type="button" onClick={saveEditMusic} className="text-green-600 hover:text-green-900 music-btn-save-text">保存</button>
                                                                    <button type="button" onClick={cancelEditMusic} className="text-gray-600 hover:text-gray-900 music-btn-cancel-text">取消</button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <button type="button" onClick={() => startEditMusic(music)} className="text-blue-600 hover:text-blue-900 music-btn-edit">编辑</button>
                                                                    <button type="button" onClick={() => deleteMusic(music.id)} className="text-red-600 hover:text-red-900 music-btn-delete-text">删除</button>
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

                                <div className="md:col-span-2 border-t pt-4">
                                    <div className="flex flex-col md:flex-row md:items-end gap-3">
                                        <div className="flex-1">
                                            <label htmlFor="test_email" className="block text-sm font-medium text-gray-700 mb-1">
                                                测试收件邮箱
                                            </label>
                                            <input
                                                type="email"
                                                id="test_email"
                                                name="test_email"
                                                value={testEmail}
                                                onChange={(e) => setTestEmail(e.target.value)}
                                                placeholder="请输入用于接收测试邮件的邮箱"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSmtpTest}
                                            disabled={testingSmtp}
                                            className={`px-4 py-2 rounded-md text-white font-medium ${testingSmtp ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                        >
                                            {testingSmtp ? '测试发送中...' : '测试SMTP配置'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 大模型配置 */}
                    {activeTab === 'llm' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        启用大模型接入
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            id="enable_llm"
                                            name="enable_llm"
                                            type="checkbox"
                                            checked={formData.enable_llm === 1}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    enable_llm: e.target.checked ? 1 : 0
                                                }));
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="enable_llm" className="ml-2 block text-sm text-gray-700">
                                            启用系统大模型功能
                                        </label>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        总开关，关闭后所有大模型相关功能将不可用
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        文章自动审核
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            id="enable_llm_article_review"
                                            name="enable_llm_article_review"
                                            type="checkbox"
                                            checked={formData.enable_llm_article_review === 1}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    enable_llm_article_review: e.target.checked ? 1 : 0
                                                }));
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="enable_llm_article_review" className="ml-2 block text-sm text-gray-700">
                                            启用大模型自动审核文章
                                        </label>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        用户上传文章后，自动使用AI进行内容审核
                                        {formData.enable_llm_article_review === 1 && (
                                            <button
                                                type="button"
                                                onClick={() => openPromptModal('article_review')}
                                                className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                            >
                                                查看&修改提示词
                                            </button>
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        AI文章生成
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            id="enable_llm_create_article"
                                            name="enable_llm_create_article"
                                            type="checkbox"
                                            checked={formData.enable_llm_create_article === 1}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    enable_llm_create_article: e.target.checked ? 1 : 0
                                                }));
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="enable_llm_create_article" className="ml-2 block text-sm text-gray-700">
                                            启用大模型生成文章
                                        </label>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        允许用户使用AI辅助创作和生成文章内容
                                        {formData.enable_llm_create_article === 1 && (
                                            <button
                                                type="button"
                                                onClick={() => openPromptModal('article_create')}
                                                className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                            >
                                                查看&修改提示词
                                            </button>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setLlmConfigExpanded(!llmConfigExpanded)}
                                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-3 rounded-lg transition-colors"
                                >
                                    <h4 className="text-base font-semibold text-gray-900">LLM详细配置</h4>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transform transition-transform ${llmConfigExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {llmConfigExpanded && (
                                    <div className="mt-4 space-y-4">
                                        {loadingLlmConfig ? (
                                            <div className="flex justify-center items-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <label htmlFor="api_key" className="block text-sm font-medium text-gray-700 mb-1">
                                                        API密钥
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="api_key"
                                                        name="api_key"
                                                        value={llmConfig.api_key}
                                                        onChange={handleLlmConfigChange}
                                                        placeholder="留空表示不修改，首次配置时必填"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        已配置的密钥不会显示，如需修改请输入新密钥
                                                    </p>
                                                </div>

                                                <div>
                                                    <label htmlFor="api_url" className="block text-sm font-medium text-gray-700 mb-1">
                                                        API地址
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="api_url"
                                                        name="api_url"
                                                        value={llmConfig.api_url}
                                                        onChange={handleLlmConfigChange}
                                                        placeholder="例如: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                                                        模型名称
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="model"
                                                        name="model"
                                                        value={llmConfig.model}
                                                        onChange={handleLlmConfigChange}
                                                        placeholder="例如: qwen3.6-plus"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveLlmConfig}
                                                        disabled={savingLlmConfig}
                                                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-wait flex items-center gap-2"
                                                    >
                                                        {savingLlmConfig ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                <span>保存中...</span>
                                                            </>
                                                        ) : (
                                                            <span>保存LLM配置</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
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

                    {activeTab === 'codeinjection' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-3 rounded-md">
                                <p className="text-sm text-blue-700">
                                    <strong>说明：</strong>以下配置项支持输入HTML代码，可用于注入统计代码、SEO标签、自定义脚本等内容
                                </p>
                            </div>

                            <div>
                                <label htmlFor="global_head_code" className="block text-sm font-medium text-gray-700 mb-1">
                                    全局 Head 标签
                                </label>
                                <textarea
                                    id="global_head_code"
                                    name="global_head_code"
                                    value={unescapeHtml(formData.global_head_code)}
                                    onChange={handleInputChange}
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    placeholder="注入代码到所有页面的 head 标签部分，例如统计代码、SEO标签等"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    提示：可以输入HTML代码，将注入到所有页面的 &lt;head&gt; 标签中
                                </p>
                            </div>

                            <div>
                                <label htmlFor="content_head_code" className="block text-sm font-medium text-gray-700 mb-1">
                                    内容页 Head 标签
                                </label>
                                <textarea
                                    id="content_head_code"
                                    name="content_head_code"
                                    value={unescapeHtml(formData.content_head_code)}
                                    onChange={handleInputChange}
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    placeholder="注入代码到文章页面和自定义页面的 head 标签部分"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    提示：可以输入HTML代码，将注入到文章页面和自定义页面的 &lt;head&gt; 标签中
                                </p>
                            </div>

                            <div>
                                <label htmlFor="footer_code" className="block text-sm font-medium text-gray-700 mb-1">
                                    页脚
                                </label>
                                <textarea
                                    id="footer_code"
                                    name="footer_code"
                                    value={unescapeHtml(formData.footer_code)}
                                    onChange={handleInputChange}
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    placeholder="注入代码到所有页面的页脚部分，例如备案信息、自定义脚本等"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    提示：可以输入HTML代码，将注入到所有页面的页脚部分
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cache' && (
                        <div className="space-y-6">

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-medium text-gray-700">选择要清除的缓存<strong>（实验性功能）</strong></h4>
                                    <button
                                        type="button"
                                        onClick={handleSelectAllCache}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        {selectedCacheKeys.length === cacheOptions.length ? '取消全选' : '全选'}
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {cacheOptions.map((option) => (
                                        <label key={option.key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCacheKeys.includes(option.key)}
                                                onChange={() => handleCacheKeyToggle(option.key)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{option.label}</span>
                                            <span className="text-xs text-gray-400 font-mono ml-auto">{option.key}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClearSelectedCache}
                                    disabled={clearingCache || selectedCacheKeys.length === 0}
                                    className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {clearingCache ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>清除中...</span>
                                        </>
                                    ) : (
                                        <span>清除选中缓存 ({selectedCacheKeys.length})</span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearAllCache}
                                    disabled={clearingCache}
                                    className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {clearingCache ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>清除中...</span>
                                        </>
                                    ) : (
                                        <span>清除所有缓存</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {activeTab !== 'cache' && (
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
                )}
            </form>

            {/* 提示词编辑模态框 */}
            {promptModal.show && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {promptModal.promptName === 'article_review' ? '文章审核提示词' : '文章生成提示词'}
                            </h3>
                            <button
                                type="button"
                                onClick={closePromptModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {promptModal.loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        提示词内容
                                    </label>
                                    <textarea
                                        value={promptModal.promptContent}
                                        onChange={(e) => setPromptModal(prev => ({ ...prev, promptContent: e.target.value }))}
                                        rows={20}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder="请输入提示词内容..."
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        提示词将直接影响AI的输出质量，请谨慎修改
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                type="button"
                                onClick={closePromptModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                取消
                            </button>
                            <button
                                type="button"
                                onClick={savePrompt}
                                disabled={promptModal.saving || promptModal.loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {promptModal.saving ? (
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
            )}
        </div>
    );
}