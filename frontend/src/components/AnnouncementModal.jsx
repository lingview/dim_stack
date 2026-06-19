import { useState, useEffect } from 'react';
import apiClient from '../utils/axios.jsx';
import DOMPurify from 'dompurify';

const ANNOUNCEMENT_KEY = 'announcement_dismissed_at';

export default function AnnouncementModal() {
    const [visible, setVisible] = useState(false);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dismissedAt = localStorage.getItem(ANNOUNCEMENT_KEY);

        apiClient.get('/announcement', { silent: true })
            .then((response) => {
                const data = response.data || response;
                if (data && data.content && data.update_time) {
                    if (dismissedAt !== data.update_time) {
                        setContent(data.content);
                        setVisible(true);
                    }
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleClose = () => {
        setVisible(false);
        apiClient.get('/announcement', { silent: true })
            .then((response) => {
                const data = response.data || response;
                if (data && data.update_time) {
                    localStorage.setItem(ANNOUNCEMENT_KEY, data.update_time);
                }
            })
            .catch(() => {});
    };

    if (loading || !visible || !content) return null;

    const renderContent = (html) => {
        html = html.replace(/\n/g, '<br>');
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['img', 'br'],
            ALLOWED_ATTR: ['src', 'alt']
        });
    };

    return (
        <>
            <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 z-50"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
                     onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            公告
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            &times;
                        </button>
                    </div>
                    <div className="overflow-y-auto p-4">
                        <style>{`
                            .announcement-body img { max-width: 100%; height: auto; margin: 0.75em 0; border-radius: 4px; }
                        `}</style>
                        <div
                            className="announcement-body text-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: renderContent(content) }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
