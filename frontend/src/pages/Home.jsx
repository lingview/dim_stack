import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';
import CategorySidebar from '../components/CategorySidebar';
import RecommendedArticles from '../components/RecommendedArticles';
import { fetchArticles, fetchArticlesByCategory } from '../Api.jsx';
import apiClient from '../utils/axios';

export default function Home() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [copyright, setCopyright] = useState('© 2025 次元栈 - Dim Stack. All rights reserved.');
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        loadArticles();
        loadCopyright();
    }, [page, selectedCategory]);

    const loadArticles = async () => {
        try {
            setLoading(true);
            let result;

            if (selectedCategory) {
                // 加载指定分类的文章
                result = await fetchArticlesByCategory(selectedCategory, page, 6);
            } else {
                // 加载所有文章
                result = await fetchArticles(page, 6);
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
            if (response) {
                setCopyright(response);
            }
        } catch (error) {
            console.error('加载版权信息失败:', error);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setPage(1);
    };

    const handleClearCategory = () => {
        setSelectedCategory(null);
        setPage(1);
    };

    return (
        <div className="flex bg-gray-50 flex-col min-h-screen">
            <Header />
            <div className="pt-20 flex-grow">
                <Hero />

                <main className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* 主内容区 */}
                        <div className="lg:w-2/3">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900 transition-colors duration-200 dark:text-white">
                                        {selectedCategory ? `${selectedCategory} 分类文章` : '最新文章'}
                                    </h2>
                                    {selectedCategory && (
                                        <button
                                            onClick={handleClearCategory}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            清除筛选
                                        </button>
                                    )}
                                </div>

                                {loading ? (
                                    <div>加载中...</div>
                                ) : articles.length > 0 ? (
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {articles.map((article) => (
                                            <ArticleCard key={article.id} article={article} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
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

                        {/* 侧边栏 */}
                        <div className="lg:w-1/3">
                            <div className="sticky top-28">
                                <CategorySidebar onCategorySelect={handleCategoryChange} selectedCategory={selectedCategory} />
                                <RecommendedArticles />
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="bg-white mt-auto transition-colors duration-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-gray-600 transition-colors duration-200">
                        <p>{copyright}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
