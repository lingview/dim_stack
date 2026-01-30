import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react';
import apiClient from '../../utils/axios.jsx';

import { fetchStatistics, fetchDashboardData } from '../../Api.jsx';
import CustomPageManager from "./CustomPageManager.jsx";

import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

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
const UpdateManager = lazy(() => import('./UpdateManager'));

const FadeIn = ({ children, duration = 200 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = requestAnimationFrame(() => {
            setIsVisible(true);
        });
        return () => cancelAnimationFrame(timer);
    }, []);

    return (
        <div
            className="transition-opacity ease-in-out"
            style={{
                opacity: isVisible ? 1 : 0,
                transitionDuration: `${duration}ms`
            }}
        >
            {children}
        </div>
    );
};

// 简单的加载提示
const SimpleLoading = () => (
    <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

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
                <FadeIn>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">验证登录状态中...</p>
                    </div>
                </FadeIn>
            </div>
        )
    }

    if (!username) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 transition-colors duration-200">
            <div className="flex h-screen relative">
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onClose={() => setSidebarOpen(false)}
                    username={username}
                    menuItems={sidebarMenu}
                />

                <div className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
                    <DashboardHeader
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        sidebarOpen={sidebarOpen}
                        username={username}
                        onLogout={handleLogout}
                        showNewArticleButton={activeTab === 'articles'}
                        onNewArticle={() => setShowEditor(true)}
                    />

                    <main className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'dashboard' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <DashboardView
                                        stats={stats}
                                        quickActions={quickActions}
                                        notifications={notifications}
                                        onMarkAsRead={handleMarkAsRead}
                                        onMarkAllAsRead={handleMarkAllAsRead}
                                    />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'articles' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
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
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'profile' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <ProfileView />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'comments' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <CommentsView />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'articlesreview' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <ArticlesReview />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'friendlinks' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <FriendLinksManager />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'menus' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <MenusView />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'users' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <UsersView />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'settings' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <SiteSettingsView />
                                </FadeIn>
                            </Suspense>
                        )}
                        {activeTab === 'tags' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <TagsView />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'categories' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <CategoriesView />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'themes' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <ThemesStoreView />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'custom-pages' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <CustomPageManager />
                                </FadeIn>
                            </Suspense>
                        )}

                        {activeTab === 'update' && (
                            <Suspense fallback={<SimpleLoading />}>
                                <FadeIn>
                                    <UpdateManager />
                                </FadeIn>
                            </Suspense>
                        )}
                    </main>
                </div>
            </div>

            {showEditor && (
                <Suspense fallback={<div className="fixed inset-0 z-50 bg-white flex items-center justify-center">加载编辑器中...</div>}>
                    <FadeIn duration={250}>
                        <MarkdownEditor
                            onSave={handleEditorSave}
                            onCancel={handleEditorCancel}
                            initialData={editingArticle}
                        />
                    </FadeIn>
                </Suspense>
            )}
        </div>
    )
}