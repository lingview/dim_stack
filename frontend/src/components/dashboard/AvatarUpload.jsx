import React, { useState } from 'react';
import apiClient from '../../utils/axios.jsx';

const getFullImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    try {
        if (url.startsWith('/')) {
            return url;
        }
        return `/upload/${url}`;
    } catch (error) {
        if (url.startsWith('/')) {
            return url;
        }
        return `/upload/${url}`;
    }
};

export default function AvatarUpload({ currentAvatar, onAvatarUpdate }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(getFullImageUrl(currentAvatar) || '');
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('请选择有效的图片文件 (JPG, JPEG, PNG, GIF, WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('文件大小不能超过5MB');
            return;
        }

        setError('');

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        await uploadAvatar(file);
    };

    const uploadAvatar = async (file) => {
        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/uploadavatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response && response.fileUrl) {
                const fullUrl = getFullImageUrl(response.fileUrl);
                onAvatarUpdate(fullUrl);
                setPreview(fullUrl);
            } else {
                setError('头像上传失败');
            }
        } catch (err) {
            console.error('头像上传错误:', err);
            setError('头像上传失败: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <img
                    src={preview || '/image_error.svg'}
                    alt="头像预览"
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                />
                {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            <label className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                {uploading ? '上传中...' : '选择头像'}
                <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </label>

            {error && (
                <div className="mt-2 text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="mt-2 text-gray-500 text-sm">
                支持 JPG, JPEG, PNG, GIF, WebP 格式，最大5MB
            </div>
        </div>
    );
}
