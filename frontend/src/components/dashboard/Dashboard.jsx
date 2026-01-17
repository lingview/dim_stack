import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react';
import apiClient from '../../utils/axios.jsx';

import { fetchStatistics, fetchDashboardData } from '../../Api.jsx';
import CustomPageManager from "./CustomPageManager.jsx";

const Sidebar = lazy(() => import('./Sidebar'));
const DashboardHeader = lazy(() => import('./DashboardHeader'));
const DashboardView = lazy(() => import('./DashboardView'));
const ArticlesView = lazy(() => import('./ArticlesView'));
const MarkdownEditor = lazy(() => import('../MarkdownEditor'));
const ProfileView = lazy(() => import('./ProfileView'));
const CommentsView = lazy(() => import('./CommentsView'));
const ArticlesReview = lazy(() => import('./ArticlesReview'));
const MenusView = lazy(() => import('./MenusView'));
const UsersView = lazy(() => import('./UsersView'));
const SiteSettingsView = lazy(() => import('./SiteSettingsView'));
const TagsView = lazy(() => import('./TagsView'));
const CategoriesView = lazy(() => import('./CategoriesView'));
const ThemesStoreView = lazy(() => import('./ThemesStoreView'));
const FriendLinksManager = lazy(() => import('./FriendLinksManager'));

export default function Dashboard() {
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [notifications, setNotifications] = useState([])
    const [username, setUsername] = useState('')
    const [showEditor, setShowEditor] = useState(false)
    const [loading, setLoading] = useState(true)
    const [articles, setArticles] = useState(null)
    const [editingArticle, setEditingArticle] = useState(null)
    const [stats, setStats] = useState([])
    const [quickActions, setQuickActions] = useState([])
    const [sidebarMenu, setSidebarMenu] = useState([])
    const [shouldRefresh, setShouldRefresh] = useState(false)

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await apiClient.get('/user/status')

                if (response.code === 200 && response.data.loggedIn) {
                    setUsername(response.data.username || '')
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

    // 移动端自动收缩侧边栏
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 获取文章列表
    useEffect(() => {
        const fetchArticles = async () => {
            if (activeTab === 'articles' && username) {
                try {
                    const response = await apiClient.get('/getarticlelist', {
                        params: { page: 1, size: 10 }
                    })
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
    }, [activeTab, username, shouldRefresh])
    useEffect(() => {
        const loadDashboardData = async () => {
            if (!loading && username) {
                try {
                    const data = await fetchDashboardData();
                    setQuickActions(data.quickActions || []);
                    setSidebarMenu(data.sidebarMenu || []);
                } catch (error) {
                    console.error('加载仪表盘数据失败:', error);
                    setQuickActions([]);
                    setSidebarMenu([]);
                }
            }
        };

        loadDashboardData();
    }, [loading, username]);

    useEffect(() => {
        const loadStatistics = async () => {
            if (activeTab === 'dashboard' && username) {
                try {
                    const data = await fetchStatistics();
                    setStats(data.stats);
                } catch (error) {
                    console.error('加载统计数据失败:', error);
                    setStats([
                        { label: '总文章数', value: 0, icon: 'article' },
                        { label: '总用户数', value: 0, icon: 'user' },
                        { label: '总评论数', value: 0, icon: 'comment' },
                        { label: '总访问量', value: 0, icon: 'view' }
                    ]);
                }
            }
        };

        loadStatistics();
    }, [activeTab, username]);

    useEffect(() => {
        const unreadCount = notifications.filter(n => n && !n.read).length
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) Dashboard`
        } else {
            document.title = 'Dashboard'
        }
    }, [notifications])

    useEffect(() => {
        const handlePopState = () => {
            const path = location.pathname
            if (path.startsWith('/dashboard/')) {
                const segments = path.split('/')
                if (segments.length >= 3) {
                    setActiveTab(segments[2])
                }
            } else if (path === '/dashboard') {
                setActiveTab('dashboard')
            }

            if (!path.includes('/dashboard/articles/') || path === '/dashboard/articles') {
                setShowEditor(false);
                setEditingArticle(null);
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [location]);

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

        if (!path.includes('/dashboard/articles/') || path === '/dashboard/articles') {
            setShowEditor(false);
            setEditingArticle(null);
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

    const handleImportArticle = (articleData) => {
        console.log('父组件收到导入数据:', articleData);
        setEditingArticle(articleData);
        setShowEditor(true);
    };

    const handleEditorSave = (articleData) => {
        console.log('保存文章:', articleData);
        setShowEditor(false);
        setEditingArticle(null);

        setShouldRefresh(prev => !prev);
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
                                    onNewArticle={() => {
                                        setEditingArticle(null);
                                        setShowEditor(true);
                                    }}
                                    onEditArticle={handleEditArticle}
                                    onImportArticle={handleImportArticle}
                                    articles={articles}
                                    shouldRefresh={shouldRefresh}
                                    setShouldRefresh={setShouldRefresh}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'profile' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <ProfileView />
                            </Suspense>
                        )}

                        {activeTab === 'comments' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <CommentsView />
                            </Suspense>
                        )}

                        {activeTab === 'articlesreview' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <ArticlesReview />
                            </Suspense>
                        )}

                        {activeTab === 'friendlinks' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <FriendLinksManager />
                            </Suspense>
                        )}

                        {activeTab === 'menus' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <MenusView />
                            </Suspense>
                        )}

                        {activeTab === 'users' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <UsersView />
                            </Suspense>
                        )}

                        {activeTab === 'settings' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <SiteSettingsView />
                            </Suspense>
                        )}
                        {activeTab === 'tags' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <TagsView />
                            </Suspense>
                        )}

                        {activeTab === 'categories' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <CategoriesView />
                            </Suspense>
                        )}

                        {activeTab === 'themes' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <ThemesStoreView />
                            </Suspense>
                        )}

                        {activeTab === 'custom-pages' && (
                            <Suspense fallback={<div>加载中...</div>}>
                                <CustomPageManager />
                            </Suspense>
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
