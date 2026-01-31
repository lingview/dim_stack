import { useState, useEffect, useRef, useCallback } from 'react';
import { getIcon, getIconColor } from '../../utils/IconUtils';
import { useNavigate } from 'react-router-dom';
import apiClient from "../../utils/axios.jsx";

export default function DashboardView({ stats, quickActions }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const observerTarget = useRef(null);

    const getSystematicNotifications = async (pageNum, pageSize, tab = 'all') => {
        const endpoints = {
            all: '/getsystematicNotification',
            unread: '/getUnreadNotifications',
            read: '/getReadNotifications'
        };
        return apiClient.get(endpoints[tab], {
            params: { pageNum, pageSize }
        });
    };

    const markNotificationAsRead = async (id) => {
        return apiClient.post('/readSystematicNotification', null, {
            params: { id }
        });
    };

    const deleteNotification = async (id) => {
        return apiClient.post('/deleteSystematicNotification', null, {
            params: { id }
        });
    };

    const loadNotifications = useCallback(async (page, isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await getSystematicNotifications(page, pageSize, activeTab);

            if (response.code === 200 && response.data && response.data.data) {
                const formattedNotifications = response.data.data.map(item => ({
                    id: item.id,
                    title: item.type || '系统通知',
                    content: item.content,
                    time: item.create_time || '未知时间',
                    read: item.status === 1,
                }));

                if (isLoadMore) {
                    setNotifications(prev => [...prev, ...formattedNotifications]);
                } else {
                    setNotifications(formattedNotifications);
                }

                const totalPages = response.data.total_pages || 0;
                setHasMore(page < totalPages);
            }
        } catch (error) {
            console.error('加载通知失败:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [pageSize, activeTab]);

    useEffect(() => {
        loadNotifications(1, false);
    }, []);

    useEffect(() => {
        setPageNum(1);
        setNotifications([]);
        loadNotifications(1, false);
    }, [activeTab]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    const nextPage = pageNum + 1;
                    setPageNum(nextPage);
                    loadNotifications(nextPage, true);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loadingMore, loading, pageNum, loadNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            const response = await markNotificationAsRead(id);
            if (response.code === 200) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === id ? { ...notif, read: true } : notif
                    )
                );
            } else {
                console.error('标记已读失败:', response.message);
            }
        } catch (error) {
            console.error('标记已读失败:', error);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            const response = await deleteNotification(id);
            if (response.code === 200) {
                setNotifications(prev => prev.filter(notif => notif.id !== id));
            } else {
                console.error('删除通知失败:', response.message);
            }
        } catch (error) {
            console.error('删除通知失败:', error);
        }
    };

    if (!stats || !quickActions) {
        return <div>加载中...</div>
    }

    const handleQuickActionClick = (link) => {
        if (link) {
            navigate(link);
        }
    };

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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        action && (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                onClick={() => handleQuickActionClick(action.link)}
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
                        )
                    ))}
                </div>
            </div>

            {/* 通知 */}
            <div className="notification-container bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="notification-title text-lg font-semibold text-gray-900">通知</h2>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                                activeTab === 'all'
                                    ? 'notification-tab-active bg-blue-500 text-white'
                                    : 'notification-tab bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            全部
                        </button>
                        <button
                            onClick={() => setActiveTab('unread')}
                            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                                activeTab === 'unread'
                                    ? 'notification-tab-active bg-blue-500 text-white'
                                    : 'notification-tab bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            未读
                        </button>
                        <button
                            onClick={() => setActiveTab('read')}
                            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                                activeTab === 'read'
                                    ? 'notification-tab-active bg-blue-500 text-white'
                                    : 'notification-tab bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            已读
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-8">加载中...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">暂无通知</div>
                ) : (
                    <div className="h-96 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item border border-gray-200 rounded-lg p-4 transition-colors duration-200 ${
                                        notification.read
                                            ? 'notification-item-read bg-white hover:bg-gray-50'
                                            : 'notification-item-unread bg-blue-50 hover:bg-blue-100'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="notification-item-title font-medium text-gray-900 text-sm">
                                                {notification.title}
                                            </h4>
                                            <p className="notification-item-content text-sm text-gray-500 mt-1">
                                                {notification.content}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <time className="notification-time text-xs text-gray-400">
                                                    {notification.time}
                                                </time>
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="notification-btn-read text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                                    >
                                                        标为已读
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteNotification(notification.id)}
                                                    className="notification-btn-delete text-xs text-red-600 hover:text-red-800 transition-colors duration-200"
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div ref={observerTarget} className="py-4">
                                {loadingMore && (
                                    <div className="text-center text-gray-500 text-sm">
                                        加载更多...
                                    </div>
                                )}
                                {!hasMore && notifications.length > 0 && (
                                    <div className="text-center text-gray-400 text-sm">
                                        没有更多通知了
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}