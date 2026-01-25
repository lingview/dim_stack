import { getConfig } from '../utils/config';
import { Link, useNavigate } from 'react-router-dom';

const safeTruncate = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const renderTags = (tagsString, maxTags = 3, onTagClick, isMobile = false) => {
    if (!tagsString) return null;

    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    const displayTags = tags.slice(0, maxTags);

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
                    className={
                        isMobile
                            ? 'text-xs text-gray-800 hover:text-black transition-colors'
                            : 'inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded hover:bg-gray-200 transition-colors'
                    }
                >
                    #{tag}
                </button>
            ))}
        </div>
    );
};

export default function ArticleCard({
                                        article,
                                        showImage = true,
                                        forceMobile = false,
                                        onTagClick,
                                        onCategoryClick
                                    }) {
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
        if (url.startsWith('http')) return url;
        try {
            return getConfig().getFullUrl(url);
        } catch {
            return url.startsWith('/') ? url : `/upload/${url}`;
        }
    };

    const imageUrl = getFullImageUrl(article.image) || '/image_error.svg';

    const formatDate = (d) => {
        if (!d) return '';
        const date = new Date(d);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const handleCardClick = () => navigate(`/article/${safeArticle.alias}`);

    const handleTagClick = (tag) => {
        onTagClick ? onTagClick(tag) : navigate(`/tag/${encodeURIComponent(tag)}`);
    };

    const handleCategoryClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCategoryClick
            ? onCategoryClick(safeArticle.category)
            : navigate(`/category/${encodeURIComponent(safeArticle.category)}`);
    };

    if (forceMobile) {
        return (
            <article
                onClick={handleCardClick}
                className="relative rounded-lg overflow-hidden shadow-md h-40 flex w-full cursor-pointer"
            >
                <div className="w-1/3 aspect-square m-2 rounded overflow-hidden bg-white z-10">
                    <img
                        src={imageUrl}
                        alt={safeArticle.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="mobile-article-mask flex-1 p-3 flex flex-col z-10 bg-white/65 backdrop-blur-sm">
                    {renderTags(safeArticle.tag, 2, handleTagClick, true)}

                    <h2 className="mobile-article-title text-sm font-bold mb-1 line-clamp-2 text-gray-900">
                        {safeArticle.title}
                    </h2>

                    <p className="mobile-article-excerpt text-xs line-clamp-2 mb-2 text-gray-700">
                        {safeArticle.excerpt}
                    </p>

                    <button
                        onClick={handleCategoryClick}
                        className="category-chip self-start inline-flex items-center text-xs px-2 py-1 rounded bg-blue-100/80 text-blue-800 hover:bg-blue-200"
                    >
                        {safeArticle.category}
                    </button>

                    <div className="mobile-article-meta mt-auto text-xs text-gray-600">
                        <div>作者：{safeArticle.author}</div>
                        <div>{formatDate(safeArticle.date)}</div>
                    </div>
                </div>

                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            </article>
        );
    }

    // 桌面端UI：纵向330px卡片
    return (
        <article
            onClick={handleCardClick}
            className="
                article-card
                flex flex-col
                relative group
                bg-white
                rounded-lg
                shadow-md hover:shadow-lg
                transition-all duration-300
                border border-gray-200
                cursor-pointer
                w-[330px] max-w-[330px] flex-none
                h-full
            "
        >
            {showImage && (
                <div className="w-full h-44 overflow-hidden rounded-t-lg flex-shrink-0">
                    <img
                        className="w-full h-full object-cover rounded-t-lg transition-transform group-hover:scale-105"
                        src={imageUrl}
                        alt={safeArticle.title}
                    />
                </div>
            )}

            <div className="p-6 flex flex-col flex-grow">
                {renderTags(safeArticle.tag, 3, handleTagClick)}

                <h2 className="article-card-title text-xl font-bold mb-3 line-clamp-2 text-gray-900">
                    <Link
                        to={`/article/${safeArticle.alias}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {safeTruncate(safeArticle.title, 30)}
                    </Link>
                </h2>

                <p className="article-card-excerpt text-gray-600 line-clamp-2 mb-4 flex-grow">
                    {safeArticle.excerpt}
                </p>

                <div className="flex justify-between items-center flex-shrink-0">
                    <span className="article-card-meta text-sm text-gray-500">
                        {safeArticle.author} · {formatDate(safeArticle.date)}
                    </span>

                    <button
                        onClick={handleCategoryClick}
                        className="article-card-category bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex-shrink-0"
                    >
                        {safeArticle.category}
                    </button>
                </div>
            </div>
        </article>
    );
}