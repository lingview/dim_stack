import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';
import CategorySidebar from '../components/CategorySidebar';
import TagSidebar from '../components/TagSidebar';
import RecommendedArticles from '../components/RecommendedArticles';
import MusicPlayer from '../components/MusicPlayer';
import { fetchArticles, fetchArticlesByCategory } from '../Api.jsx';
import apiClient from '../utils/axios';

export default function Home() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [copyright, setCopyright] = useState('');
    const [icpRecord, setIcpRecord] = useState('');
    const [mpsRecord, setMpsRecord] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);
    const [showImages, setShowImages] = useState(true);
    const [forceMobile, setForceMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 676;
        }
        return false;
    });

    const articleListRef = useRef(null);
    const { categoryName, tagName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const savedShowImages = localStorage.getItem('showImages');
        if (savedShowImages !== null) {
            setShowImages(JSON.parse(savedShowImages));
        }
    }, []);

    useEffect(() => {
        loadArticlesFromUrl();
        loadCopyright();
        loadSiteRecords();
    }, [location.pathname, page]);

    useEffect(() => {
        localStorage.setItem('showImages', JSON.stringify(showImages));
    }, [showImages]);

    useEffect(() => {
        if (!articleListRef.current) return;

        const checkWidth = () => {
            if (!articleListRef.current) return;
            const width = articleListRef.current.offsetWidth;
            const canFitTwoColumns = width >= 676;
            setForceMobile(!canFitTwoColumns);
        };

        checkWidth();

        const ro = new ResizeObserver(() => {
            checkWidth();
        });

        ro.observe(articleListRef.current);
        return () => ro.disconnect();
    }, [articles]);

    const loadArticlesFromUrl = async () => {
        try {
            setLoading(true);
            let result;

            if (categoryName) {
                result = await fetchArticlesByCategory(categoryName, page, 6);
                setSelectedCategory(categoryName);
                setSelectedTag(null);
            } else if (tagName) {
                result = await apiClient.get(`/tags/${tagName}/articles?page=${page}&size=6`);
                setSelectedTag(tagName);
                setSelectedCategory(null);
            } else {
                result = await fetchArticles(page, 6);
                setSelectedCategory(null);
                setSelectedTag(null);
            }

            setArticles(result.data);
            setTotalPages(result.total_pages);
        } catch (error) {
            console.error('加载文章失败:', error);
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

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setSelectedTag(null);
        setPage(1);
        navigate(`/category/${category}`);
    };

    const handleTagChange = (tag) => {
        setSelectedTag(tag);
        setSelectedCategory(null);
        setPage(1);
        navigate(`/tag/${tag}`);
    };

    const handleClearFilter = () => {
        navigate('/');
        setSelectedCategory(null);
        setSelectedTag(null);
        setPage(1);
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

            <div className="pt-20 flex-grow">
                <Hero />

                <main className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-7/10">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {getCurrentFilterTitle()}
                                    </h2>

                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={toggleImageDisplay}
                                            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            {showImages ? '隐藏图片' : '显示图片'}
                                        </button>

                                        {(categoryName || tagName) && (
                                            <button
                                                onClick={handleClearFilter}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                清除筛选
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="text-center py-12 text-gray-500">加载中...</div>
                                ) : articles.length > 0 ? (
                                    <div
                                        ref={articleListRef}
                                        className={`
                                            gap-4
                                            ${forceMobile ? 'flex flex-col w-full' : 'grid justify-start grid-cols-[repeat(auto-fill,330px)]'}
                                        `}
                                    >
                                        {articles.map(article => (
                                            <ArticleCard
                                                key={article.id}
                                                article={article}
                                                showImage={showImages}
                                                forceMobile={forceMobile}
                                                onCategoryClick={handleCategoryChange}
                                                onTagClick={handleTagChange}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        暂无文章
                                    </div>
                                )}

                                {/* 分页控件 */}
                                <div className="flex justify-center mt-8 pagination-container">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50 pagination-button pagination-prev-next"
                                    >
                                        上一页
                                    </button>

                                    <span className="px-4 py-2 mx-1 pagination-info">
                                        {page} / {totalPages}
                                    </span>

                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50 pagination-button pagination-prev-next"
                                    >
                                        下一页
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-3/10">
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

            <MusicPlayer />
            <footer className="bg-white mt-auto transition-colors duration-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-gray-600 transition-colors duration-200">
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
                    </div>
                </div>
            </footer>
        </div>
    );
}