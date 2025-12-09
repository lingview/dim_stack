import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const PageNotFound = () => {
    const [countdown, setCountdown] = useState(3);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="flex bg-gray-50 flex-col min-h-screen">
            <Header />
            <div className="pt-20 flex-grow">
                <main className="container mx-auto px-4 py-8">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">页面未找到</h2>
                            <p className="text-gray-600 mb-2">您访问的页面不存在或已被移除</p>
                            <p className="text-gray-600 mb-8">
                                将在 <span className="font-bold text-blue-600">{countdown}</span> 秒后自动回到首页
                            </p>

                            <button
                                onClick={handleGoHome}
                                className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                立即前往首页
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PageNotFound;
