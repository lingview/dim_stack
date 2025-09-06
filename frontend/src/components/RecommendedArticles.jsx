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
            setHotArticles(response);
            setError(null);
        } catch (err) {
            console.error('获取热门文章失败:', err);
            setError('获取热门文章失败');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 transition-colors duration-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">热门文章</h3>
                <div className="space-y-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 transition-colors duration-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">热门文章</h3>
                <div className="text-red-500 text-center py-4">
                    {error}
                    <button
                        onClick={fetchHotArticles}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                        重新加载
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 transition-colors duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">热门文章</h3>
            <ul className="space-y-4">
                {hotArticles.map((article) => (
                    <li key={article.id}>
                        <a
                            href={`/article/${article.alias}`}
                            className="block hover:bg-gray-50 p-3 rounded transition-all duration-200"
                        >
                            <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                            <p className="text-sm text-gray-500">
                                {article.date ? new Date(article.date).toLocaleDateString() : ''}
                            </p>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
