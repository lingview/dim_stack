export default function ArticleCard({ article }) {
    // 限制title和excerpt显示长度
    const truncate = (text, maxLength) =>
        text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

    return (
        <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col">
            {/* 头图 */}
            <img
                className="w-full h-48 object-cover"
                src={article.image}
                alt={article.title}
            />

            {/* 内容区 */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{article.date}</span>
                    <span className="mx-2">•</span>
                    <span>{article.readTime}</span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors duration-200">
                    <a href={`/article/${article.id}`}>
                        {truncate(article.title, 30)}
                    </a>
                </h2>

                <p className="text-gray-600 mb-4 flex-1">
                    {truncate(article.excerpt, 40)}
                </p>

                {/* 用户名和分类信息固定在底部 */}
                <div className="flex justify-between items-center mt-auto">
                    <span className="text-sm text-gray-500">作者: {article.author}</span>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {article.category}
          </span>
                </div>
            </div>
        </article>
    );
}
