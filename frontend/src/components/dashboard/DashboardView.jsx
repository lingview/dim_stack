import { getIcon, getIconColor } from '../../utils/IconUtils';

export default function DashboardView({ stats, quickActions, notifications, onMarkAsRead, onMarkAllAsRead }) {
    if (!stats || !quickActions || !notifications) {
        return <div>加载中...</div>
    }

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
                        action && (
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
                        )
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
                        notification && (
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
                        )
                    ))}
                </div>
            </div>
        </div>
    )
}
