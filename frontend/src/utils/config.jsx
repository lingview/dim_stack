const isDevelopment = import.meta.env.DEV;
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://192.168.1.6:2222';

export const getConfig = () => ({
    isDevelopment,
    backendUrl,
    getFullUrl: (url) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        if (url.startsWith('/')) {
            if (isDevelopment) {
                return `${backendUrl}${url}`;
            } else {
                return `${window.location.origin}${url}`;
            }
        }

        return url;
    }
});
