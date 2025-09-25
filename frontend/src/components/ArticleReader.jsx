import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConfig } from '../utils/config';
import apiClient from '../utils/axios';
import Header from './Header';
import CategorySidebar from './CategorySidebar';
import RecommendedArticles from './RecommendedArticles';
import ArticlePreview from './ArticlePreview.jsx';
import CommentSection from './CommentSection.jsx';

export default function ArticleReader() {
    const { articleId } = useParams();
    const [article, setArticle] = useState(null);
    const [needPassword, setNeedPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getFullImageUrl = (url) => {
        if (!url) return null;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        try {
            const config = getConfig();
            return config.getFullUrl(url);
        } catch (error) {
            if (url.startsWith('/')) {
                return url;
            }
            return `/upload/${url}`;
        }
    };

    useEffect(() => {
        checkPasswordRequirement();
    }, [articleId]);

    const checkPasswordRequirement = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/article/${articleId}/check-password`);
            if (response.success) {
                setNeedPassword(response.needPassword);
                if (response.needPassword) {
                    setShowPasswordInput(true);
                } else {
                    fetchArticleContent();
                }
            } else {
                setError(response.message || '检查文章密码失败');
            }
        } catch (err) {
            setError('检查文章密码失败');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchArticleContent = async (inputPassword = null) => {
        try {
            setLoading(true);
            const params = inputPassword ? { password: inputPassword } : {};
            const response = await apiClient.get(`/article/${articleId}`, { params });

            if (response.success) {
                setArticle(response.data);
                setShowPasswordInput(false);
                setError('');
            } else {
                setError(response.message || '获取文章内容失败');
                if (response.message === '文章密码错误') {
                    setShowPasswordInput(true);
                }
            }
        } catch (err) {
            setError('获取文章内容失败');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        fetchArticleContent(password);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 ">
                <Header />
                <div className="pt-20 container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600 ">加载中...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-20 container mx-auto px-4 py-8">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 ">
            <Header />
            <div className="pt-20">
                {showPasswordInput ? (
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-md mx-auto mt-10">
                            <form onSubmit={handlePasswordSubmit} className="bg-white  shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700  text-sm font-bold mb-2" htmlFor="password">
                                        此文章需要密码访问
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="请输入文章密码"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    >
                                        提交
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : article ? (
                    <div className="relative">
                        {/* 文章封面 */}
                        {article.article_cover && (
                            <div className="relative w-full -mt-8 mb-8">
                                <div className="h-96 w-full overflow-hidden">
                                    <img
                                        src={getFullImageUrl(article.article_cover)}
                                        alt={article.article_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/image_error.svg';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
                                </div>
                            </div>
                        )}

                        <main className="container mx-auto px-4 py-8">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="lg:w-2/3">
                                    <div className={article.article_cover ? "-mt-20 relative z-10" : ""}>
                                        {/* 文章阅读器组件 */}
                                        <ArticlePreview article={article} />

                                        {/* 评论区组件 */}
                                        <CommentSection articleAlias={article.alias} />
                                    </div>
                                </div>

                                {/* 侧边栏 */}
                                <div className="lg:w-1/3">
                                    <div className="sticky top-28">
                                        <CategorySidebar />
                                        <RecommendedArticles />
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
