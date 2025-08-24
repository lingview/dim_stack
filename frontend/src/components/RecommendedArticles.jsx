import { fakeData } from '../api';

export default function RecommendedArticles() {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 transition-colors duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">推荐文章</h3>
            <ul className="space-y-4">
                {fakeData.recommendedArticles.map((article) => (
                    <li key={article.id}>
                        <a
                            href={`/article/${article.id}`}
                            className="block hover:bg-gray-50 p-3 rounded transition-all duration-200"
                        >
                            <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                            <p className="text-sm text-gray-500">{article.date}</p>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
