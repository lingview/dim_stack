import Header from '../components/Header';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';
import CategorySidebar from '../components/CategorySidebar';
import RecommendedArticles from '../components/RecommendedArticles';
import { fakeData } from '../api';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 ">
      <Header />
      <Hero />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 主内容区 */}
          <div className="lg:w-2/3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold 0text-gray-90 mb-4 transition-colors duration-200 dark:text-white">最新文章</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {fakeData.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
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
          <div className="text-center text-gray-600 transition-colors duration-200 ">
            <p>© 2025 次元栈. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
