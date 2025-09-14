import ThemeToggle from './ThemeToggle'
import Search from './Search'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import apiClient from '../utils/axios.jsx'

const escapeHtml = (unsafe) => {
    if (!unsafe) return unsafe;

    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [siteName, setSiteName] = useState('次元栈 - Dim Stack')
    const [menus, setMenus] = useState([])

    // 检查登录状态
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await apiClient.get('/user/status')

                if (response && response.loggedIn) {
                    setIsLoggedIn(true)
                    setUsername(escapeHtml(response.username) || '')

                    localStorage.setItem('isLoggedIn', 'true')
                    localStorage.setItem('username', response.username || '')
                } else {
                    setIsLoggedIn(false)
                    setUsername('')
                    localStorage.removeItem('isLoggedIn')
                    localStorage.removeItem('username')
                }
            } catch (error) {
                setIsLoggedIn(false)
                setUsername('')
                localStorage.removeItem('isLoggedIn')
                localStorage.removeItem('username')
                console.error('验证登录状态失败:', error)
            }
        }

        checkLoginStatus()
    }, [location])

    // 获取站点名称
    useEffect(() => {
        const fetchSiteName = async () => {
            try {
                const response = await apiClient.get('/site/name')
                if (response) {
                    setSiteName(escapeHtml(response) || '次元栈 - Dim Stack')
                }
            } catch (error) {
                console.error('获取站点名称失败:', error)
            }
        }

        fetchSiteName()
    }, [])

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await apiClient.get('/frontendgetmenus')
                if (response && Array.isArray(response)) {
                    const escapedMenus = response.map(menu => ({
                        ...menu,
                        menus_name: escapeHtml(menu.menus_name) || '',
                        menus_url: escapeHtml(menu.menus_url) || ''
                    }));
                    setMenus(escapedMenus)
                }
            } catch (error) {
                console.error('获取菜单数据失败:', error)
                setMenus([])
            }
        }

        fetchMenus()
    }, [])

    const handleLogout = async () => {
        try {
            await apiClient.post('/logout')
        } catch (error) {
            console.error('登出请求失败:', error)
        } finally {
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('username')
            setIsLoggedIn(false)
            setUsername('')
            navigate('/login')
            setIsMobileMenuOpen(false)
        }
    }

    const toggleMobileMenu = () => {
        console.log('移动端菜单点击事件触发:', !isMobileMenuOpen)
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    // 点击页面其他地方关闭移动端菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && !event.target.closest('header')) {
                setIsMobileMenuOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isMobileMenuOpen])

    return (
        <header className="bg-white shadow border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4 relative z-50">
                    <div className="flex items-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-blue-400 truncate max-w-[200px] sm:max-w-none">
                            {siteName}
                        </h1>
                    </div>

                    {/* 桌面端导航 */}
                    <nav className="hidden md:block">
                        <ul className="flex space-x-8">
                            {menus.map((menu, index) => (
                                <li key={menu.menus_id || index}>
                                    <a
                                        href={menu.menus_url}
                                        className="text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                                    >
                                        {menu.menus_name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* 右侧操作区 */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Search />
                        <ThemeToggle />

                        {/* 移动端菜单按钮 - 始终显示 */}
                        <button
                            className="md:hidden relative z-50 p-2 rounded hover:bg-gray-100 transition-colors duration-200"
                            onClick={toggleMobileMenu}
                            aria-label={isMobileMenuOpen ? "关闭菜单" : "打开菜单"}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-6 w-6 text-gray-600 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {/* 桌面端登录/用户信息 */}
                        {isLoggedIn ? (
                            <div className="relative group hidden md:flex items-center space-x-4">
                                <span className="text-gray-700 cursor-pointer truncate max-w-[120px]" title={username}>
                                    欢迎, {username}
                                </span>
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 border border-gray-200">
                                    <button
                                        onClick={() => {
                                            navigate('/dashboard')
                                            closeMobileMenu()
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        进入控制台
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                                    >
                                        登出
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    navigate('/login')
                                    closeMobileMenu()
                                }}
                                className="hidden md:block bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-200"
                            >
                                登录
                            </button>
                        )}
                    </div>
                </div>

                {/* 移动端下拉菜单 - 始终可以显示 */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 ${
                        isMobileMenuOpen ? 'max-h-[80vh] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
                    }`}
                    style={{ zIndex: 40 }}
                >
                    <nav className="px-4 py-3">
                        {/* 已登录用户信息 */}
                        {isLoggedIn && (
                            <div className="mb-4 pb-3 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 font-medium truncate">
                                        欢迎, {username}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 导航菜单 - 无论登录状态都显示 */}
                        {menus.length > 0 && (
                            <ul className="space-y-1 mb-4">
                                {menus.map((menu, index) => (
                                    <li key={menu.menus_id || index}>
                                        <a
                                            href={menu.menus_url}
                                            className="block py-3 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200 rounded-lg"
                                            onClick={closeMobileMenu}
                                        >
                                            {menu.menus_name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* 用户操作按钮 */}
                        <div className="space-y-2 pt-3 border-t border-gray-200">
                            {!isLoggedIn ? (
                                <button
                                    onClick={() => {
                                        navigate('/login')
                                        closeMobileMenu()
                                    }}
                                    className="w-full py-3 bg-blue-400 hover:bg-blue-500 text-white px-4 rounded-lg transition-all duration-200 font-medium"
                                >
                                    登录
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            navigate('/dashboard')
                                            closeMobileMenu()
                                        }}
                                        className="w-full py-3 px-2 text-left text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200 rounded-lg"
                                    >
                                        进入控制台
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-3 px-2 text-left text-red-600 hover:text-red-700 hover:bg-red-50 font-medium transition-all duration-200 rounded-lg"
                                    >
                                        登出
                                    </button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </div>

            {/* 移动端菜单背景遮罩 */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm"
                    style={{ zIndex: 30 }}
                    onClick={closeMobileMenu}
                />
            )}
        </header>
    )
}