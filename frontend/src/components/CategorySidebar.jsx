import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import { getCategoryIcon } from '../utils/IconUtils';

export default function CategorySidebar({selectedCategory }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await apiClient.get('/categoriesandcount');
                setCategories(data);
                setError(null);
            } catch (err) {
                console.error('获取分类数据失败:', err);
                setError('获取分类数据失败');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryName) => {
        if (selectedCategory === categoryName) {
            navigate('/');
        } else {
            const encodedCategory = encodeURIComponent(categoryName);
            navigate(`/category?name=${encodedCategory}`);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">文章分类</h3>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">文章分类</h3>
                <div className="text-red-500 text-center py-4">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">文章分类</h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {categories.map((category) => (
                    <li key={category.id}>
                        <button
                            onClick={() => handleCategoryClick(category.article_categories)}
                            className={`flex justify-between items-center w-full text-left px-2 py-1 rounded ${
                                selectedCategory === category.article_categories
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span className="inline-flex items-center gap-1">
                                {getCategoryIcon()}
                                {category.article_categories}
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                            {category.articleCount || 0}
                        </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

}
