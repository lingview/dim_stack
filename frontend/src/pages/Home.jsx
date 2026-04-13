import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';
import CategorySidebar from '../components/CategorySidebar';
import TagSidebar from '../components/TagSidebar';
import RecommendedArticles from '../components/RecommendedArticles';

import { fetchArticles } from '../Api.jsx';
import apiClient from '../utils/axios';

export default function Home() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [copyright, setCopyright] = useState('');
    const [icpRecord, setIcpRecord] = useState('');
    const [mpsRecord, setMpsRecord] = useState('');
    const [showImages, setShowImages] = useState(true);
    const [globalHeadCode, setGlobalHeadCode] = useState('');
    const [footerCode, setFooterCode] = useState('');
    const [forceMobile, setForceMobile] = useState(() => {
        if (typeof window !== 'undefined') return window.innerWidth < 768;
        return false;
    });

    const [searchParams] = useSearchParams();
    const { tagName } = useParams();
    const categoryName = searchParams.get('name');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkMobile = () => setForceMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const savedShowImages = localStorage.getItem('showImages');
        if (savedShowImages !== null) {
            setShowImages(JSON.parse(savedShowImages));
        }
    }, []);

    useEffect(() => {
        setPage(1);
    }, [location.search, location.pathname, tagName]);

    useEffect(() => {
        loadArticlesFromUrl();
        loadCopyright();
        loadSiteRecords();
        loadCodeInjection();
    }, [location.search, location.pathname, page, tagName]);

    useEffect(() => {
        localStorage.setItem('showImages', JSON.stringify(showImages));
    }, [showImages]);

    const loadArticlesFromUrl = async () => {
        try {
            setLoading(true);
            let result;

            if (categoryName) {
                result = await apiClient.get(`/categories/articles?category=${encodeURIComponent(categoryName)}&page=${page}&size=6`);
            } else if (tagName) {
                result = await apiClient.get(`/tags/${tagName}/articles?page=${page}&size=6`);
            } else {
                result = await fetchArticles(page, 6);
            }

            setArticles(Array.isArray(result.data) ? result.data : []);
            setTotalPages(result.total_pages || 1);
        } catch (error) {
            console.error('加载文章失败:', error);
            setArticles([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const loadCopyright = async () => {
        try {
            const response = await apiClient.get('/site/copyright');
            if (response) setCopyright(response);
        } catch (error) {
            console.error('加载版权信息失败:', error);
        }
    };

    const loadSiteRecords = async () => {
        try {
            const icpResponse = await apiClient.get('/site/icp-record');
            if (icpResponse) setIcpRecord(icpResponse);

            const mpsResponse = await apiClient.get('/site/mps-record');
            if (mpsResponse) setMpsRecord(mpsResponse);
        } catch (error) {
            console.error('加载备案信息失败:', error);
        }
    };

    const loadCodeInjection = async () => {
        try {
            const globalHeadResponse = await apiClient.get('/site/global-head-code');
            if (globalHeadResponse?.data?.globalHeadCode) {
                setGlobalHeadCode(globalHeadResponse.data.globalHeadCode);
            }

            const footerResponse = await apiClient.get('/site/footer-code');
            if (footerResponse?.data?.footerCode) {
                setFooterCode(footerResponse.data.footerCode);
            }
        } catch (error) {
            console.error('加载代码注入配置失败:', error);
        }
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

    const handleCategoryChange = (category) => {
        navigate(`/category?name=${encodeURIComponent(category)}`);
    };

    const handleTagChange = (tag) => {
        navigate(`/tag/${tag}`);
    };

    const handleClearFilter = () => {
        navigate('/');
    };

    const toggleImageDisplay = () => {
        setShowImages(!showImages);
    };

    const getCurrentFilterTitle = () => {
        if (categoryName) return `${categoryName} 分类文章`;
        if (tagName) return `${tagName} 标签文章`;
        return '最新文章';
    };

    return (
        <div className="flex bg-gray-50 flex-col min-h-screen">
            <Header />

            <div className="pt-20 grow">
                <Hero />

                <main className="max-w-310 mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-6 filter-header-border">
                                <h2 className="text-2xl font-bold text-gray-900 filter-title">
                                    {getCurrentFilterTitle()}
                                </h2>

                                <div className="flex items-center space-x-4">
                                    <div
                                        className="hidden md:flex items-center cursor-pointer group"
                                        onClick={toggleImageDisplay}
                                    >
                        <span className="mr-3 text-sm font-medium text-gray-600 switch-label select-none">
                            {showImages ? '显示图片' : '隐藏图片'}
                        </span>

                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={showImages}
                                                readOnly
                                            />
                                            <div className={`
                                w-11 h-6 rounded-full transition-all duration-300 border
                                ${showImages ? 'bg-blue-500 border-blue-600' : 'bg-gray-200 border-gray-300 dark-switch-bg'}
                            `}></div>
                                            <div className={`
                                absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300
                                ${showImages ? 'translate-x-5' : 'translate-x-0'}
                            `}></div>
                                        </div>
                                    </div>

                                    {(categoryName || tagName) && (
                                        <button
                                            onClick={handleClearFilter}
                                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            清除筛选
                                        </button>
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-12 text-gray-500">加载中...</div>
                            ) : articles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {articles.map(article => (
                                        <div key={article.id} className="w-full flex justify-center">
                                            <ArticleCard
                                                article={article}
                                                showImage={showImages}
                                                forceMobile={forceMobile}
                                                onCategoryClick={handleCategoryChange}
                                                onTagClick={handleTagChange}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    暂无文章
                                </div>
                            )}
                            <div className="flex justify-center mt-12 pagination-container">
                                <button
                                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                                    disabled={page === 1}
                                    className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50 pagination-button"
                                >
                                    上一页
                                </button>
                                <span className="px-4 py-2 mx-1 pagination-info text-gray-600">
                    {page} / {totalPages}
                </span>
                                <button
                                    onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50 pagination-button"
                                >
                                    下一页
                                </button>
                            </div>
                        </div>

                        <div className="lg:w-77.5 shrink-0">
                            <div className="sticky top-28 space-y-4">
                                <CategorySidebar
                                    onCategorySelect={handleCategoryChange}
                                    selectedCategory={categoryName}
                                />
                                <TagSidebar selectedTag={tagName} />
                                <RecommendedArticles />
                            </div>
                        </div>
                    </div>
                </main>
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
}