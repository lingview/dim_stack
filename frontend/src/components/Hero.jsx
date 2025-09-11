import React, { useEffect, useState } from 'react';
import apiClient from '../utils/axios';
import {getConfig} from "../utils/config.jsx";

export default function Hero() {
    const [heroData, setHeroData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHeroData();
    }, []);

    const fetchHeroData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/site/hero');
            setHeroData(response);
        } catch (err) {
            console.error('获取首页数据失败:', err);
            setError('获取首页数据失败');
        } finally {
            setLoading(false);
        }
    };

    const getFullImageUrl = (url) => {
        if (!url) return null;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        try {
            const config = getConfig();
            return config.getFullUrl(url);
        } catch (error) {
            if (url.startsWith('/')) {
                return url;
            }

            return `/upload/${url}`;
        }
    };

    if (loading) {
        return (
            <div className="relative bg-gray-900">
                <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
                <div className="relative container mx-auto px-4 py-24 md:py-32">
                    <div className="max-w-2xl">
                        <div className="h-12 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !heroData) {
        return (
            <div className="relative bg-gray-900">
                <div className="absolute inset-0 bg-gray-800"></div>
                <div className="relative container mx-auto px-4 py-24 md:py-32">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            欢迎来到站点
                        </h1>
                    </div>
                </div>
            </div>
        );
    }

    const imageUrl = getFullImageUrl(heroData.image);

    return (
        <div className="relative bg-gray-900">
            <div className="absolute inset-0">
                {imageUrl ? (
                    <img
                        className="w-full h-full object-cover"
                        src={imageUrl}
                        alt="头图"
                        onError={(e) => {
                            e.target.src = '/image_error.svg';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-white">图片加载失败</span>
                    </div>
                )}
            </div>

            <div className="relative container mx-auto px-4 py-24 md:py-32">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {heroData.title}
                    </h1>
                    {heroData.subtitle && (
                        <p className="text-xl text-gray-200 mb-8">
                            {heroData.subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
