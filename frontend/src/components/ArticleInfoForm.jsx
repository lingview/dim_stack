import { useState, useEffect, useRef } from 'react';
import apiClient from '../utils/axios';
import { getConfig } from '../utils/config';

export default function ArticleInfoForm({ articleData, onSave, onCancel, uploading }) {
    const [formData, setFormData] = useState({
        title: articleData?.title || '',
        cover: articleData?.cover || '',
        tags: articleData?.tags || '',
        category: articleData?.category || '',
        alias: articleData?.alias || '',
        password: articleData?.password || ''
    });

    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [coverUploading, setCoverUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchTagsAndCategories();
    }, []);

    const fetchTagsAndCategories = async () => {
        try {
            const [tagsRes, categoriesRes] = await Promise.all([
                apiClient.get('/tags'),
                apiClient.get('/categories')
            ]);

            setTags(Array.isArray(tagsRes) ? tagsRes : []);
            setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        } catch (error) {
            console.error('获取标签或分类失败:', error);
            setTags([]);
            setCategories([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCoverUpload = async (file) => {
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('仅支持 JPG、PNG、GIF、WebP 格式的图片');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('封面图片大小不能超过 5MB');
            return;
        }

        setCoverUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const response = await apiClient.post('/uploadattachment', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData(prev => ({
                ...prev,
                cover: response.fileUrl || ''
            }));
        } catch (error) {
            console.error('封面上传失败:', error);
            alert('封面上传失败: ' + (error.response?.data?.error || error.message));
        } finally {
            setCoverUploading(false);
        }
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleCoverUpload(file);
        }
        e.target.value = '';
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            alert('请输入文章标题');
            return;
        }

        if (!formData.category) {
            alert('请选择文章分类');
            return;
        }

        onSave({
            ...articleData,
            title: formData.title,
            cover: formData.cover,
            tags: formData.tags,
            category: formData.category,
            alias: formData.alias,
            password: formData.password
        });
    };

    const getFullImageUrl = (url) => {
        if (!url) return '';

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        const config = getConfig();
        return config.getFullUrl(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            {/* 稍稍模糊一些的遮罩 */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onCancel}
            ></div>


            <div
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden z-10 transform transition-all sm:my-8 sm:w-full sm:max-w-lg pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 article-header-bg px-6 py-4 border-b border-gray-200 dark:border-gray-700"
                >
                    <h2 className="text-2xl font-bold text-gray-800 article-header-title">文章信息设置</h2>
                    <p className="text-gray-600 article-header-subtitle text-sm mt-1">请填写文章的基本信息</p>
                </div>



                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                文章标题 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="请输入文章标题"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                文章封面
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    name="cover"
                                    value={formData.cover}
                                    onChange={handleInputChange}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="请输入封面图片URL或上传图片"
                                />
                                <button
                                    onClick={handleFileSelect}
                                    disabled={coverUploading}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition flex items-center"
                                >
                                    {coverUploading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            上传中...
                                        </>
                                    ) : '上传'}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            {formData.cover && (
                                <div className="mt-3">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">封面预览:</div>
                                    <div className="flex items-center">
                                        <img
                                            src={getFullImageUrl(formData.cover)}
                                            alt="封面预览"
                                            className="h-20 w-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+5byg5bCP5LqLPC90ZXh0Pjwvc3ZnPg==';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                文章分类 <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">请选择分类</option>
                                {categories.map(category => (
                                    <option
                                        key={category.id || category.article_categories}
                                        value={category.article_categories || category}
                                        className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                                    >
                                        {category.article_categories || category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                文章标签
                            </label>
                            <select
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">请选择标签</option>
                                {tags.map(tag => (
                                    <option
                                        key={tag.id || tag.tag_name}
                                        value={tag.tag_name || tag}
                                        className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                                    >
                                        {tag.tag_name || tag}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                文章别名
                            </label>
                            <input
                                type="text"
                                name="alias"
                                value={formData.alias}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="用于生成文章访问链接，如不填写将自动生成"
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                只能包含字母、数字、连字符(-)和下划线(_)，用于生成文章的访问链接
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                文章密码
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="请输入文章访问密码，留空则无需密码"
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                设置密码后，用户需要输入密码才能访问文章内容
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        disabled={uploading}
                        className="px-5 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 transition"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                保存中...
                            </>
                        ) : '保存文章'}
                    </button>
                </div>
            </div>
        </div>
    );
}
