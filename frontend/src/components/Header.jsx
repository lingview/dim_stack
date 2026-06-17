import ThemeToggle from './ThemeToggle'
import Search from './Search'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import apiClient from '../utils/axios.jsx'
import { getConfig } from '../utils/config';

const computeVisibleCount = (containerWidth, itemWidths, gap, moreWidth) => {
    if (!itemWidths.length) return 0;

    let total = 0;
    for (let i = 0; i < itemWidths.length; i++) {
        total += itemWidths[i] + (i > 0 ? gap : 0);
    }
    if (total <= containerWidth) return itemWidths.length;

    let used = 0;
    let count = 0;
    for (let i = 0; i < itemWidths.length; i++) {
        const add = itemWidths[i] + (i > 0 ? gap : 0);
        if (used + add + gap + moreWidth <= containerWidth) {
            used += add;
            count++;
        } else {
            break;
        }
    }
    return count;
};

const escapeHtml = (unsafe) => {
    if (!unsafe) return unsafe;

    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const getFullImageUrl = (url) => {
    if (!url) return null;

    const config = getConfig();
    return config.getFullUrl(url);
};

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [avatar, setAvatar] = useState('')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [siteName, setSiteName] = useState('')
    const [menus, setMenus] = useState([])
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [visibleCount, setVisibleCount] = useState(0)
    const [itemWidths, setItemWidths] = useState([])
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
    const navContainerRef = useRef(null)
    const measureRef = useRef(null)

    const NAV_GAP = 32
    const MORE_BTN_WIDTH = 88

    useEffect(() => {
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const storedUsername = localStorage.getItem('username') || '';
        const storedAvatar = localStorage.getItem('avatar') || '';

        setIsLoggedIn(storedIsLoggedIn);
        setUsername(storedUsername);
        setAvatar(getFullImageUrl(storedAvatar) || '');
    }, []);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await apiClient.get('/user/status')

                if (response.code === 200 && response.data.loggedIn) {
                    setIsLoggedIn(true)
                    setUsername(escapeHtml(response.data.username) || '')
                    setAvatar(getFullImageUrl(response.data.avatar) || '')

                    localStorage.setItem('isLoggedIn', 'true')
                    localStorage.setItem('username', response.data.username || '')
                    localStorage.setItem('avatar', response.data.avatar || '')
                } else {
                    setIsLoggedIn(false)
                    setUsername('')
                    setAvatar('')
                    localStorage.removeItem('isLoggedIn')
                    localStorage.removeItem('username')
                    localStorage.removeItem('avatar')
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
                    setSiteName(escapeHtml(response) || '')
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

    useEffect(() => {
        if (!measureRef.current) return;
        const lis = measureRef.current.querySelectorAll('li');
        const widths = Array.from(lis).map((li) => li.offsetWidth);
        setItemWidths(widths);
    }, [menus]);

    useEffect(() => {
        const el = navContainerRef.current;
        if (!el || itemWidths.length === 0) {
            setVisibleCount(menus.length);
            return;
        }

        const recompute = () => {
            const count = computeVisibleCount(
                el.clientWidth,
                itemWidths,
                NAV_GAP,
                MORE_BTN_WIDTH
            );
            setVisibleCount(count);
        };

        recompute();
        const observer = new ResizeObserver(recompute);
        observer.observe(el);
        return () => observer.disconnect();
    }, [itemWidths, menus.length]);

    const handleLogout = async () => {
        try {
            await apiClient.post('/logout')
        } catch (error) {
            console.error('登出请求失败:', error)
        } finally {
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('username')
            localStorage.removeItem('avatar')
            setIsLoggedIn(false)
            setUsername('')
            setAvatar('')
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
            if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
                setIsUserMenuOpen(false)
            }
            if (isMoreMenuOpen && !event.target.closest('.more-menu-container')) {
                setIsMoreMenuOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isMobileMenuOpen, isUserMenuOpen, isMoreMenuOpen])

    const effectiveVisible = itemWidths.length === 0 ? menus.length : visibleCount;

    return (
        <header className="bg-white shadow border-b border-gray-200 fixed top-0 left-0 right-0 z-50" style={{ height: '64px' }}>
            <div className="container mx-auto px-4 h-full">
                <div className="flex justify-between items-center h-full relative z-50">
                    <div className="flex items-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-blue-400 truncate max-w-[200px] sm:max-w-none">
                            {siteName}
                        </h1>
                    </div>

                    <nav
                        ref={navContainerRef}
                        className="hidden md:flex flex-1 min-w-0 items-center justify-center mx-6"
                    >
                        <ul className="flex items-center space-x-8 min-w-0">
                            {menus.slice(0, effectiveVisible).map((menu, index) => (
                                <li key={menu.menus_id || index}>
                                    {menu.menus_url.startsWith('/') && !menu.menus_url.startsWith('//') ? (
                                        <button
                                            onClick={() => {
                                                navigate(menu.menus_url);
                                                closeMobileMenu();
                                            }}
                                            className="text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 text-left whitespace-nowrap"
                                        >
                                            {menu.menus_name}
                                        </button>
                                    ) : (
                                        <a
                                            href={menu.menus_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap"
                                        >
                                            {menu.menus_name}
                                        </a>
                                    )}
                                </li>
                            ))}

                            {effectiveVisible < menus.length && (
                                <li className="relative more-menu-container">
                                    <button
                                        onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                        className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap"
                                        aria-haspopup="true"
                                        aria-expanded={isMoreMenuOpen}
                                    >
                                        <span>更多</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-4 w-4 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`}
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    <div className={`absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden transition-all duration-200 z-50 border border-gray-200 ${
                                        isMoreMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                                    }`}>
                                        {menus.slice(effectiveVisible).map((menu, index) => (
                                            menu.menus_url.startsWith('/') && !menu.menus_url.startsWith('//') ? (
                                                <button
                                                    key={menu.menus_id || index}
                                                    onClick={() => {
                                                        navigate(menu.menus_url);
                                                        closeMobileMenu();
                                                        setIsMoreMenuOpen(false);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
                                                >
                                                    {menu.menus_name}
                                                </button>
                                            ) : (
                                                <a
                                                    key={menu.menus_id || index}
                                                    href={menu.menus_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => setIsMoreMenuOpen(false)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
                                                >
                                                    {menu.menus_name}
                                                </a>
                                            )
                                        ))}
                                    </div>
                                </li>
                            )}
                        </ul>
                    </nav>

                    <ul
                        ref={measureRef}
                        aria-hidden="true"
                        className="flex items-center invisible pointer-events-none absolute -left-[9999px] top-0"
                    >
                        {menus.map((menu, index) => (
                            <li
                                key={menu.menus_id || index}
                                className="font-medium whitespace-nowrap"
                            >
                                {menu.menus_name}
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Search />
                        <ThemeToggle />

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

                        {isLoggedIn ? (
                            <div 
                                className="relative group user-menu-container hidden md:flex items-center space-x-3"
                                onMouseEnter={() => setIsUserMenuOpen(true)}
                                onMouseLeave={() => setIsUserMenuOpen(false)}
                            >
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-3 focus:outline-none"
                                >
                                    {avatar && (
                                        <img
                                            src={avatar}
                                            alt={username}
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/default_avatar.png';
                                            }}
                                        />
                                    )}
                                    <span className="text-gray-700 cursor-pointer truncate max-w-[120px]" title={username}>
                                        欢迎, {username}
                                    </span>
                                </button>
                                <div className={`absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden transition-all duration-200 z-50 border border-gray-200 ${
                                    isUserMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                                }`}>
                                    <button
                                        onClick={() => {
                                            navigate('/dashboard')
                                            closeMobileMenu()
                                            setIsUserMenuOpen(false)
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

                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 ${
                        isMobileMenuOpen ? 'max-h-[80vh] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
                    }`}
                    style={{ zIndex: 40 }}
                >
                    <nav className="px-4 py-3">
                        {isLoggedIn && (
                            <div className="mb-4 pb-3 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    {avatar && (
                                        <img
                                            src={avatar}
                                            alt={username}
                                            className="w-10 h-10 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/default_avatar.png';
                                            }}
                                        />
                                    )}
                                    <span className="text-sm text-gray-600 font-medium truncate">
                                        欢迎, {username}
                                    </span>
                                </div>
                            </div>
                        )}

                        {menus.length > 0 && (
                            <ul className="space-y-1 mb-4">
                                {menus.map((menu, index) => (
                                    <li key={menu.menus_id || index}>
                                        {menu.menus_url.startsWith('/') && !menu.menus_url.startsWith('//') ? (
                                            <button
                                                onClick={() => {
                                                    navigate(menu.menus_url);
                                                    closeMobileMenu();
                                                }}
                                                className="block w-full text-left py-3 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200 rounded-lg mobile-menu-link"
                                            >
                                                {menu.menus_name}
                                            </button>
                                        ) : (
                                            <a
                                                href={menu.menus_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block py-3 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200 rounded-lg mobile-menu-link"
                                                onClick={closeMobileMenu}
                                            >
                                                {menu.menus_name}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

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
                                        className="w-full py-3 px-2 text-left text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200 rounded-lg mobile-menu-link"
                                    >
                                        进入控制台
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-3 px-2 text-left text-red-600 hover:text-red-700 hover:bg-red-50 font-medium transition-all duration-200 rounded-lg mobile-menu-link-logout"
                                    >
                                        登出
                                    </button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </div>

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