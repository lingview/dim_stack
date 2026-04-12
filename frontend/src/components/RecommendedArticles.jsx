import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';

export default function RecommendedArticles() {
    const [hotArticles, setHotArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBottomGradient, setShowBottomGradient] = useState(false);
    const [showTopGradient, setShowTopGradient] = useState(false);
    const listRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHotArticles();
    }, []);

    useEffect(() => {
        const el = listRef.current;
        if (!el) return;

        const checkScroll = () => {
            const canScroll = el.scrollHeight > el.clientHeight;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
            const atTop = el.scrollTop <= 4;
            setShowBottomGradient(canScroll && !atBottom);
            setShowTopGradient(canScroll && !atTop);
        };

        checkScroll();
        el.addEventListener('scroll', checkScroll);
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);

        return () => {
            el.removeEventListener('scroll', checkScroll);
            ro.disconnect();
        };
    }, [hotArticles]);

    const fetchHotArticles = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/hot/articles');

            const articles = Array.isArray(response.data) ? response.data : response;
            setHotArticles(articles);
            setError(null);
        } catch (err) {
            console.error('获取热门文章失败:', err);
            setError('加载热门文章失败');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">热门文章</h3>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-start space-x-3">
                            <div className="h-10 w-10 bg-gray-200 rounded-md flex-shrink-0"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="flex space-x-4 text-xs text-gray-400">
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">热门文章</h3>
                <div className="text-red-500 text-sm text-center py-4">
                    {error}
                    <button
                        onClick={fetchHotArticles}
                        className="ml-2 text-blue-500 hover:text-blue-700 font-medium"
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">热门文章</h3>
            <div className="relative">
                <div
                    className="category-fade-mask-top absolute top-0 left-0 right-0 h-10 pointer-events-none transition-opacity duration-300 z-10"
                    style={{ opacity: showTopGradient ? 1 : 0 }}
                />

                <ul
                    ref={listRef}
                    className="hide-scrollbar space-y-3 max-h-80 overflow-y-auto pr-2"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {hotArticles.length === 0 ? (
                        <li className="text-gray-500 text-sm text-center py-4">
                            暂无热门文章
                        </li>
                    ) : (
                        hotArticles.map((article) => (
                            <li key={article.id} className="group">
                                <button
                                    onClick={() => navigate(`/article/${article.alias}`, { state: { needPassword: article.password } })}
                                    className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 ease-in-out"
                                >
                                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 break-words">
                                        {article.title}
                                    </h4>
                                    <div className="flex items-center mt-2 text-xs text-gray-500 overflow-hidden">
                                        <div className="flex items-center flex-1 min-w-0 space-x-2">
                                            <span className="whitespace-nowrap truncate" title={new Date(article.date).toLocaleDateString()}>
                                                {new Date(article.date).toLocaleDateString()}
                                            </span>
                                            <span className="flex-shrink-0">•</span>
                                            <span className="truncate min-w-0" title={article.author || '未知作者'}>
                                                {article.author || '未知作者'}
                                            </span>
                                        </div>
                                        <div className="flex items-center flex-shrink-0 ml-2">
                                            <div className="w-4 flex-shrink-0 mr-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-3 w-3"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            </div>
                                            <span>{formatViews(article.page_views)}</span>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))
                    )}
                </ul>

                <div
                    className="category-fade-mask-bottom absolute bottom-0 left-0 right-0 h-10 pointer-events-none transition-opacity duration-300"
                    style={{ opacity: showBottomGradient ? 1 : 0 }}
                />
            </div>
        </div>
    );
}

function formatViews(views) {
    if (views >= 1000) {
        return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return views;
}