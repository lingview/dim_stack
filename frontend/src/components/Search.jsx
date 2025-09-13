import { useState, useEffect, useRef } from 'react';
import apiClient from '../utils/axios.jsx';

export default function Search() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const searchInputRef = useRef(null);
    const debounceTimeout = useRef(null);

    useEffect(() => {
        if (!isSearchOpen || !searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            try {
                const response = await apiClient.get(
                    `/articlesearch/search?keyword=${encodeURIComponent(searchTerm)}`
                );
                if (response.success) {
                    setSearchResults(response.data);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('搜索失败:', error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimeout.current);
    }, [searchTerm, isSearchOpen]);

    const toggleSearch = () => {
        setIsSearchOpen((prev) => !prev);
    };

    useEffect(() => {
        if (isSearchOpen) {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setSearchTerm('');
            setSearchResults([]);
        }
    }, [isSearchOpen]);

    const handleResultClick = () => {
        setIsSearchOpen(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    return (
        <div className="relative">
            <button
                onClick={toggleSearch}
                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 ease-in-out text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="打开搜索"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </button>

            {isSearchOpen && (
                <>
                    <div className="absolute right-0 mt-2 w-96 bg-white/90 backdrop-blur-md shadow-xl rounded-xl z-50 border border-gray-200">
                        <div className="p-4">
                            <form onSubmit={(e) => e.preventDefault()} className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="搜索文章、笔记..."
                                    className="w-full px-5 py-3 pl-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 text-gray-800 transition-all duration-200"
                                />
                                <svg
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </form>

                            {isLoading && (
                                <div className="flex justify-center py-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                                        <span className="text-sm text-gray-500">搜索中...</span>
                                    </div>
                                </div>
                            )}

                            {!isLoading && searchResults.length > 0 && (
                                <div className="mt-3 max-h-96 overflow-y-auto space-y-1">
                                    {searchResults.map((article) => (
                                        <a
                                            key={article.id}
                                            href={`/article/${article.alias}`}
                                            onClick={handleResultClick}
                                            className="block p-3 rounded-xl hover:bg-blue-50 transition-all duration-150 border border-transparent hover:border-blue-100"
                                        >
                                            <h3 className="font-semibold text-gray-800 line-clamp-1">{article.title}</h3>
                                            {article.excerpt && (
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-tight">
                                                    {article.excerpt}
                                                </p>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            )}

                            {!isLoading && searchTerm && searchResults.length === 0 && (
                                <div className="py-8 text-center text-gray-500 flex flex-col items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 opacity-50 mb-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M9.172 16.172a4 4 0 015.656 0M12 10v4m0 0l3-3m-3 3l-3-3"
                                        />
                                    </svg>
                                    <span className="text-sm">未找到相关文章</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity duration-200"
                        onClick={() => setIsSearchOpen(false)}
                    ></div>
                </>
            )}
        </div>
    );
}