import { useState, useEffect, useRef } from 'react';
import apiClient from '../utils/axios';
import { getConfig } from '../utils/config';

export default function ArticleInfoForm({ articleData, onSave, onCancel, uploading }) {
    const [formData, setFormData] = useState({
        title: '',
        cover: '',
        excerpt: '',
        tags: [],
        category: '',
        alias: '',
        password: ''
    });

    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [coverUploading, setCoverUploading] = useState(false);
    const [hasOriginalPassword, setHasOriginalPassword] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchTagsAndCategories();
    }, []);

    useEffect(() => {
        if (articleData) {
            const hasPassword = articleData.password && articleData.password.trim() !== '';
            setHasOriginalPassword(hasPassword);

            let tagsData = articleData.tag || articleData.tags || [];
            if (typeof tagsData === 'string') {
                tagsData = tagsData ? tagsData.split(',').map(tag => tag.trim()) : [];
            }

            setFormData({
                title: articleData.article_name || articleData.title || '',
                cover: articleData.article_cover || articleData.cover || '',
                excerpt: articleData.excerpt || '',
                tags: tagsData,
                category: articleData.category || '',
                alias: articleData.alias || '',
                password: ''
            });
        }
    }, [articleData]);


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
        const { name, value, options, multiple } = e.target;
        let newValue = value;

        if (name === 'tags' && multiple) {
            newValue = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
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

        const saveData = {
            ...articleData,
            title: formData.title,
            cover: formData.cover,
            excerpt: formData.excerpt,
            tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags,
            category: formData.category,
            alias: formData.alias
        };

        if (formData.password && formData.password.trim() !== '') {
            saveData.password = formData.password;
        }

        onSave(saveData);
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
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onCancel}
            ></div>

            <div
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden z-10 transform transition-all sm:my-8 sm:w-full sm:max-w-lg pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 article-header-bg px-6 py-4 border-b border-gray-200 "
                >
                    <h2 className="text-2xl font-bold text-gray-800 article-header-title">
                        {articleData?.article_id ? '编辑文章' : '新建文章'}
                    </h2>
                    <p className="text-gray-600 article-header-subtitle text-sm mt-1">
                        {articleData?.article_id ? '修改文章信息' : '请填写文章的基本信息'}
                    </p>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700  mb-2">
                                文章标题 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white  text-gray-900 "
                                placeholder="请输入文章标题"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700  mb-2">
                                文章封面
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    name="cover"
                                    value={formData.cover}
                                    onChange={handleInputChange}
                                    className="flex-1 px-4 py-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white  text-gray-900"
                                    placeholder="请输入封面图片URL或上传图片"
                                />
                                <button
                                    onClick={handleFileSelect}
                                    disabled={coverUploading}
                                    className="px-4 py-2 bg-gray-100  text-gray-700  rounded-lg hover:bg-gray-200  disabled:opacity-50 transition flex items-center"
                                >
                                    {coverUploading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                    <div className="text-xs text-gray-500  mb-1">封面预览:</div>
                                    <div className="flex items-center">
                                        <img
                                            src={getFullImageUrl(formData.cover)}
                                            alt="封面预览"
                                            className="h-20 w-32 object-cover rounded-lg border border-gray-200  shadow-sm"
                                            onError={(e) => {
                                                e.target.src = '/image_error.svg';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                文章摘要
                            </label>
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white  text-gray-900 "
                                placeholder="请输入文章摘要，用于文章列表页显示和SEO优化"
                            />
                            <p className="mt-1 text-sm text-gray-500 ">
                                简要描述文章内容，建议控制在150字以内，用于文章列表页显示和SEO优化
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700  mb-2">
                                文章分类 <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white  text-gray-900 "
                            >
                                <option value="" className="text-gray-900  bg-white ">请选择分类</option>
                                {categories.map(category => (
                                    <option
                                        key={category.id || category.article_categories}
                                        value={category.article_categories || category}
                                        className="text-gray-900  bg-white "
                                    >
                                        {category.article_categories || category}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                文章标签
                            </label>
                            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg min-h-[40px] bg-white">
                                {tags.map(tag => {
                                    const tagValue = tag.tag_name || tag;
                                    const isSelected = Array.isArray(formData.tags) && formData.tags.includes(tagValue);
                                    return (
                                        <button
                                            key={tag.id || tagValue}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => {
                                                    const current = prev.tags || [];
                                                    if (current.includes(tagValue)) {
                                                        return {
                                                            ...prev,
                                                            tags: current.filter(t => t !== tagValue)
                                                        };
                                                    } else {
                                                        return {
                                                            ...prev,
                                                            tags: [...current, tagValue]
                                                        };
                                                    }
                                                });
                                            }}
                                            className={`px-3 py-1 text-sm rounded-full transition ${
                                                isSelected
                                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {tagValue}
                                        </button>
                                    );
                                })}
                                {tags.length === 0 && (
                                    <span className="text-gray-400 text-sm">暂无可用标签</span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                点击标签进行选择或取消
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700  mb-2">
                                文章别名
                            </label>
                            <input
                                type="text"
                                name="alias"
                                value={formData.alias}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white  text-gray-900 "
                                placeholder="用于生成文章访问链接，如不填写将自动生成"
                            />
                            <p className="mt-1 text-sm text-gray-500 ">
                                只能包含字母、数字、连字符(-)和下划线(_)，用于生成文章的访问链接
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700  mb-2">
                                文章密码
                                {hasOriginalPassword && (
                                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                        已设置密码
                                    </span>
                                )}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white  text-gray-900"
                                placeholder={
                                    articleData?.article_id
                                        ? hasOriginalPassword
                                            ? "留空保持原密码，输入新密码则更新"
                                            : "请输入文章访问密码，留空则无需密码"
                                        : "请输入文章访问密码，留空则无需密码"
                                }
                            />
                            <p className="mt-1 text-sm text-gray-500 ">
                                {articleData?.article_id
                                    ? hasOriginalPassword
                                        ? "当前文章已设置密码，留空则保持原密码不变，输入新密码则更新密码"
                                        : "当前文章无密码保护，输入密码可为文章设置访问密码"
                                    : "设置密码后，用户需要输入密码才能访问文章内容"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50  px-6 py-4 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        disabled={uploading}
                        className="px-5 py-2 text-gray-700  bg-white  border border-gray-300  rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
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
                        ) : (articleData?.article_id ? '更新文章' : '保存文章')}
                    </button>
                </div>
            </div>
        </div>
    );
}