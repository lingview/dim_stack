import React, { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import Header from './Header';
import Hero from './Hero';
import CategorySidebar from './CategorySidebar';
import TagSidebar from './TagSidebar';
import RecommendedArticles from './RecommendedArticles';
import MusicPlayer from "./MusicPlayer.jsx";

const FriendLinks = () => {
    const [friendLinks, setFriendLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [formData, setFormData] = useState({
        siteName: '',
        siteUrl: '',
        siteIcon: '',
        siteDescription: '',
        webmasterName: '',
        contact: ''
    });
    const [message, setMessage] = useState({ type: '', content: '' });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 12;

    const [isFetchingIcon, setIsFetchingIcon] = useState(false);
    const [iconLoadError, setIconLoadError] = useState(false);

    useEffect(() => {
        loadFriendLinks();
    }, [currentPage]);

    const fetchSiteIcon = async (siteUrl) => {
        if (!siteUrl) return '';

        try {
            setIsFetchingIcon(true);

            let validUrl;
            try {
                validUrl = new URL(siteUrl);
            } catch (e) {
                showMessage('error', '请输入有效的网站URL');
                return '';
            }

            const origin = validUrl.origin;

            const proxyUrl = `/proxy/favicon?url=${encodeURIComponent(`${origin}/favicon.ico`)}`;

            try {
                const response = await apiClient.get(proxyUrl);
                if (response) {
                    return `${origin}/favicon.ico`;
                }
            } catch (error) {
                console.error('主图标获取失败:', error);
            }

            const commonPaths = [
                '/favicon.png',
                '/apple-touch-icon.png',
                '/apple-touch-icon-precomposed.png'
            ];

            for (const path of commonPaths) {
                try {
                    const proxyPathUrl = `/proxy/favicon?url=${encodeURIComponent(origin + path)}`;
                    const res = await apiClient.get(proxyPathUrl);
                    if (res) {
                        return origin + path;
                    }
                } catch (err) {
                    console.error(`路径 ${path} 获取失败:`, err);
                    continue;
                }
            }

            return '';
        } catch (error) {
            console.error('获取网站图标失败:', error);
            return '';
        } finally {
            setIsFetchingIcon(false);
        }
    };

    useEffect(() => {
        if (formData.siteIcon) {
            setIconLoadError(false);
        }
    }, [formData.siteIcon]);

    const loadFriendLinks = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/friend-links/approved/page', {
                params: {
                    page: currentPage,
                    size: pageSize
                }
            });

            console.log('FriendLinks API Response:', response);

            if (response.success && response.data) {
                const data = response.data;
                setFriendLinks(data.data || []);
                setTotalItems(data.total || 0);
                setTotalPages(data.total_pages || 0);
            } else {
                setFriendLinks([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('加载友链失败:', error);
            setFriendLinks([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/friend-links/apply', formData);
            if (response.success) {
                showMessage('success', response.message);
                setFormData({
                    siteName: '',
                    siteUrl: '',
                    siteIcon: '',
                    siteDescription: '',
                    webmasterName: '',
                    contact: ''
                });
                setShowApplyForm(false);
                setCurrentPage(1);
            } else {
                showMessage('error', response.message);
            }
        } catch (error) {
            console.error('申请友链失败:', error);
            showMessage('error', '申请友链失败，请稍后再试');
        }
    };

    const showMessage = (type, content) => {
        setMessage({ type, content });
        setTimeout(() => setMessage({ type: '', content: '' }), 3000);
    };

    const getFullImageUrl = (url) => {
        if (!url) return '/default-icon.png';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return url;
        return `/upload/${url}`;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    return (
        <div className="min-h-screen">
            <Header />

            <div className="pt-20">
                <Hero />

                <div className="py-8">
                    <main className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-8">

                            <div className="lg:w-2/3">
                                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all">

                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-semibold text-gray-800">
                                            友情链接
                                        </h2>

                                        <button
                                            onClick={() => setShowApplyForm(!showApplyForm)}
                                            className="
                                                px-4 py-2 text-sm font-medium rounded-lg
                                                bg-blue-500
                                                text-white
                                                shadow-sm
                                                hover:bg-blue-600
                                                hover:shadow-md
                                                active:scale-95
                                                transition-all duration-200
                                            "
                                        >
                                            {showApplyForm ? '取消申请' : '申请友链'}
                                        </button>

                                    </div>

                                    {message.content && (
                                        <div
                                            className={`
                                                mb-6 p-4 rounded-xl border
                                                ${message.type === 'success'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }
                                            `}
                                        >
                                            {message.content}
                                        </div>
                                    )}

                                    {showApplyForm && (
                                        <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">申请友链</h3>

                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {[
                                                        { id: 'siteName', label: '站点名称 *', type: 'text', required: true },
                                                        {
                                                            id: 'siteUrl',
                                                            label: '站点 URL *',
                                                            type: 'url',
                                                            required: true,
                                                            placeholder: 'https://example.com',
                                                            actionButton: (
                                                                <button
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        if (!formData.siteUrl) {
                                                                            showMessage('error', '请先输入站点URL');
                                                                            return;
                                                                        }
                                                                        const iconUrl = await fetchSiteIcon(formData.siteUrl);
                                                                        if (iconUrl) {
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                siteIcon: iconUrl
                                                                            }));
                                                                            showMessage('success', '网站图标获取成功');
                                                                        } else {
                                                                            showMessage('error', '未能找到网站图标，请手动填写url地址');
                                                                        }
                                                                    }}
                                                                    disabled={!formData.siteUrl || isFetchingIcon}
                                                                    className="ml-2 px-3 py-2 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {isFetchingIcon ? '获取中...' : '获取图标'}
                                                                </button>
                                                            )
                                                        },
                                                        {
                                                            id: 'siteIcon',
                                                            label: '站点图标 URL',
                                                            type: 'url'
                                                        },
                                                        { id: 'webmasterName', label: '站长名称 *', type: 'text', required: true },
                                                    ].map((item) => (
                                                        <div key={item.id} className="relative">
                                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                                {item.label}
                                                            </label>
                                                            {item.description && (
                                                                <p className="text-xs text-gray-500 mb-1">{item.description}</p>
                                                            )}
                                                            <div className="flex">
                                                                <input
                                                                    type={item.type}
                                                                    id={item.id}
                                                                    name={item.id}
                                                                    required={item.required}
                                                                    placeholder={item.placeholder}
                                                                    value={formData[item.id]}
                                                                    onChange={handleInputChange}
                                                                    className="flex-1 px-3 py-2 rounded-l-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                                />
                                                                {item.actionButton}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {formData.siteIcon && !iconLoadError && (
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                                图标预览
                                                            </label>
                                                            <div className="flex items-center gap-4">
                                                                <img
                                                                    src={formData.siteIcon}
                                                                    alt="站点图标预览"
                                                                    className="w-12 h-12 rounded-lg object-contain bg-gray-100 border"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        setIconLoadError(true);
                                                                    }}
                                                                    onLoad={() => setIconLoadError(false)}
                                                                />
                                                                <span className="text-sm text-gray-600 break-all max-w-xs">
                                                                    {formData.siteIcon}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {formData.siteIcon && iconLoadError && (
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                                图标预览
                                                            </label>
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-lg bg-gray-100 border flex items-center justify-center">
                                                                    <span className="text-xs text-gray-500">!</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-red-500">图标加载失败</span>
                                                                    <p className="text-xs text-gray-500">URL: {formData.siteIcon}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                                            联系方式 *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="contact"
                                                            value={formData.contact}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                                            站点介绍 *
                                                        </label>
                                                        <textarea
                                                            name="siteDescription"
                                                            rows={3}
                                                            value={formData.siteDescription}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        className="px-6 py-2 font-semibold text-white rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform shadow"
                                                    >
                                                        提交申请
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {loading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    ) : friendLinks.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {friendLinks.map(link => (
                                                    <a
                                                        key={link.id}
                                                        href={link.siteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group block p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={getFullImageUrl(link.siteIcon)}
                                                                alt={link.siteName}
                                                                className="w-12 h-12 rounded-lg object-cover bg-gray-100 border"
                                                                onError={(e) => e.target.src = '/default-icon.png'}
                                                            />
                                                            <div>
                                                                <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                                                                    {link.siteName}
                                                                </h4>
                                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                                    {link.siteDescription}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>

                                            {totalPages > 1 && (
                                                <div className="flex justify-center items-center mt-8 gap-3">
                                                    <button
                                                        disabled={currentPage === 1}
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        上一页
                                                    </button>

                                                    <span className="text-gray-600 text-sm">
                                                        第 {currentPage} 页 / 共 {totalPages} 页（{totalItems} 条）
                                                    </span>

                                                    <button
                                                        disabled={currentPage === totalPages}
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        下一页
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-500 py-10">
                                            暂无友链
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lg:w-1/3">
                                <div className="sticky top-28 space-y-6">
                                    <CategorySidebar />
                                    <TagSidebar />
                                    <RecommendedArticles />
                                </div>
                            </div>

                        </div>
                    </main>
                </div>
            </div>
            <MusicPlayer />
        </div>
    );
};

export default FriendLinks;
