import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from 'react';
import { FileImage, FileVideo, FileAudio, FileArchive, FileText, Check } from 'lucide-react';

let container = null;
let root = null;
let items = [];

const TYPE_META = {
    image: { Icon: FileImage, colorClass: 'text-emerald-500' },
    video: { Icon: FileVideo, colorClass: 'text-blue-500' },
    audio: { Icon: FileAudio, colorClass: 'text-violet-500' },
    archive: { Icon: FileArchive, colorClass: 'text-amber-500' },
    document: { Icon: FileText, colorClass: 'text-gray-400' }
};

const ARCHIVE_MIMES = new Set([
    'application/zip', 'application/x-rar-compressed', 'application/x-tar',
    'application/gzip', 'application/x-xz', 'application/x-7z-compressed',
    'application/x-zip-compressed', 'application/x-compressed', 'application/x-gzip'
]);

const detectCategory = (mimeType) => {
    if (!mimeType) return 'document';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (ARCHIVE_MIMES.has(mimeType)) return 'archive';
    return 'document';
};

const ProgressItem = ({ item }) => {
    const [creep, setCreep] = useState(item.percent);

    useEffect(() => {
        if (item.status !== 'processing') return;
        let current = item.percent;
        setCreep(current);
        const timer = setInterval(() => {
            current = Math.min(current + 0.5, 95);
            setCreep(current);
        }, 500);
        return () => clearInterval(timer);
    }, [item.status]);

    const isDone = item.status === 'done';
    const isError = item.status === 'error';
    const isProcessing = item.status === 'processing';
    const percent = isDone ? 100 : (isProcessing ? creep : item.percent);
    const { Icon, colorClass } = TYPE_META[item.category] || TYPE_META.document;
    const barColor = isDone ? 'bg-emerald-500' : (isError ? 'bg-red-500' : 'bg-blue-600');
    const leavingClass = isDone
        ? 'upload-progress-item-leaving-done'
        : (isError ? 'upload-progress-item-leaving-error' : '');

    return (
        <div className={`upload-progress-item flex items-center gap-3 px-4 py-3 ${leavingClass}`}>
            <Icon className={`w-5 h-5 shrink-0 ${isError ? 'text-red-400' : colorClass}`} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span
                        className={`text-sm font-medium truncate ${isError ? 'text-red-600' : 'text-gray-800'}`}
                        title={item.filename}
                    >
                        {item.filename}
                    </span>
                    <span className="text-xs tabular-nums shrink-0 flex items-center">
                        {isDone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : isError ? (
                            <span className="text-red-500 font-medium">失败</span>
                        ) : isProcessing ? (
                            <span className="upload-progress-processing-text text-gray-500">存储中</span>
                        ) : (
                            <span className="text-gray-500">{Math.round(percent)}%</span>
                        )}
                    </span>
                </div>
                <div className="upload-progress-track h-1 rounded-full overflow-hidden">
                    <div
                        className={`upload-progress-fill h-full rounded-full ${barColor} ${isProcessing ? 'upload-progress-fill-shimmer' : ''}`}
                        style={{ width: `${percent}%`, transition: 'width 0.3s ease' }}
                    />
                </div>
            </div>
        </div>
    );
};

const UploadProgressPanel = ({ items }) => {
    return (
        <div className={`upload-progress-panel w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${items.length === 0 ? 'upload-progress-panel-out' : ''}`}>
            {items.map(item => <ProgressItem key={item.id} item={item} />)}
        </div>
    );
};

const render = () => {
    if (!container) {
        if (items.length === 0) return;
        container = document.createElement('div');
        container.id = 'upload-progress-container';
        container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9998;';
        document.body.appendChild(container);
        root = createRoot(container);
    }

    root.render(<UploadProgressPanel items={items} />);

    if (items.length === 0) {
        setTimeout(() => {
            if (items.length === 0 && container) {
                root.unmount();
                document.body.removeChild(container);
                container = null;
                root = null;
            }
        }, 300);
    }
};

const start = (id, filename, mimeType) => {
    const item = {
        id,
        filename,
        category: detectCategory(mimeType),
        status: 'uploading',
        percent: 0
    };
    const index = items.findIndex(i => i.id === id);
    if (index >= 0) {
        items[index] = item;
    } else {
        items.push(item);
    }
    render();
    return id;
};

const progress = (id, percent) => {
    const item = items.find(i => i.id === id);
    if (!item || item.status !== 'uploading') return;
    const clamped = Math.min(Math.max(percent, 0), 85);
    if (Math.round(clamped) === Math.round(item.percent)) return;
    item.percent = clamped;
    render();
};

const processing = (id) => {
    const item = items.find(i => i.id === id);
    if (!item || item.status !== 'uploading') return;
    item.status = 'processing';
    render();
};

const remove = (id) => {
    const before = items.length;
    items = items.filter(i => i.id !== id);
    if (items.length !== before) render();
};

const done = (id) => {
    const item = items.find(i => i.id === id);
    if (!item || item.status === 'done' || item.status === 'error') return;
    item.status = 'done';
    item.percent = 100;
    render();
    setTimeout(() => remove(id), 1600);
};

const error = (id, message) => {
    const item = items.find(i => i.id === id);
    if (!item || item.status === 'done' || item.status === 'error') return;
    item.status = 'error';
    item.message = message;
    render();
    setTimeout(() => remove(id), 4100);
};

export const uploadProgress = { start, progress, processing, done, error, remove };
