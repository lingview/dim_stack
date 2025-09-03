import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';
import CategorySidebar from '../components/CategorySidebar';
import RecommendedArticles from '../components/RecommendedArticles';
import { fakeData } from '../Api.jsx';
import { fetchArticles } from '../Api.jsx';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadArticles();
  }, [page]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const result = await fetchArticles(page, 6); // 每页6篇文章
      setArticles(result.data);
      setTotalPages(result.total_pages);
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      <Header />
      <Hero />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 主内容区 */}
          <div className="lg:w-2/3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 transition-colors duration-200 dark:text-white">
                最新文章
              </h2>

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
            <div className="sticky top-8">
              <CategorySidebar />
              <RecommendedArticles />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 transition-colors duration-200">
            <p>{fakeData.siteInfo.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
