import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getConfig } from '../utils/config';
import apiClient from '../utils/axios';
import Header from './Header';
import CategorySidebar from './CategorySidebar';
import RecommendedArticles from './RecommendedArticles';
import ArticlePreview from './ArticlePreview.jsx';
import CommentSection from './CommentSection.jsx';
import TagSidebar from "./TagSidebar.jsx";
import TableOfContents from './TableOfContents.jsx';

export default function ArticleReader() {
    const { articleId } = useParams();
    const location = useLocation();
    const [article, setArticle] = useState(null);
    const [needPassword, setNeedPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [globalHeadCode, setGlobalHeadCode] = useState('');
    const [contentHeadCode, setContentHeadCode] = useState('');
    const [footerCode, setFooterCode] = useState('');
    const [copyright, setCopyright] = useState('');
    const [icpRecord, setIcpRecord] = useState('');
    const [mpsRecord, setMpsRecord] = useState('');

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
        const needPwd = location.state?.needPassword;
        if (needPwd === true) {
            setNeedPassword(true);
            setShowPasswordInput(true);
            setLoading(false);
        } else if (needPwd === false) {
            fetchArticleContent();
        } else {
            checkPasswordRequirement();
        }
    }, [articleId]);

    useEffect(() => {
        loadCodeInjection();
        loadSiteInfo();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const loadCodeInjection = async () => {
        try {
            const globalHeadResponse = await apiClient.get('/site/global-head-code');
            if (globalHeadResponse?.data?.globalHeadCode) {
                setGlobalHeadCode(globalHeadResponse.data.globalHeadCode);
            }

            const contentHeadResponse = await apiClient.get('/site/content-head-code');
            if (contentHeadResponse?.data?.contentHeadCode) {
                setContentHeadCode(contentHeadResponse.data.contentHeadCode);
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

    useEffect(() => {
        if (contentHeadCode && article) {
            const container = document.createElement('div');
            container.innerHTML = contentHeadCode;
            
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
    }, [contentHeadCode, article]);

    const loadSiteInfo = async () => {
        try {
            const copyrightResponse = await apiClient.get('/site/copyright');
            if (copyrightResponse) setCopyright(copyrightResponse);

            const icpResponse = await apiClient.get('/site/icp-record');
            if (icpResponse) setIcpRecord(icpResponse);

            const mpsResponse = await apiClient.get('/site/mps-record');
            if (mpsResponse) setMpsRecord(mpsResponse);
        } catch (error) {
            console.error('加载站点信息失败:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-20 container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">加载中...</span>
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
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="pt-20">
                {showPasswordInput ? (
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-md mx-auto mt-10">
                            <form onSubmit={handlePasswordSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                        此文章需要密码访问
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

                        <main className="container mx-auto px-0 lg:px-4 py-8">
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="hidden lg:block lg:w-1/4">
                                    <div className="sticky top-28">
                                        <TableOfContents article={article} />
                                    </div>
                                </div>

                                <div className="w-full lg:w-1/2">
                                    <div className={article.article_cover ? "-mt-20 relative z-10" : ""}>
                                        <ArticlePreview article={article} />
                                        <CommentSection articleAlias={article.alias} />
                                    </div>
                                </div>
                                <div className="hidden lg:block lg:w-1/4">
                                    <div className="sticky top-28">
                                        <CategorySidebar />
                                        <TagSidebar />
                                        <RecommendedArticles />
                                    </div>
                                </div>
                            </div>

                        </main>
                    </div>
                ) : null}
            </div>

            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-white hover:bg-gray-100 text-black rounded-full p-3 shadow-lg transition-all duration-300 z-50 back-to-top-btn"
                    aria-label="返回顶部"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
            )}

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