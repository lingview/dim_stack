import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardHeader({ onToggleSidebar, sidebarOpen, username, onLogout }) {
    const navigate = useNavigate()
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = requestAnimationFrame(() => {
            setIsVisible(true);
        });
        return () => cancelAnimationFrame(timer);
    }, []);

    const getUserInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'L'
    }

    return (
        <header
            className="bg-white shadow-sm border-b border-gray-200"
            style={{
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 200ms ease-in-out'
            }}
        >
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={onToggleSidebar}
                        className="text-gray-500 hover:text-gray-700 mr-4 p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200"
                        aria-label="切换侧边栏"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>

                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {sidebarOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            )}
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-blue-600">仪表板</h1>
                </div>

                <div className="flex items-center space-x-4">

                    {/*<div className="relative hidden sm:block">*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        placeholder="搜索..."*/}
                    {/*        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"*/}
                    {/*    />*/}
                    {/*    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">*/}
                    {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />*/}
                    {/*    </svg>*/}
                    {/*</div>*/}

                    {/* 用户菜单 */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                {getUserInitial(username)}
                            </div>
                            <span className="font-medium text-sm sm:text-base">{username}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* 下拉菜单 */}
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(false)
                                        window.location.href = '/';
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    返回网站
                                </button>
                                <hr className="border-gray-200 my-1" />
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(false)
                                        onLogout()
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    登出
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
