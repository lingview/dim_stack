import { getConfig } from '../utils/config';
import { Link, useNavigate } from 'react-router-dom';

const safeTruncate = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const renderTags = (tagsString, maxTags = 3, onTagClick) => {
    if (!tagsString) return null;

    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (tags.length === 0) return null;

    const displayTags = tags.slice(0, maxTags);
    const remainingCount = tags.length - maxTags;

    return (
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
            {displayTags.map((tag, index) => (
                <button
                    key={index}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onTagClick && onTagClick(tag);
                    }}
                    className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                    #{tag}
                </button>
            ))}
            {remainingCount > 0 && (
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    ...
                </span>
            )}
        </div>
    );
};

export default function ArticleCard({ article, showImage = true, onTagClick, onCategoryClick }) {
    const navigate = useNavigate();
    const safeArticle = {
        ...article,
        title: article.title || '',
        excerpt: article.excerpt || '',
        author: article.author || '',
        category: article.category || '',
        alias: article.alias || '',
        tag: article.tag || ''
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

    const handleCategoryClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onCategoryClick) {
            onCategoryClick(safeArticle.category);
        } else {
            navigate(`/category/${encodeURIComponent(safeArticle.category)}`);
        }
    };

    const handleTagClick = (tag) => {
        if (onTagClick) {
            onTagClick(tag);
        } else {
            navigate(`/tag/${encodeURIComponent(tag)}`);
        }
    };

    const imageUrl = getFullImageUrl(article.image);

    const handleCardClick = () => {
        navigate(`/article/${safeArticle.alias}`);
    };

    return (
        <article
            className="relative group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer h-full
                       flex flex-row sm:flex-col"
            onClick={handleCardClick}
        >
            {showImage && (
                <div className="flex items-center justify-center w-1/3 sm:w-full p-2 sm:p-0 flex-shrink-0">
                    <div className="block overflow-hidden w-full aspect-square sm:aspect-auto sm:h-44 rounded-lg sm:rounded-none">
                        <img
                            className="w-full h-full object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105"
                            src={imageUrl || '/image_error.svg'}
                            alt={safeArticle.title}
                            onError={(e) => {
                                e.currentTarget.src = '/image_error.svg';
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="p-3 sm:p-6 flex flex-col flex-1 w-2/3 sm:w-full">
                {renderTags(safeArticle.tag, 3, handleTagClick)}

                <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                    <Link
                        to={`/article/${safeArticle.alias}`}
                        className="no-underline hover:underline block"
                        aria-label={`阅读：${safeArticle.title}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {safeTruncate(safeArticle.title, 30)}
                    </Link>
                </h2>

                <div className="mb-2 sm:mb-4 flex-1 relative">
                    <Link
                        to={`/article/${safeArticle.alias}`}
                        className="no-underline hover:underline text-gray-600 hover:text-blue-500 block overflow-hidden text-sm sm:text-base"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                        aria-label={`阅读：${safeArticle.title}`}
                        onClick={(e) => e.stopPropagation()}
                        title={safeArticle.excerpt}
                    >
                        {safeArticle.excerpt}
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-2 mt-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm text-gray-500">作者: {safeArticle.author}</span>
                        <span className="text-xs sm:text-sm text-gray-500">发布于: {formatDate(safeArticle.date)}</span>
                    </div>
                    <button
                        onClick={handleCategoryClick}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200 transition-colors self-start sm:self-auto"
                    >
                        {safeArticle.category}
                    </button>
                </div>
            </div>
        </article>
    );
}