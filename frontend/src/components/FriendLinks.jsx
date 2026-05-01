import React, { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import Header from './Header';
import Hero from './Hero';
import CategorySidebar from './CategorySidebar';
import TagSidebar from './TagSidebar';
import RecommendedArticles from './RecommendedArticles';

const FriendLinks = () => {
    const [friendLinks, setFriendLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [siteInfo, setSiteInfo] = useState(null);
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
    const [globalHeadCode, setGlobalHeadCode] = useState('');
    const [footerCode, setFooterCode] = useState('');
    const [copyright, setCopyright] = useState('');
    const [icpRecord, setIcpRecord] = useState('');
    const [mpsRecord, setMpsRecord] = useState('');

    useEffect(() => {
        loadFriendLinks();
        loadSiteInfo();
        loadSiteFriendLinkInfo();
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

    const loadSiteInfo = async () => {
        try {
            const globalHeadResponse = await apiClient.get('/site/global-head-code');
            if (globalHeadResponse?.data?.globalHeadCode) {
                setGlobalHeadCode(globalHeadResponse.data.globalHeadCode);
            }

            const footerResponse = await apiClient.get('/site/footer-code');
            if (footerResponse?.data?.footerCode) {
                setFooterCode(footerResponse.data.footerCode);
            }

            const copyrightResponse = await apiClient.get('/site/copyright');
            if (copyrightResponse) setCopyright(copyrightResponse);

            const icpResponse = await apiClient.get('/site/icp-record');
            if (icpResponse) setIcpRecord(icpResponse);

            const mpsResponse = await apiClient.get('/site/mps-record');
            if (mpsResponse) setMpsRecord(mpsResponse);
        } catch (error) {
            console.error('加载站点信息失败:', error);
        }
    };

    const loadSiteFriendLinkInfo = async () => {
        try {
            const response = await apiClient.get('/friend-links/site-info');
            console.log('友链配置数据:', response);
            if (response?.success && response?.data) {
                setSiteInfo(response.data);
                console.log('设置 siteInfo:', response.data);
            }
        } catch (error) {
            console.error('加载本站友链信息失败:', error);
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
        if (!url) return '/image_error.svg';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return url;
        return `/upload/${url}`;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    useEffect(() => {
        if (globalHeadCode) {
            const container = document.createElement('div');
            container.innerHTML = globalHeadCode;
            
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                newScript.textContent = script.textContent;
                document.head.appendChild(newScript);
            });

            const styles = container.querySelectorAll('style');
            styles.forEach(style => {
                const newStyle = document.createElement('style');
                Array.from(style.attributes).forEach(attr => {
                    newStyle.setAttribute(attr.name, attr.value);
                });
                newStyle.textContent = style.textContent;
                document.head.appendChild(newStyle);
            });

            const otherElements = container.querySelectorAll(':not(script):not(style)');
            otherElements.forEach(element => {
                if (element.parentElement === container) {
                    document.head.appendChild(element.cloneNode(true));
                }
            });
        }
    }, [globalHeadCode]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <div className="pt-20 flex-grow">
                <Hero />

                <div className="py-8">
                    <main className="max-w-310 mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-6">

                            <div className="flex-1 min-w-0">
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
                                                                onError={(e) => e.target.src = '/image_error.svg'}
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

                                    {siteInfo && (
                                        <div className="mt-10 pt-8 border-t border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-6">本站信息</h3>
                                            <div className="group block p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            src={siteInfo.siteLogo || '/image_error.svg'}
                                                            alt={siteInfo.siteName}
                                                            className="w-20 h-20 rounded-xl object-contain bg-gray-50 border border-gray-200"
                                                            onError={(e) => e.target.src = '/image_error.svg'}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="mb-2">
                                                            <span className="text-sm font-medium text-gray-500">站点名称：</span>
                                                            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {siteInfo.siteName}
                                                            </span>
                                                        </div>
                                                        {siteInfo.description && (
                                                            <div className="mb-3">
                                                                <span className="text-sm font-medium text-gray-500">站点描述：</span>
                                                                <p className="text-gray-600 leading-relaxed inline">
                                                                    {siteInfo.description}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-500">站点地址：</span>
                                                            <a
                                                                href={siteInfo.siteUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium break-all ml-1"
                                                            >
                                                                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                                </svg>
                                                                <span className="break-all">{siteInfo.siteUrl}</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                                {siteInfo.applyRules && (
                                                    <div className="mt-5 pt-4 border-t border-gray-200">
                                                        <div className="flex items-start gap-2">
                                                            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700 mb-1">交换友链规则：</p>
                                                                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                                                    {siteInfo.applyRules}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lg:w-77.5 shrink-0">
                                <div className="sticky top-28 space-y-4">
                                    <CategorySidebar />
                                    <TagSidebar />
                                    <RecommendedArticles />
                                </div>
                            </div>

                        </div>
                    </main>
                </div>
            </div>

            <footer className="bg-white mt-auto">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-gray-600">
                        <p>{copyright}</p>
                        {icpRecord && (
                            <p className="mt-2">
                                <a
                                    href="https://beian.miit.gov.cn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-blue-600 text-sm"
                                >
                                    {icpRecord}
                                </a>
                            </p>
                        )}
                        {mpsRecord && (
                            <p className="mt-1">
                                <a
                                    href="http://www.beian.gov.cn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-blue-600 text-sm"
                                >
                                    {mpsRecord}
                                </a>
                            </p>
                        )}
                        {footerCode && (
                            <div dangerouslySetInnerHTML={{ __html: footerCode }} />
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FriendLinks;
