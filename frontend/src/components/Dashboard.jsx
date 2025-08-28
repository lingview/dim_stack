import { fakeData } from '../Api.jsx'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    FileText, User, MessageCircle, Eye, Edit, File, Upload,
    Palette, Plug, UserPlus, RefreshCcw, BarChart2, Book,
    Settings, Wrench, Image, Link as LinkIcon, Clipboard, Users,
    Database, ShoppingCart, Package, Plus
} from 'lucide-react';

import { lazy, Suspense } from 'react';

const MarkdownEditor = lazy(() => import('./MarkdownEditor'));

export default function Dashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [notifications, setNotifications] = useState(fakeData.dashboard.notifications)
    const [username, setUsername] = useState('')
    const [showEditor, setShowEditor] = useState(false)

    useEffect(() => {
        const storedUsername = localStorage.getItem('username') || '未登录'
        setUsername(storedUsername)
    }, [])

    useEffect(() => {
        const unreadCount = notifications.filter(n => !n.read).length
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) ${fakeData.siteInfo.title}`
        } else {
            document.title = fakeData.siteInfo.title
        }
    }, [notifications])

    const handleMarkAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        )
    }

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 transition-colors duration-200">
            <div className="flex h-screen">
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onClose={() => setSidebarOpen(false)}
                    username={username}
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <DashboardHeader
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        sidebarOpen={sidebarOpen}
                        username={username}
                        onLogout={() => {
                            localStorage.removeItem('isLoggedIn')
                            localStorage.removeItem('username')
                            navigate('/login')
                        }}
                        showNewArticleButton={activeTab === 'articles'}
                        onNewArticle={() => setShowEditor(true)}
                    />


                    <main className="flex-1 overflow-y-auto p-6">
                        {/* 仪表盘视图 */}
                        {activeTab === 'dashboard' && (
                            <DashboardView
                                stats={fakeData.dashboard.stats}
                                quickActions={fakeData.dashboard.quickActions}
                                notifications={notifications}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAllAsRead={handleMarkAllAsRead}
                            />
                        )}

                        {activeTab === 'articles' && (
                            <ArticlesView 
                                onNewArticle={() => setShowEditor(true)} 
                            />
                        )}

                        {activeTab !== 'dashboard' && activeTab !== 'articles' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {fakeData.dashboard.sidebarMenu.find(m => m.link === `/${activeTab}`)?.title || '页面'}
                                </h2>
                                <p className="text-gray-600">
                                    这是 {activeTab} 页面的内容，正在开发中...
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {showEditor && (
                <Suspense fallback={<div className="fixed inset-0 z-50 bg-white flex items-center justify-center">加载编辑器中...</div>}>
                    <MarkdownEditor
                        onSave={(articleData) => {
                            console.log('保存文章:', articleData);
                            // 后续后端完成后添加QAQ
                            setShowEditor(false);
                        }}
                        onCancel={() => setShowEditor(false)}
                    />
                </Suspense>
            )}
        </div>
    )
}



function DashboardHeader({ onToggleSidebar, username, onLogout, showNewArticleButton, onNewArticle }) {
    const navigate = useNavigate()
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const getUserInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'L'
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={onToggleSidebar}
                        className="text-gray-500 hover:text-gray-700 mr-4 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-blue-600">仪表板</h1>
                </div>

                <div className="flex items-center space-x-4">
                    {/* 新建文章按钮 */}
                    {showNewArticleButton && (
                        <button
                            onClick={onNewArticle}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            新建文章
                        </button>
                    )}

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="搜索..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* 用户菜单 */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                {getUserInitial(username)}
                            </div>
                            <span className="hidden md:inline font-medium">{username}</span>
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
                                        navigate('/profile')
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    个人资料
                                </button>
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(false)
                                        navigate('/')
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

// 仪表盘视图组件
function DashboardView({ stats, quickActions, notifications, onMarkAsRead, onMarkAllAsRead }) {
    notifications.filter(n => !n.read).length;
    return (
        <div className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${getIconColor(stat.icon)}`}>
                                <span className="text-white text-lg">{getIcon(stat.icon)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 快捷操作 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">快捷访问</h2>
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
                    >
                        标记全部已读
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <span className="text-blue-600 text-lg">{getIcon(action.icon)}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 通知 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">通知</h2>
                    <button className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200">
                        查看全部
                    </button>
                </div>

                <div className="space-y-4">
                    {notifications.map((notification, index) => (
                        <div
                            key={index}
                            className={`border-l-4 p-4 rounded-r-lg ${
                                notification.read
                                    ? 'border-gray-200 bg-gray-50'
                                    : 'border-blue-500 bg-blue-50'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                    <p className="text-sm text-gray-500 mt-1">{notification.content}</p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <span className="text-xs text-gray-500">{notification.time}</span>
                                    {!notification.read && (
                                        <button
                                            onClick={() => onMarkAsRead(notification.id)}
                                            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors duration-200"
                                        >
                                            已读
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// 侧边栏组件
function Sidebar({ activeTab, onTabChange, isOpen, onToggle, onClose, username }) {
    const menuItems = fakeData.dashboard.sidebarMenu
    const [expandedItems, setExpandedItems] = useState({})

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

    return (
        <>
            {/* 移动端遮罩层 */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`${
                isOpen ? 'w-64' : 'w-16'
            } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col relative z-30`}>


                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-2xl font-bold text-blue-600">
                                {isOpen ? fakeData.siteInfo.chineseTitle : fakeData.siteInfo.chineseTitle.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>


                {/* 导航菜单 */}
                <nav className="mt-4 flex-1 overflow-y-auto">
                    <ul className="space-y-1 px-2">
                        {menuItems.map((item) => (
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
                                <p className="text-xs text-gray-500">超级管理员</p>
                            </div>
                        )}
                        {isOpen && (
                            <button className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200">
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


function ArticlesView({ onNewArticle }) {
    // 模拟文章数据
    const articles = fakeData.dashboard.articles

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">文章管理</h2>
                <button
                    onClick={onNewArticle}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    新建文章
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                标题
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                作者
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                日期
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                状态
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {articles.map((article) => (
                            <tr key={article.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{article.author}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{article.date}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        article.status === '已发布' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {article.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3">编辑</button>
                                    <button className="text-red-600 hover:text-red-900">删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


function getIcon(iconName) {
    switch (iconName) {
        case 'article': return <FileText className="w-5 h-5" />
        case 'user': return <User className="w-5 h-5" />
        case 'comment': return <MessageCircle className="w-5 h-5" />
        case 'view':
        case 'eye': return <Eye className="w-5 h-5" />
        case 'edit': return <Edit className="w-5 h-5" />
        case 'page': return <File className="w-5 h-5" />
        case 'upload': return <Upload className="w-5 h-5" />
        case 'theme': return <Palette className="w-5 h-5" />
        case 'plugin': return <Plug className="w-5 h-5" />
        case 'add-user': return <UserPlus className="w-5 h-5" />
        case 'refresh': return <RefreshCcw className="w-5 h-5" />
        case 'dashboard': return <BarChart2 className="w-5 h-5" />
        case 'content': return <Book className="w-5 h-5" />
        case 'appearance':
        case 'settings': return <Settings className="w-5 h-5" />
        case 'tools': return <Wrench className="w-5 h-5" />
        case 'media': return <Image className="w-5 h-5" />
        case 'link': return <LinkIcon className="w-5 h-5" />
        case 'menu': return <Clipboard className="w-5 h-5" />
        case 'users': return <Users className="w-5 h-5" />
        case 'backup': return <Database className="w-5 h-5" />
        case 'marketplace': return <ShoppingCart className="w-5 h-5" />
        case 'migrate': return <Package className="w-5 h-5" />
        default: return <File className="w-5 h-5" />
    }
}

function getIconColor(iconName) {
    switch (iconName) {
        case 'article': return 'bg-blue-500'
        case 'user': return 'bg-purple-500'
        case 'comment': return 'bg-green-500'
        case 'view': return 'bg-yellow-500'
        case 'eye': return 'bg-blue-500'
        case 'edit': return 'bg-green-500'
        case 'page': return 'bg-indigo-500'
        case 'upload': return 'bg-orange-500'
        case 'theme': return 'bg-pink-500'
        case 'plugin': return 'bg-purple-500'
        case 'add-user': return 'bg-green-500'
        case 'refresh': return 'bg-blue-500'
        case 'dashboard': return 'bg-blue-500'
        case 'content': return 'bg-green-500'
        case 'appearance': return 'bg-purple-500'
        case 'system': return 'bg-red-500'
        case 'tools': return 'bg-yellow-500'
        default: return 'bg-gray-500'
    }
}
