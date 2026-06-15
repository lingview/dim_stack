import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import Favicon from 'react-favicon'
import { fetchSiteName, fetchSiteIcon } from './Api.jsx'
import { getConfig } from './utils/config.jsx'
import MusicPlayer from './components/MusicPlayer';

const importArticleReader = () => import('./components/ArticleReader')

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./components/Login'))
const Register = lazy(() => import('./components/Register'))
const Dashboard = lazy(() => import('./components/dashboard/Dashboard.jsx'))
const ArticleReader = lazy(importArticleReader)
const FriendLinks = lazy(() => import('./components/FriendLinks.jsx'))
const PageNotFound = lazy(() => import('./components/PageNotFound.jsx'))
const ForgotPassword = lazy(() => import('./components/ForgotPassword.jsx'))
const CustomHtmlPage = lazy(() => import('./components/CustomHtmlPage.jsx'))

function App() {
    const [faviconUrl, setFaviconUrl] = useState('/favicon.ico')
    const location = useLocation()

    const isDashboardRoute = location.pathname.startsWith('/dashboard')

    useEffect(() => {
        const setDocumentTitle = async () => {
            try {
                const siteName = await fetchSiteName();
                console.log('获取站点名称:', siteName);
                document.title = siteName || '';
            } catch (error) {
                console.error('设置站点标题失败:', error);
                document.title = '';
            }
        };

        setDocumentTitle();
    }, []);

    useEffect(() => {
        const setSiteIcon = async () => {
            try {
                const iconUrl = await fetchSiteIcon();
                console.log('获取站点图标URL:', iconUrl);

                if (iconUrl) {
                    const config = getConfig();
                    const fullIconUrl = config.getFullUrl(iconUrl.trim());

                    console.log('处理后的图标URL:', fullIconUrl);
                    setFaviconUrl(fullIconUrl);
                } else {
                    console.log('未获取到站点图标，使用默认图标');
                }
            } catch (error) {
                console.error('设置站点图标失败:', error);
            }
        };

        setSiteIcon();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.requestIdleCallback) {
            const id = window.requestIdleCallback(() => importArticleReader(), { timeout: 2000 });
            return () => window.cancelIdleCallback?.(id);
        }
        const t = setTimeout(() => importArticleReader(), 1200);
        return () => clearTimeout(t);
    }, []);

    console.log('当前faviconUrl状态:', faviconUrl);

    return (
        <>
            <Favicon url={faviconUrl} animated={false} />
            <Suspense fallback={null}>
                <Routes>
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/category" element={<Home />} />
                    <Route path="/tag/:tagName" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route path="/article/:articleId" element={<ArticleReader />} />
                    <Route path="/friend-links" element={<FriendLinks />}></Route>
                    <Route path="*" element={<PageNotFound />} />
                    <Route path="/custom-page/:alias" element={<CustomHtmlPage />} />
                </Routes>
            </Suspense>
            {!isDashboardRoute && <MusicPlayer />}
        </>
    )
}

export default App