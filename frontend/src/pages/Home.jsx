import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ArticleList from "../components/ArticleList.jsx";
import CategorySidebar from '../components/CategorySidebar';
import TagSidebar from '../components/TagSidebar';
import RecommendedArticles from '../components/RecommendedArticles';
import ScriptAwareHtml from '../components/ScriptAwareHtml';

import apiClient from '../utils/axios';

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { tagName } = useParams();
    const categoryName = searchParams.get('category');

    const [copyright, setCopyright] = useState('');
    const [icpRecord, setIcpRecord] = useState('');
    const [mpsRecord, setMpsRecord] = useState('');
    const [globalHeadCode, setGlobalHeadCode] = useState('');
    const [footerCode, setFooterCode] = useState('');

    useEffect(() => {
        loadCopyright();
        loadSiteRecords();
        loadCodeInjection();
    }, []);

    const loadCopyright = async () => {
        try {
            const response = await apiClient.get('/site/copyright');
            if (response) setCopyright(response);
        } catch (error) {
            console.error('加载版权信息失败:', error);
        }
    };

    const loadSiteRecords = async () => {
        try {
            const icpResponse = await apiClient.get('/site/icp-record');
            if (icpResponse) setIcpRecord(icpResponse);

            const mpsResponse = await apiClient.get('/site/mps-record');
            if (mpsResponse) setMpsRecord(mpsResponse);
        } catch (error) {
            console.error('加载备案信息失败:', error);
        }
    };

    const loadCodeInjection = async () => {
        try {
            const globalHeadResponse = await apiClient.get('/site/global-head-code');
            if (globalHeadResponse?.data?.globalHeadCode) {
                setGlobalHeadCode(globalHeadResponse.data.globalHeadCode);
            }

            const footerResponse = await apiClient.get('/site/footer-code');
            if (footerResponse?.data?.footerCode) {
                setFooterCode(footerResponse.data.footerCode);
            }
        } catch (error) {
            console.error('加载代码注入配置失败:', error);
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

    const handleCategoryChange = (category) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('category', category);
        newParams.delete('page');
        setSearchParams(newParams);
    };

    return (
        <div className="flex bg-gray-50 flex-col min-h-screen">
            <Header />

            <div className="grow" style={{ paddingTop: '64px' }}>
                <Hero />

                <main className="max-w-310 mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <ArticleList />

                        <div className="lg:w-77.5 shrink-0">
                            <div className="sticky top-28 space-y-4">
                                <CategorySidebar
                                    onCategorySelect={handleCategoryChange}
                                    selectedCategory={categoryName}
                                />
                                <TagSidebar selectedTag={tagName} />
                                <RecommendedArticles />
                            </div>
                        </div>
                    </div>
                </main>
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
                        {footerCode && <ScriptAwareHtml html={footerCode} />}
                    </div>
                </div>
            </footer>
        </div>
    );
}