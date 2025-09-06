import ThemeToggle from './ThemeToggle'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import apiClient from '../utils/axios.jsx'

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [siteName, setSiteName] = useState('次元栈 - Dim Stack')

    // 检查登录状态
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await apiClient.get('/user/status')

                if (response && response.loggedIn) {
                    setIsLoggedIn(true)
                    setUsername(response.username || '')

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
                    setSiteName(response)
                }
            } catch (error) {
                console.error('获取站点名称失败:', error)
            }
        }

        fetchSiteName()
    }, [])

    const handleLogout = async () => {
        try {
            await apiClient.post('/user/logout')
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

    return (
        <header className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4 relative z-50">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-blue-400">{siteName}</h1>
                    </div>

                    <nav className="hidden md:block">
                        <ul className="flex space-x-8">
                            {[
                                { id: 1, name: '首页', href: '/' },
                                { id: 2, name: 'Vsinger', href: '/category/vsinger' },
                                { id: 3, name: '音乐', href: '/category/music' },
                                { id: 4, name: '关于', href: '/about' },
                            ].map((item) => (
                                <li key={item.id}>
                                    <a
                                        href={item.href}
                                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <ThemeToggle />

                        {/* 移动端菜单按钮 */}
                        <button
                            className="md:hidden relative z-50 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                            onClick={toggleMobileMenu}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-600 dark:text-gray-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* 登录/用户下拉 */}
                        {isLoggedIn ? (
                            <div className="relative group flex items-center space-x-4">
                                <span className="text-gray-700 dark:text-gray-300 hidden md:inline cursor-pointer">
                                    欢迎, {username}
                                </span>
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                                    <button
                                        onClick={() => {
                                            navigate('/dashboard')
                                            closeMobileMenu()
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        进入控制台
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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

                {/* 移动端菜单 */}
                <div
                    className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out absolute top-full left-0 w-full bg-white dark:bg-gray-800 z-40 ${
                        isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <nav className="border-t border-gray-200 dark:border-gray-700 pt-4 px-4">
                        <ul className="space-y-3">
                            {[
                                { id: 1, name: '首页', href: '/' },
                                { id: 2, name: 'Vsinger', href: '/category/vsinger' },
                                { id: 3, name: '音乐', href: '/category/music' },
                                { id: 4, name: '关于', href: '/about' },
                            ].map((item) => (
                                <li key={item.id}>
                                    <a
                                        href={item.href}
                                        className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                                        onClick={closeMobileMenu}
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                            {!isLoggedIn && (
                                <li>
                                    <button
                                        onClick={() => {
                                            navigate('/login')
                                            closeMobileMenu()
                                        }}
                                        className="w-full text-left py-2 bg-blue-400 hover:bg-blue-500 text-white px-4 rounded-lg transition-all duration-200"
                                    >
                                        登录
                                    </button>
                                </li>
                            )}
                            {isLoggedIn && (
                                <>
                                    <li>
                                        <button
                                            onClick={() => {
                                                navigate('/dashboard')
                                                closeMobileMenu()
                                            }}
                                            className="w-full text-left py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                                        >
                                            进入控制台
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                                        >
                                            登出
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    )
}
