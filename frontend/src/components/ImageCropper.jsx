import React, { useState, useRef, useEffect } from 'react';

export default function ImageCropper({ image, onCropComplete, onCancel, onSkipCrop }) {
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        if (!image) return;

        setImageLoaded(false);
        const img = new Image();
        img.onload = () => {
            const maxWidth = Math.min(600, window.innerWidth - 100);
            const maxHeight = Math.min(500, window.innerHeight - 200);

            let width = img.naturalWidth;
            let height = img.naturalHeight;
            const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
            width = width * ratio;
            height = height * ratio;

            setImageSize({ width, height });

            const cropSize = Math.min(width, height) * 0.8;
            setCrop({
                x: (width - cropSize) / 2,
                y: (height - cropSize) / 2,
                width: cropSize,
                height: cropSize
            });

            setImageLoaded(true);
        };
        img.src = image;
    }, [image]);

    const handleMouseDown = (e, handle = null) => {
        e.preventDefault();
        e.stopPropagation();
        if (handle) {
            setResizeHandle(handle);
        } else {
            setIsDragging(true);
        }
        const rect = containerRef.current.getBoundingClientRect();
        setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging && !resizeHandle) return;
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (isDragging) {
            const dx = mouseX - dragStart.x;
            const dy = mouseY - dragStart.y;
            setCrop(prev => {
                let newX = prev.x + dx;
                let newY = prev.y + dy;
                newX = Math.max(0, Math.min(newX, imageSize.width - prev.width));
                newY = Math.max(0, Math.min(newY, imageSize.height - prev.height));
                return { ...prev, x: newX, y: newY };
            });
            setDragStart({ x: mouseX, y: mouseY });
        } else if (resizeHandle) {
            const minSize = 50;
            setCrop(prev => {
                let newCrop = { ...prev };
                switch (resizeHandle) {
                    case 'se':
                        newCrop.width = Math.max(minSize, Math.min(mouseX - prev.x, imageSize.width - prev.x));
                        newCrop.height = Math.max(minSize, Math.min(mouseY - prev.y, imageSize.height - prev.y));
                        break;
                    case 'sw':
                        { const newWidth = Math.max(minSize, prev.x + prev.width - mouseX);
                        newCrop.x = Math.max(0, prev.x + prev.width - newWidth);
                        newCrop.width = newWidth;
                        newCrop.height = Math.max(minSize, Math.min(mouseY - prev.y, imageSize.height - prev.y));
                        break; }
                    case 'ne':
                        { newCrop.width = Math.max(minSize, Math.min(mouseX - prev.x, imageSize.width - prev.x));
                        const newHeight = Math.max(minSize, prev.y + prev.height - mouseY);
                        newCrop.y = Math.max(0, prev.y + prev.height - newHeight);
                        newCrop.height = newHeight;
                        break; }
                    case 'nw':
                        { const w = Math.max(minSize, prev.x + prev.width - mouseX);
                        const h = Math.max(minSize, prev.y + prev.height - mouseY);
                        newCrop.x = Math.max(0, prev.x + prev.width - w);
                        newCrop.y = Math.max(0, prev.y + prev.height - h);
                        newCrop.width = w;
                        newCrop.height = h;
                        break; }
                }
                return newCrop;
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setResizeHandle(null);
    };

    const handleCrop = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const scaleX = img.naturalWidth / imageSize.width;
            const scaleY = img.naturalHeight / imageSize.height;
            const sx = crop.x * scaleX;
            const sy = crop.y * scaleY;
            const sw = crop.width * scaleX;
            const sh = crop.height * scaleY;

            canvas.width = sw;
            canvas.height = sh;
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

            canvas.toBlob(blob => {
                const file = new File([blob], 'cropped-avatar.png', { type: 'image/png' });
                onCropComplete(file);
            }, 'image/png', 0.92);
        };
        img.src = image;
    };

    const handleSkipCrop = () => {
        onSkipCrop?.();
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-opacity-30 z-40"
                onClick={onCancel}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div
                    className="bg-white rounded-xl shadow-xl max-w-2xl w-full"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">裁剪头像</h3>
                    </div>

                    {!imageLoaded ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500 mr-2"></div>
                            <span className="text-gray-500">加载中...</span>
                        </div>
                    ) : (
                        <div className="p-4 flex justify-center">
                            <div
                                ref={containerRef}
                                className="relative inline-block select-none"
                                style={{ width: imageSize.width, height: imageSize.height }}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <img
                                    src={image}
                                    alt=""
                                    className="block"
                                    style={{ width: imageSize.width, height: imageSize.height }}
                                    draggable={false}
                                />
                                <div
                                    className="absolute border-2 border-blue-500 cursor-move"
                                    style={{
                                        left: crop.x,
                                        top: crop.y,
                                        width: crop.width,
                                        height: crop.height,
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e)}
                                >
                                    <div className="absolute inset-0 border border-dashed border-white opacity-70"></div>

                                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-nw-resize"
                                         onMouseDown={(e) => handleMouseDown(e, 'nw')} />
                                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-ne-resize"
                                         onMouseDown={(e) => handleMouseDown(e, 'ne')} />
                                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-sw-resize"
                                         onMouseDown={(e) => handleMouseDown(e, 'sw')} />
                                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-se-resize"
                                         onMouseDown={(e) => handleMouseDown(e, 'se')} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 按钮区 */}
                    <div className="flex justify-end gap-3 p-5">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                        {onSkipCrop && (
                            <button
                                onClick={handleSkipCrop}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                直接上传
                            </button>
                        )}
                        <button
                            onClick={handleCrop}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            确认裁剪
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}