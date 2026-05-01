import { createRoot } from 'react-dom/client';
import React, { useEffect } from 'react';
import { XCircle, AlertTriangle, Info } from 'lucide-react';

let toastContainer = null;
let toastRoot = null;
let toasts = [];

const ToastItem = ({ message, type = 'error', onClose, duration = 3000 }) => {
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
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg ${bgColors[type]} ${textColors[type]}`}
            style={{
                animation: 'slide-in-down 0.3s ease-out',
                transform: 'translateY(0)',
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
                @keyframes slide-in-down {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

const updateToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position: fixed; top: 16px; right: 16px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; gap: 12px;';
    document.body.appendChild(toastContainer);
    toastRoot = createRoot(toastContainer);
  }

  toastRoot.render(
    React.createElement(React.Fragment, null,
      toasts.map((toast) => (
        React.createElement(ToastItem, {
          key: toast.id,
          message: toast.message,
          type: toast.type,
          onClose: () => removeToast(toast.id),
          duration: toast.duration
        })
      ))
    )
  );
};

const removeToast = (id) => {
  toasts = toasts.filter(t => t.id !== id);
  updateToastContainer();
  
  if (toasts.length === 0 && toastContainer) {
    setTimeout(() => {
      if (toasts.length === 0) {
        toastRoot.unmount();
        document.body.removeChild(toastContainer);
        toastContainer = null;
        toastRoot = null;
      }
    }, 300);
  }
};

export const showToast = (message, type = 'info', duration = 3000) => {
  if (typeof message === 'object') {
    const { message: msg, type: t = 'info', duration: d = 3000 } = message;
    message = msg;
    type = t;
    duration = d;
  }
  const id = Date.now() + Math.random();
  toasts.push({ id, message, type, duration });
  updateToastContainer();
};
