import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Music } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getConfig } from '../utils/config';
import apiClient from '../utils/axios';
import Header from './Header';
import CategorySidebar from './CategorySidebar';
import RecommendedArticles from './RecommendedArticles';

const rehypeSanitizeSchema = {
    tagNames: [
        'div','span','p','br','strong','em','u','s','del','ins',
        'h1','h2','h3','h4','h5','h6',
        'ul','ol','li','dl','dt','dd',
        'blockquote','pre','code',
        'table','thead','tbody','tr','th','td',
        'a','img','video','audio','source','track',
        'hr','sup','sub'
    ],
    attributes: {
        '*': ['className', 'id', 'style'],
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'video': ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'width', 'height', 'preload'],
        'audio': ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload'],
        'source': ['src', 'type', 'media'],
        'track': ['src', 'kind', 'srclang', 'label', 'default']
    }
};

const isSafeUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

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

    // Markdown 渲染组件配置
    const renderMarkdownComponents = {
        h1: (props) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 text-gray-900 dark:text-white" {...props} />
        ),
        h2: (props) => (
            <h2 className="text-2xl font-bold mt-5 mb-3 text-gray-900 dark:text-white" {...props} />
        ),
        h3: (props) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white" {...props} />
        ),
        h4: (props) => (
            <h4 className="text-lg font-semibold mt-3 mb-2 text-gray-900 dark:text-white" {...props} />
        ),
        h5: (props) => (
            <h5 className="text-base font-semibold mt-3 mb-2 text-gray-900 dark:text-white" {...props} />
        ),
        h6: (props) => (
            <h6 className="text-sm font-semibold mt-3 mb-2 text-gray-900 dark:text-white" {...props} />
        ),
        p: (props) => (
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />
        ),
        ul: (props) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props} />
        ),
        ol: (props) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props} />
        ),
        li: (props) => (
            <li className="mb-1 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
        ),
        blockquote: (props) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-2 rounded-r" {...props} />
        ),
        table: (props) => (
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
            </div>
        ),
        thead: (props) => (
            <thead className="bg-gray-100 dark:bg-gray-700" {...props} />
        ),
        th: (props) => (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white" {...props} />
        ),
        td: (props) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300" {...props} />
        ),
        hr: (props) => (
            <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />
        ),
        // 代码块渲染
        code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
                <div className="my-4">
                    <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg shadow-sm"
                        {...props}
                    >
                        {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code
                    className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-white"
                    {...props}
                >
                    {children}
                </code>
            );
        },
        a: ({ href, children, ...props }) => {
            if (!isSafeUrl(href)) {
                return <span className="text-gray-500" {...props}>{children}</span>;
            }
            return (
                <a
                    href={href}
                    className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                >
                    {children}
                </a>
            );
        },
        img: ({ src, alt, ...props }) => {
            if (!isSafeUrl(src)) return null;
            const fullSrc = getFullImageUrl(src);

            return (
                <div className="my-4 flex">
                    <img
                        src={fullSrc}
                        alt={alt || '图片'}
                        className="rounded-lg shadow-sm cursor-pointer border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                        style={{
                            maxHeight: "400px",
                            maxWidth: "100%",
                            height: "auto",
                            width: "auto",
                            objectFit: "contain",
                        }}
                        onClick={() => window.open(fullSrc, "_blank")}
                        title="点击查看大图"
                        onError={(e) => {
                            e.target.src = '/image_error.svg';
                            e.target.alt = '图片加载失败';
                        }}
                        {...props}
                    />
                </div>
            );
        },
        video: ({ src, controls = true, ...props }) => {
            if (!isSafeUrl(src)) return null;
            const fullSrc = getFullImageUrl(src);

            return (
                <div className="my-4 flex">
                    <video
                        src={fullSrc}
                        controls={controls}
                        className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                        style={{ maxWidth: "100%", maxHeight: "400px" }}
                        {...props}
                    >
                        您的浏览器不支持视频播放。
                    </video>
                </div>
            );
        },
        audio: ({ src, controls = true, preload = "metadata", ...props }) => {
            if (!isSafeUrl(src)) return null;
            const fullSrc = getFullImageUrl(src);
            const fileName = src.split("/").pop()?.split("?")[0] || "音频文件";

            return (
                <div className="my-4 p-4 bg-gray-100 dark:bg-gradient-to-r dark:from-blue-900 dark:to-purple-900 border border-gray-200 dark:border-blue-700 rounded-xl shadow-sm max-w-lg">
                    <div className="flex items-center mb-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <Music className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={fileName}>
                                {fileName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                音频文件
                            </div>
                        </div>
                    </div>
                    <audio
                        src={fullSrc}
                        controls={controls}
                        preload={preload}
                        className="w-full rounded-md"
                        style={{ height: "40px", outline: "none" }}
                        {...props}
                    >
                        您的浏览器不支持音频播放。
                    </audio>
                </div>
            );
        },
        source: ({ src, type, ...props }) => {
            if (!isSafeUrl(src)) return null;
            const fullSrc = getFullImageUrl(src);
            return <source src={fullSrc} type={type} {...props} />;
        },
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


    const isMarkdownContent = (content) => {
        if (!content) return false;

        const markdownPatterns = [
            /^#{1,6}\s/m,           // 标题
            /\*\*.*\*\*/,           // 粗体
            /\*.*\*/,               // 斜体
            /\[.*\]\(.*\)/,         // 链接
            /!\[.*\]\(.*\)/,        // 图片
            /^>\s/m,                // 引用
            /^[-*+]\s/m,            // 无序列表
            /^\d+\.\s/m,            // 有序列表
            /```[\s\S]*```/,        // 代码块
            /`.*`/,                 // 内联代码
        ];

        return markdownPatterns.some(pattern => pattern.test(content));
    };


    const renderArticleContent = (content) => {
        if (!content) return null;

        // 如果是Markdown内容，使用ReactMarkdown渲染
        if (isMarkdownContent(content)) {
            return (
                <div className="markdown-content">
                    <ReactMarkdown
                        children={content}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, [rehypeSanitize, rehypeSanitizeSchema]]}
                        components={renderMarkdownComponents}
                    />
                </div>
            );
        } else {
            // HTML内容，添加样式处理去除居中
            const processedContent = content
                .replace(/class="my-4 flex justify-center"/g, 'class="my-4"')
                .replace(/style="width:\s*400px;"/g, 'style="max-width: 100%; max-height: 400px;"');

            return (
                <div
                    className="prose max-w-none dark:prose-invert
                        prose-headings:text-gray-900 dark:prose-headings:text-white
                        prose-p:text-gray-700 dark:prose-p:text-gray-300
                        prose-a:text-blue-600 dark:prose-a:text-blue-400
                        prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                        prose-strong:text-gray-900 dark:prose-strong:text-white
                        prose-code:bg-gray-100 dark:prose-code:bg-gray-700
                        prose-pre:bg-gray-800 dark:prose-pre:bg-gray-900
                        [&_video]:my-4 [&_video]:max-w-full [&_video]:h-auto
                        [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto
                        [&_.justify-center]:justify-start"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                />
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header />
                <div className="pt-20 container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">加载中...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="pt-20">
                {showPasswordInput ? (
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-md mx-auto mt-10">
                            <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                                        此文章需要密码访问
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="shadow appearance-none border dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

                        {/* 主要内容区域 */}
                        <main className="container mx-auto px-4 py-8">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* 文章内容区 */}
                                <div className="lg:w-2/3">
                                    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 -mt-20 relative z-10">
                                        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                                            {article.article_name}
                                        </h1>
                                        <div className="text-gray-600 dark:text-gray-400 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                                            <span>发布时间: {new Date(article.create_time).toLocaleDateString()}</span>
                                            <span className="mx-2">|</span>
                                            <span>阅读量: {article.page_views}</span>
                                            {article.tag && (
                                                <>
                                                    <span className="mx-2">|</span>
                                                    <span>标签: {article.tag}</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="article-content">
                                            {renderArticleContent(article.article_content)}
                                        </div>
                                    </article>
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