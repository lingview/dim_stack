import { useState, useEffect } from 'react';
import { getIcon } from '../../utils/IconUtils';
import { fetchSiteName } from '../../Api.jsx';
import {useNavigate} from "react-router-dom";

export default function Sidebar({ activeTab, onTabChange, isOpen, onToggle, username, menuItems }) {
    const [expandedItems, setExpandedItems] = useState({})
    const [siteName, setSiteName] = useState('');

    useEffect(() => {
        const loadSiteName = async () => {
            const name = await fetchSiteName();
            if (name) {
                setSiteName(name);
            } else {
                setSiteName("次元栈");
            }
        };

        loadSiteName();
    }, []);

    const getRouteSegment = (link) => {
        if (!link) return ''
        const segments = link.split('/')
        return segments[segments.length - 1] || segments[segments.length - 2] || ''
    }

    const getUserInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'L'
    }

    const toggleExpanded = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }))
    }

    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/dashboard/profile');
    };
    return (
        <>
            {/* 移动端遮罩层 */}
            {/*{isOpen && (*/}
            {/*    <div*/}
            {/*        className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"*/}
            {/*        onClick={onClose}*/}
            {/*    />*/}
            {/*)}*/}

            <div className={`${
                isOpen ? 'w-64' : 'w-16'
            } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col relative z-30`}>

                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-2xl font-bold text-blue-600">
                                {isOpen ? siteName : siteName?.charAt(0)} {/* 使用siteName */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 导航菜单 */}
                <nav className="mt-4 flex-1 overflow-y-auto">
                    <ul className="space-y-1 px-2">
                        {menuItems.map((item) => (
                            item && (
                                <li key={item.id}>
                                    {item.children ? (
                                        <div>
                                            <button
                                                onClick={() => {
                                                    if (isOpen) {
                                                        toggleExpanded(item.id)
                                                    } else {
                                                        onToggle()
                                                    }
                                                }}
                                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                    activeTab === getRouteSegment(item.link)
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                <span className="text-lg">{getIcon(item.icon)}</span>
                                                {isOpen && (
                                                    <>
                                                        <span className="ml-3">{item.title}</span>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                                                                expandedItems[item.id] ? 'rotate-180' : ''
                                                            }`}
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>

                                            {/* 子菜单 */}
                                            {isOpen && expandedItems[item.id] && (
                                                <ul className="mt-1 space-y-1">
                                                    {item.children.map((child) => (
                                                        child && (
                                                            <li key={child.id}>
                                                                <button
                                                                    onClick={() => onTabChange(getRouteSegment(child.link))}
                                                                    className={`w-full flex items-center px-3 py-2 ml-6 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                                        activeTab === getRouteSegment(child.link)
                                                                            ? 'bg-blue-100 text-blue-700'
                                                                            : 'text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    <span className="text-base">{getIcon(child.icon)}</span>
                                                                    <span className="ml-3">{child.title}</span>
                                                                </button>
                                                            </li>
                                                        )
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onTabChange(getRouteSegment(item.link))}
                                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                activeTab === getRouteSegment(item.link)
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="text-lg">{getIcon(item.icon)}</span>
                                            {isOpen && <span className="ml-3">{item.title}</span>}
                                        </button>
                                    )}
                                </li>
                            )
                        ))}
                    </ul>
                </nav>

                {/* 底部用户信息 */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {getUserInitial(username)}
                        </div>
                        {isOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{username}</p>
                            </div>
                        )}
                        {isOpen && (
                            <button
                                onClick={handleClick}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
