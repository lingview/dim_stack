import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Favicon from 'react-favicon'
import Home from './pages/Home'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from "./components/dashboard/Dashboard.jsx";
import ArticleReader from './components/ArticleReader'
import { fetchSiteName, fetchSiteIcon } from './Api.jsx'
import { getConfig } from './utils/config.jsx'
import FriendLinks from "./components/FriendLinks.jsx";
import PageNotFound from "./components/PageNotFound.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";

function App() {
    const [faviconUrl, setFaviconUrl] = useState('/favicon.ico')

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

    console.log('当前faviconUrl状态:', faviconUrl);

    return (
        <>
            <Favicon url={faviconUrl} animated={false} />
            <Routes>
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<Home />} />
                <Route path="/category/:categoryName" element={<Home />} />
                <Route path="/tag/:tagName" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/article/:articleId" element={<ArticleReader />} />
                <Route path="/friend-links" element={<FriendLinks />}></Route>
                <Route path="*" element={<PageNotFound />} />

            </Routes>
        </>
    )
}

export default App
