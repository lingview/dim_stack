import { getConfig } from '../utils/config';
import { Link } from 'react-router-dom';

const escapeHtml = (unsafe) => {
    if (!unsafe) return unsafe;

    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const safeTruncate = (text, maxLength) => {
    if (!text) return '';
    const escapedText = escapeHtml(text);
    return escapedText.length > maxLength ? escapedText.slice(0, maxLength) + "..." : escapedText;
};

export default function ArticleCard({ article, showImage = true }) {
    const safeArticle = {
        ...article,
        title: escapeHtml(article.title) || '',
        excerpt: escapeHtml(article.excerpt) || '',
        author: escapeHtml(article.author) || '',
        category: escapeHtml(article.category) || '',
        alias: escapeHtml(article.alias) || ''
    };

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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
    };

    const imageUrl = getFullImageUrl(article.image);

    return (
        <article className="relative group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col">
            {showImage && (
                <div className="block overflow-hidden h-48 w-full">
                    <img
                        className="w-full h-full object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105"
                        src={imageUrl || '/image_error.svg'}
                        alt={safeArticle.title}
                        onError={(e) => {
                            e.currentTarget.src = '/image_error.svg';
                        }}
                    />
                </div>
            )}

            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{formatDate(safeArticle.date)}</span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors duration-200">
                    <span className="no-underline">{safeTruncate(safeArticle.title, 30)}</span>
                </h2>

                <p className="text-gray-600 mb-4 flex-1">
                    {safeTruncate(safeArticle.excerpt, 40)}
                </p>

                <div className="flex justify-between items-center mt-auto">
                    <span className="text-sm text-gray-500">作者: {safeArticle.author}</span>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {safeArticle.category}
                    </span>
                </div>
            </div>

            <Link
                to={`/article/${safeArticle.alias}`}
                className="absolute inset-0 z-10"
                aria-label={`阅读：${safeArticle.title}`}
            >
                <span className="sr-only">阅读 {safeArticle.title}</span>
            </Link>
        </article>
    );
}
