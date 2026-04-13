import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../utils/axios';
import Header from './Header';
import Hero from './Hero';
import CategorySidebar from './CategorySidebar';
import TagSidebar from './TagSidebar';
import RecommendedArticles from './RecommendedArticles';
import PageNotFound from './PageNotFound';

const CustomHtmlPage = () => {
    const { alias } = useParams();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalHeadCode, setGlobalHeadCode] = useState('');
    const [footerCode, setFooterCode] = useState('');
    const [copyright, setCopyright] = useState('');
    const [icpRecord, setIcpRecord] = useState('');
    const [mpsRecord, setMpsRecord] = useState('');

    const iframeRef = useRef(null);

    useEffect(() => {
        if (alias) {
            loadPage();
        } else {
            setError('页面参数缺失');
        }
        loadSiteInfo();
    }, [alias]);

    const loadPage = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.get(`/custom-pages/${alias}`);

            if (response.code === 200 && response.data) {
                setPageData(response.data);
            } else {
                setError(response.message || '获取页面失败');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || '加载失败');
        } finally {
            setLoading(false);
        }
    };

    const loadSiteInfo = async () => {
        try {
            const globalHeadResponse = await apiClient.get('/site/global-head-code');
            if (globalHeadResponse?.data?.globalHeadCode) {
                setGlobalHeadCode(globalHeadResponse.data.globalHeadCode);
            }

            const footerResponse = await apiClient.get('/site/footer-code');
            if (footerResponse?.data?.footerCode) {
                setFooterCode(footerResponse.data.footerCode);
            }

            const copyrightResponse = await apiClient.get('/site/copyright');
            if (copyrightResponse) setCopyright(copyrightResponse);

            const icpResponse = await apiClient.get('/site/icp-record');
            if (icpResponse) setIcpRecord(icpResponse);

            const mpsResponse = await apiClient.get('/site/mps-record');
            if (mpsResponse) setMpsRecord(mpsResponse);
        } catch (error) {
            console.error('加载站点信息失败:', error);
        }
    };

    useEffect(() => {
        if (globalHeadCode) {
            const container = document.createElement('div');
            container.innerHTML = globalHeadCode;
            
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                newScript.textContent = script.textContent;
                document.head.appendChild(newScript);
            });

            const styles = container.querySelectorAll('style');
            styles.forEach(style => {
                const newStyle = document.createElement('style');
                Array.from(style.attributes).forEach(attr => {
                    newStyle.setAttribute(attr.name, attr.value);
                });
                newStyle.textContent = style.textContent;
                document.head.appendChild(newStyle);
            });

            const otherElements = container.querySelectorAll(':not(script):not(style)');
            otherElements.forEach(element => {
                if (element.parentElement === container) {
                    document.head.appendChild(element.cloneNode(true));
                }
            });
        }
    }, [globalHeadCode]);

    useEffect(() => {
        if (!pageData || !iframeRef.current) return;

        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        let fullHtml = pageData.pageCode || '';

        if (!fullHtml.toLowerCase().includes('<!doctype') && !fullHtml.toLowerCase().includes('<html')) {
            const cssContent = pageData.css ? `<style>${pageData.css}</style>` : '';
            const jsContent = pageData.js ? `<script>${pageData.js}</script>` : '';

            fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自定义页面</title>
    ${cssContent}
</head>
<body>
    ${fullHtml}
    ${jsContent}
</body>
</html>`;
        }

        iframeDoc.open();
        iframeDoc.write(fullHtml);
        iframeDoc.close();

        const adjustIframeHeight = () => {
            try {
                const body = iframeDoc.body;
                const html = iframeDoc.documentElement;
                const height = Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.clientHeight,
                    html.scrollHeight,
                    html.offsetHeight
                );
                iframe.style.height = height + 'px';
            } catch (e) {
                console.warn('无法调整 iframe 高度:', e);
            }
        };

        setTimeout(adjustIframeHeight, 100);

        const observer = new MutationObserver(adjustIframeHeight);
        observer.observe(iframeDoc.body, {
            childList: true,
            subtree: true,
            attributes: true
        });

        window.addEventListener('resize', adjustIframeHeight);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', adjustIframeHeight);
        };
    }, [pageData]);

    if (loading) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="pt-20">
                    <Hero />
                    <div className="py-8">
                        <main className="container mx-auto px-4">
                            <div className="flex justify-center items-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                                    <p className="text-gray-600">加载中...</p>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <PageNotFound />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="pt-20">
                <Hero />
                <div className="py-8">
                    <main className="max-w-310 mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                    <iframe
                                        ref={iframeRef}
                                        className="w-full border-0"
                                        style={{
                                            minHeight: '400px',
                                            display: 'block'
                                        }}
                                        title="自定义页面内容"
                                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                                    />
                                </div>
                            </div>
                            <div className="lg:w-77.5 shrink-0">
                                <div className="sticky top-28 space-y-4">
                                    <CategorySidebar />
                                    <TagSidebar />
                                    <RecommendedArticles />
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <footer className="bg-white mt-auto">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-gray-600">
                        <p>{copyright}</p>
                        {icpRecord && (
                            <p className="mt-2">
                                <a
                                    href="https://beian.miit.gov.cn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-blue-600 text-sm"
                                >
                                    {icpRecord}
                                </a>
                            </p>
                        )}
                        {mpsRecord && (
                            <p className="mt-1">
                                <a
                                    href="http://www.beian.gov.cn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-blue-600 text-sm"
                                >
                                    {mpsRecord}
                                </a>
                            </p>
                        )}
                        {footerCode && (
                            <div dangerouslySetInnerHTML={{ __html: footerCode }} />
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CustomHtmlPage;