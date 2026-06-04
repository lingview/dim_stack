import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';

import { fetchArticles } from '../Api.jsx';
import apiClient from '../utils/axios';

export default function ArticleList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { tagName } = useParams();
    const categoryName = searchParams.get('name');
    const pageParam = parseInt(searchParams.get('page')) || 1;
    const navigate = useNavigate();
    const location = useLocation();

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [showImages, setShowImages] = useState(true);
    const [forceMobile, setForceMobile] = useState(() => {
        if (typeof window !== 'undefined') return window.innerWidth < 768;
        return false;
    });

    const gridRef = useRef(null);
    const [holdHeight, setHoldHeight] = useState(null);

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
        loadArticlesFromUrl();
    }, [location.search, location.pathname, pageParam, tagName]);

    useEffect(() => {
        localStorage.setItem('showImages', JSON.stringify(showImages));
    }, [showImages]);

    const loadArticlesFromUrl = async () => {
        try {
            if (gridRef.current) {
                setHoldHeight(gridRef.current.offsetHeight);
            }
            setLoading(true);
            let result;

            if (categoryName) {
                result = await apiClient.get(`/categories/articles?category=${encodeURIComponent(categoryName)}&page=${pageParam}&size=6`);
            } else if (tagName) {
                result = await apiClient.get(`/tags/${tagName}/articles?page=${pageParam}&size=6`);
            } else {
                result = await fetchArticles(pageParam, 6);
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

    const handleCategoryChange = (category) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('name', category);
        newParams.delete('page');
        setSearchParams(newParams);
    };

    const handleTagChange = (tag) => {
        navigate(`/tag/${tag}`);
    };

    const handleClearFilter = () => {
        if (tagName) {
            navigate('/');
        } else {
            setSearchParams({});
        }
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
                <div
                    className="flex items-center justify-center text-gray-500"
                    style={{ minHeight: holdHeight ?? 600 }}
                >
                    加载中...
                </div>
            ) : articles.length > 0 ? (
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                    onClick={() => {
                        const newPage = Math.max(1, pageParam - 1);
                        const newParams = new URLSearchParams(searchParams);
                        if (newPage > 1) {
                            newParams.set('page', newPage);
                        } else {
                            newParams.delete('page');
                        }
                        setSearchParams(newParams);
                        // 根据真实使用发现还是不跳到最上面为好（）（）
                        // window.scrollTo(0, 0);
                    }}
                    disabled={pageParam === 1}
                    className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50 pagination-button"
                >
                    上一页
                </button>
                <span className="px-4 py-2 mx-1 pagination-info text-gray-600">
                    {pageParam} / {totalPages}
                </span>
                <button
                    onClick={() => {
                        const newPage = Math.min(totalPages, pageParam + 1);
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('page', newPage);
                        setSearchParams(newParams);
                        // 根据真实使用发现还是不跳到最上面为好（）（）
                        // window.scrollTo(0, 0);
                    }}
                    disabled={pageParam === totalPages}
                    className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50 pagination-button"
                >
                    下一页
                </button>
            </div>
        </div>
    );
}