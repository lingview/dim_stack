import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';

export default function TagSidebar({ selectedTag }) {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTags = async () => {
            try {
                setLoading(true);
                const data = await apiClient.get('/tags');
                setTags(data);
                setError(null);
            } catch (err) {
                console.error('获取标签数据失败:', err);
                setError('获取标签数据失败');
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, []);

    const handleTagClick = (tagName) => {
        if (selectedTag === tagName) {
            navigate('/');
        } else {
            navigate(`/tag/${tagName}`);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">文章标签</h3>
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
                <h3 className="text-lg font-bold text-gray-900 mb-4">文章标签</h3>
                <div className="text-red-500 text-center py-4">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">文章标签</h3>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2">
                {tags.map((tag) => (
                    <button
                        key={tag.id}
                        onClick={() => handleTagClick(tag.tag_name)}
                        className={`px-3 py-1 text-sm rounded-full ${
                            selectedTag === tag.tag_name
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                        #{tag.tag_name}
                    </button>
                ))}
            </div>
        </div>

    );
}
