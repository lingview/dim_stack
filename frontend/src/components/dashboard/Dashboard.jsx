import { fakeData } from '../../Api.jsx'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react';
import apiClient from '../../utils/axios.jsx';

const Sidebar = lazy(() => import('./Sidebar'));
const DashboardHeader = lazy(() => import('./DashboardHeader'));
const DashboardView = lazy(() => import('./DashboardView'));
const ArticlesView = lazy(() => import('./ArticlesView'));
const MarkdownEditor = lazy(() => import('../MarkdownEditor'));
const ProfileView = lazy(() => import('./ProfileView'));

export default function Dashboard() {
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [notifications, setNotifications] = useState([])
    const [username, setUsername] = useState('')
    const [showEditor, setShowEditor] = useState(false)
    const [loading, setLoading] = useState(true)
    const [articles, setArticles] = useState([])
    const [editingArticle, setEditingArticle] = useState(null) // 添加编辑文章状态

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await apiClient.get('/user/status')

                if (response && response.loggedIn) {
                    setUsername(response.username || '')
                } else {
                    navigate('/login')
                }
            } catch (error) {
                console.error('验证登录状态失败:', error)
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }

        checkLoginStatus()
    }, [navigate])

    // 获取文章列表
    useEffect(() => {
        const fetchArticles = async () => {
            if (activeTab === 'articles' && username) {
                try {
                    const response = await apiClient.get('/getarticlelist')
                    if (response.success) {
                        setArticles(response.data || [])
                    } else {
                        console.error('获取文章列表失败:', response.message)
                        setArticles([])
                    }
                } catch (error) {
                    console.error('获取文章列表错误:', error)
                    setArticles([])
                }
            }
        }

        fetchArticles()
    }, [activeTab, username])

    useEffect(() => {
        if (!loading && username) {
            if (fakeData && fakeData.dashboard) {
                setNotifications(fakeData.dashboard.notifications || [])
            }
        }
    }, [loading, username])

    useEffect(() => {
        const unreadCount = notifications.filter(n => n && !n.read).length
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) ${fakeData?.siteInfo?.title || 'Dashboard'}`
        } else {
            document.title = fakeData?.siteInfo?.title || 'Dashboard'
        }
    }, [notifications])

    useEffect(() => {
        const path = location.pathname
        if (path.startsWith('/dashboard/')) {
            const segments = path.split('/')
            if (segments.length >= 3) {
                setActiveTab(segments[2])
            }
        } else if (path === '/dashboard') {
            setActiveTab('dashboard')
        }
    }, [location])

    const handleMarkAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification && notification.id === id ? { ...notification, read: true } : notification
            )
        )
    }

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => notification ? { ...notification, read: true } : notification)
        )
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        if (tab === 'dashboard') {
            navigate('/dashboard')
        } else {
            navigate(`/dashboard/${tab}`)
        }
    }

    const handleLogout = async () => {
        try {
            await apiClient.post('/logout')
        } catch (error) {
            console.error('登出请求失败:', error)
        } finally {
            navigate('/login')
        }
    }

    const handleEditArticle = async (articleId) => {
        try {
            // 获取文章详情
            const response = await apiClient.get(`/getarticle/${articleId}`);

            if (response.success) {
                setEditingArticle(response.data);
                setShowEditor(true);
            } else {
                console.error('获取文章详情失败:', response.message);
                alert('获取文章详情失败: ' + response.message);
            }
        } catch (error) {
            console.error('获取文章详情错误:', error);
            alert('获取文章详情时发生错误');
        }
    };

    const handleEditorSave = (articleData) => {
        console.log('保存文章:', articleData);
        setShowEditor(false);
        setEditingArticle(null);

        if (activeTab === 'articles') {
            const fetchArticles = async () => {
                try {
                    const response = await apiClient.get('/getarticlelist')
                    if (response.success) {
                        setArticles(response.data || [])
                    } else {
                        console.error('获取文章列表失败:', response.message)
                        setArticles([])
                    }
                } catch (error) {
                    console.error('获取文章列表错误:', error)
                    setArticles([])
                }
            }
            fetchArticles()
        }
    };

    const handleEditorCancel = () => {
        setShowEditor(false);
        setEditingArticle(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">验证登录状态中...</p>
                </div>
            </div>
        )
    }

    if (!username) {
        return null
    }

    const dashboardData = fakeData?.dashboard || {}
    const stats = dashboardData.stats || []
    const quickActions = dashboardData.quickActions || []
    const sidebarMenu = dashboardData.sidebarMenu || []

    return (
        <div className="min-h-screen bg-gray-50 transition-colors duration-200">
            <div className="flex h-screen">
                <Suspense fallback={<div>加载中...</div>}>
                    <Sidebar
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        isOpen={sidebarOpen}
                        onToggle={() => setSidebarOpen(!sidebarOpen)}
                        onClose={() => setSidebarOpen(false)}
                        username={username}
                        menuItems={sidebarMenu}
                    />
                </Suspense>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Suspense fallback={<div>加载中...</div>}>
                        <DashboardHeader
                            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                            sidebarOpen={sidebarOpen}
                            username={username}
                            onLogout={handleLogout}
                            showNewArticleButton={activeTab === 'articles'}
                            onNewArticle={() => setShowEditor(true)}
                        />
                    </Suspense>

                    <main className="flex-1 overflow-y-auto p-6">
                        {/* 仪表盘视图 */}
                        {activeTab === 'dashboard' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <DashboardView
                                    stats={stats}
                                    quickActions={quickActions}
                                    notifications={notifications}
                                    onMarkAsRead={handleMarkAsRead}
                                    onMarkAllAsRead={handleMarkAllAsRead}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'articles' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <ArticlesView
                                    onNewArticle={() => setShowEditor(true)}
                                    onEditArticle={handleEditArticle} // 添加编辑文章处理函数
                                    articles={articles}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'profile' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <ProfileView />
                            </Suspense>
                        )}

                        {activeTab !== 'dashboard' && activeTab !== 'articles' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {sidebarMenu.find(m => m.link && m.link.includes(activeTab))?.title || '页面'}
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
                        onSave={handleEditorSave}
                        onCancel={handleEditorCancel}
                        initialData={editingArticle}
                    />
                </Suspense>
            )}
        </div>
    )
}
