import { fakeData } from '../Api.jsx'
import ThemeToggle from './ThemeToggle'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')

    // 检查登录状态
    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
        const user = localStorage.getItem('username')
        setIsLoggedIn(loggedIn)
        setUsername(user || '')
    }, [location])

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('username')
        setIsLoggedIn(false)
        setUsername('')
        navigate('/login')
    }

    return (
        <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-200 border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-blue-400">{fakeData.siteInfo.title}</h1>
                    </div>

                    <nav className="hidden md:block">
                        <ul className="flex space-x-8">
                            {fakeData.navItems.map((item) => (
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
                        <button className="md:hidden text-gray-600 dark:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {isLoggedIn ? (
                            <div className="relative group flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300 hidden md:inline cursor-pointer">
                  欢迎, {username}
                </span>
                                {/* 下拉菜单 */}
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                                    <button
                                        onClick={() => {
                                            navigate('/dashboard');
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
                                onClick={() => navigate('/login')}
                                className="hidden md:block bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-200"
                            >
                                登录
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
