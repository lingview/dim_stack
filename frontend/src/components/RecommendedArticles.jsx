import React, { useEffect, useState } from 'react';
import apiClient from '../utils/axios';

export default function RecommendedArticles() {
    const [hotArticles, setHotArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHotArticles();
    }, []);

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
            <div className="bg-white rounded-xl shadow-sm p-6">
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
            <div className="bg-white rounded-xl shadow-sm p-6">
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
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">热门文章</h3>
            <ul className="space-y-3">
                {hotArticles.length === 0 ? (
                    <li className="text-gray-500 text-sm text-center py-4">
                        暂无热门文章
                    </li>
                ) : (
                    hotArticles.map((article) => (
                        <li key={article.id} className="group">
                            <a
                                href={`/article/${article.alias}`}
                                className="block p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 ease-in-out"
                            >
                                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                                    {article.title}
                                </h4>
                                <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                                    <span>{new Date(article.date).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{article.author || '未知作者'}</span>
                                    <span>•</span>
                                    <span className="flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
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
                                        {formatViews(article.page_views)}
                  </span>
                                </div>
                            </a>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

function formatViews(views) {
    if (views >= 1000) {
        return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return views;
}