import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import { getTagIcon } from '../utils/IconUtils';

export default function TagSidebar({ selectedTag }) {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBottomGradient, setShowBottomGradient] = useState(false);
    const [showTopGradient, setShowTopGradient] = useState(false);
    const listRef = useRef(null);
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

    useEffect(() => {
        const el = listRef.current;
        if (!el) return;

        const checkScroll = () => {
            const canScroll = el.scrollHeight > el.clientHeight;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
            const atTop = el.scrollTop <= 4;
            setShowBottomGradient(canScroll && !atBottom);
            setShowTopGradient(canScroll && !atTop);
        };

        checkScroll();
        el.addEventListener('scroll', checkScroll);
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);

        return () => {
            el.removeEventListener('scroll', checkScroll);
            ro.disconnect();
        };
    }, [tags]);

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
            <div className="relative">
                <div
                    className="category-fade-mask-top absolute top-0 left-0 right-0 h-10 pointer-events-none transition-opacity duration-300 z-10"
                    style={{ opacity: showTopGradient ? 1 : 0 }}
                />

                <div
                    ref={listRef}
                    className="hide-scrollbar flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
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
                            <span className="inline-flex items-center gap-1">
                                {getTagIcon()}
                                {tag.tag_name}
                            </span>
                        </button>
                    ))}
                </div>

                <div
                    className="category-fade-mask-bottom absolute bottom-0 left-0 right-0 h-10 pointer-events-none transition-opacity duration-300"
                    style={{ opacity: showBottomGradient ? 1 : 0 }}
                />
            </div>
        </div>
    );
}