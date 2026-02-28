import { getConfig } from '../utils/config';
import { Link, useNavigate } from 'react-router-dom';

const safeTruncate = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const renderTags = (tagsString, maxTags = 3, onTagClick) => {
    if (!tagsString) return null;

    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    const displayTags = tags.slice(0, maxTags);

    return displayTags.map((tag, index) => (
        <button
            key={index}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTagClick && onTagClick(tag);
            }}
            className="article-tag inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded hover:bg-gray-200 transition-colors"
        >
            #{tag}
        </button>
    ));
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
        tag: article.tag || '',
        author_avatar: article.author_avatar || ''
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
                className="article-card relative rounded-lg overflow-hidden shadow-md h-40 flex w-full cursor-pointer bg-white"
            >
                <div className="w-1/3 aspect-square m-2 rounded overflow-hidden bg-gray-100 shrink-0">
                    <img src={imageUrl} alt={safeArticle.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 p-3 flex flex-col">
                    <h2 className="text-sm font-bold mb-1 line-clamp-1 text-gray-900 leading-snug shrink-0">
                        {safeArticle.title}
                    </h2>

                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        {safeArticle.category && (
                            <button
                                onClick={handleCategoryClick}
                                className="article-category inline-flex items-center text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors shrink-0"
                            >
                                {safeArticle.category}
                            </button>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            {renderTags(safeArticle.tag, 2, handleTagClick)}
                        </div>
                    </div>

                    <p className="text-xs leading-relaxed line-clamp-2 text-gray-500 grow">
                        {safeArticle.excerpt}
                    </p>

                    <div className="mt-auto text-xs text-gray-400 flex items-center gap-2">
                        <img
                            src={safeArticle.author_avatar || '/default_avatar.png'}
                            alt={safeArticle.author}
                            className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{safeArticle.author}</span>
                        <span>·</span>
                        <span>{formatDate(safeArticle.date)}</span>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article
            onClick={handleCardClick}
            className="article-card flex flex-col relative group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 cursor-pointer w-full h-full"
        >
            {showImage && (
                <div className="w-full h-40 overflow-hidden rounded-t-lg shrink-0">
                    <img
                        className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                        src={imageUrl}
                        alt={safeArticle.title}
                    />
                </div>
            )}

            <div className="p-4 flex flex-col grow">
                <h2 className="text-lg font-bold mb-1 line-clamp-1 text-gray-900" title={safeArticle.title}>
                    <Link to={`/article/${safeArticle.alias}`} onClick={(e) => e.stopPropagation()}>
                        {safeTruncate(safeArticle.title, 30)}
                    </Link>
                </h2>

                <p className="text-gray-500 text-sm line-clamp-2 mb-2 grow leading-relaxed">
                    {safeArticle.excerpt}
                </p>

                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {safeArticle.category && (
                        <button
                            onClick={handleCategoryClick}
                            className="article-category inline-flex items-center text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors shrink-0"
                        >
                            {safeArticle.category}
                        </button>
                    )}
                    {safeArticle.tag && (
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            {renderTags(safeArticle.tag, 3, handleTagClick)}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center shrink-0 pt-2 card-footer">
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                        <img
                            src={safeArticle.author_avatar || '/default_avatar.png'}
                            alt={safeArticle.author}
                            className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="author-name">{safeArticle.author}</span>
                        <span>·</span>
                        <span>{formatDate(safeArticle.date)}</span>
                    </span>
                </div>
            </div>
        </article>
    );
}