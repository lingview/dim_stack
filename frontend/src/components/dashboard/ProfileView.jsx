import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import { getConfig } from '../../utils/config';

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

export default function ProfileView() {
    const [user, setUser] = useState({
        uuid: '',
        username: '',
        avatar: '',
        phone: '',
        email: '',
        gender: '',
        birthday: '',
        password: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [previewAvatar, setPreviewAvatar] = useState('/default-avatar.png');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const statusResponse = await apiClient.get('/user/status');
            if (statusResponse.code === 200 && statusResponse.data.loggedIn) {
                const uuidResponse = await apiClient.get(`/user/uuid?username=${statusResponse.data.username}`);
                if (uuidResponse && uuidResponse.uuid) {
                    const profileResponse = await apiClient.get(`/user/${uuidResponse.uuid}`);
                    if (profileResponse) {
                        const birthdayFormatted = profileResponse.birthday
                            ? profileResponse.birthday.substring(0, 10)
                            : '';

                        const processedAvatar = profileResponse.avatar
                            ? getFullImageUrl(profileResponse.avatar)
                            : '/default-avatar.png';

                        // 对从服务器获取的用户数据进行转义处理
                        setUser({
                            uuid: profileResponse.uuid || '',
                            username: escapeHtml(profileResponse.username) || '',
                            avatar: profileResponse.avatar || '',
                            phone: escapeHtml(profileResponse.phone) || '',
                            email: escapeHtml(profileResponse.email) || '',
                            gender: escapeHtml(profileResponse.gender) || '',
                            birthday: birthdayFormatted,
                        });

                        setPreviewAvatar(processedAvatar || '/default-avatar.png');
                    }
                }
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            showMessage('获取用户信息失败', 'error');
            setPreviewAvatar('/default-avatar.png');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // 密码字段不需要转义
        if (name === 'password') {
            setUser(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            const escapedValue = escapeHtml(value);
            setUser(prev => ({
                ...prev,
                [name]: escapedValue
            }));
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showMessage('请选择有效的图片文件 (JPG, JPEG, PNG, GIF, WebP)', 'error');
            return;
        }

        // 验证文件大小(最大5MB)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('文件大小不能超过5MB', 'error');
            return;
        }

        // 创建预览
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewAvatar(e.target.result);
        };
        reader.readAsDataURL(file);

        // 上传文件
        await uploadAvatar(file);
    };

    const uploadAvatar = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/uploadavatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response && response.fileUrl) {
                setUser(prev => ({
                    ...prev,
                    avatar: response.fileUrl
                }));

                const processedAvatar = getFullImageUrl(response.fileUrl);
                setPreviewAvatar(processedAvatar || '/default-avatar.png');
                showMessage('头像上传成功', 'success');
            } else {
                showMessage('头像上传失败', 'error');
                const currentAvatar = user.avatar
                    ? getFullImageUrl(user.avatar)
                    : '/default-avatar.png';
                setPreviewAvatar(currentAvatar);
            }
        } catch (err) {
            console.error('头像上传错误:', err);
            showMessage('头像上传失败: ' + (err.response?.data?.error || err.message), 'error');
            const currentAvatar = user.avatar
                ? getFullImageUrl(user.avatar)
                : '/default-avatar.png';
            setPreviewAvatar(currentAvatar);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const updateData = {
                uuid: user.uuid,
                username: unescapeHtml(user.username),
                avatar: user.avatar,
                phone: unescapeHtml(user.phone),
                email: unescapeHtml(user.email),
                gender: unescapeHtml(user.gender),
                birthday: user.birthday,
                password: user.password
            };

            const response = await apiClient.put('/user/update', updateData);

            if (response) {
                showMessage('个人信息更新成功', 'success');
                setUser(prev => ({
                    ...prev,
                    password: ''
                }));
            } else {
                showMessage('更新失败', 'error');
            }
        } catch (error) {
            console.error('更新用户信息失败:', error);
            showMessage('更新用户信息失败: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setSaving(false);
        }
    };

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 3000);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">加载中...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">个人中心</h2>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            用户名
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={unescapeHtml(user.username)}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入用户名"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            头像
                        </label>
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <img
                                    src={previewAvatar}
                                    alt="头像预览"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                                    onError={(e) => {
                                        e.target.src = '/default-avatar.png';
                                    }}
                                />
                            </div>


                            <div>
                                <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                                    选择图片
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                                <p className="mt-2 text-gray-500 text-xs">
                                    支持 JPG, JPEG, PNG, GIF, WebP 格式，最大5MB
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            新密码
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={user.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入新密码"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            邮箱
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={unescapeHtml(user.email)}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入邮箱"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            手机号
                        </label>
                        {/* 显示时进行反转义 */}
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={unescapeHtml(user.phone)}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入手机号"
                        />
                    </div>

                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                            性别
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={unescapeHtml(user.gender)}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">请选择性别</option>
                            <option value="male">男</option>
                            <option value="female">女</option>
                            <option value="other">其他</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                            生日
                        </label>
                        <input
                            type="date"
                            id="birthday"
                            name="birthday"
                            value={user.birthday}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {saving ? '保存中...' : '保存更改'}
                    </button>
                </div>
            </form>
        </div>
    );
}
