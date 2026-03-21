import React, { useEffect } from 'react';
import { XCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const bgColors = {
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200'
    };

    const textColors = {
        error: 'text-red-800',
        warning: 'text-yellow-800',
        info: 'text-blue-800'
    };

    return (
        <div 
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg ${bgColors[type]} ${textColors[type]}`}
            style={{
                animation: 'slide-in-right 0.3s ease-out',
                transform: 'translateX(0)',
                opacity: 1
            }}
        >
            {icons[type]}
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={onClose}
                className="ml-2 hover:opacity-70 transition-opacity"
                aria-label="关闭"
            >
                <XCircle className="w-4 h-4" />
            </button>
            <style>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default Toast;
