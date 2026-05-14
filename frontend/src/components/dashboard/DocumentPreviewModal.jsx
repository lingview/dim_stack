import React, {
    useState,
    useEffect,
    useRef
} from 'react';
import {
    X,
    Download,
    FileText,
    ZoomIn,
    ZoomOut
} from 'lucide-react';

import {
    Document,
    Page,
    pdfjs
} from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export default function DocumentPreviewModal({
                                                 src,
                                                 filename,
                                                 onClose
                                             }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [documentType, setDocumentType] = useState(null);
    const [pdfData, setPdfData] = useState(null);
    const [wordData, setWordData] = useState(null);

    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [visiblePages, setVisiblePages] = useState(new Set());
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const wordContainerRef = useRef(null);
    const contentAreaRef = useRef(null);
    const pageRefs = useRef({});

    useEffect(() => {
        if (!src || !filename) return;

        document.body.style.overflow = 'hidden';

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        const loadDocument = async () => {
            try {
                setLoading(true);
                setError(null);

                const extension = filename
                    .toLowerCase()
                    .split('.')
                    .pop();

                const isPdf = extension === 'pdf';
                const isWord = ['doc', 'docx'].includes(extension);

                if (!isPdf && !isWord) {
                    setError('不支持的文件格式');
                    setLoading(false);
                    return;
                }

                let cleanSrc = src;
                if (cleanSrc.includes('?')) {
                    cleanSrc = cleanSrc.split('?')[0];
                }

                if (
                    cleanSrc.startsWith('http://127.0.0.1:2222') ||
                    cleanSrc.startsWith('http://localhost:2222')
                ) {
                    cleanSrc = cleanSrc.replace(
                        /^http:\/\/(127\.0\.0\.1|localhost):2222/,
                        ''
                    );
                }

                const response = await fetch(cleanSrc, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('文件加载失败');
                }

                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();

                if (isPdf) {
                    setDocumentType('pdf');
                    setPdfData(arrayBuffer);
                }

                if (isWord) {
                    setDocumentType('word');
                    setWordData(arrayBuffer);
                }

                setLoading(false);
            } catch (err) {
                console.error('文档加载失败:', err);
                setError(err.message || '文档加载失败');
                setLoading(false);
            }
        };

        loadDocument();

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('resize', handleResize);
        };
    }, [src, filename]);

    useEffect(() => {
        if (
            documentType === 'word' &&
            wordData &&
            wordContainerRef.current
        ) {
            import('docx-preview')
                .then(({
                           renderAsync
                       }) => {
                    wordContainerRef.current.innerHTML = '';

                    return renderAsync(
                        wordData,
                        wordContainerRef.current,
                        null, {
                            className: 'docx',
                            inWrapper: false,
                            ignoreWidth: windowWidth < 768,
                            ignoreHeight: false,
                            ignoreFonts: false,
                            breakPages: true,
                            ignoreLastRenderedPageBreak: true,
                            experimentalCacheTables: true,
                            useBase64URL: true
                        }
                    );
                })
                .catch((err) => {
                    console.error('Word渲染失败:', err);
                    setError('Word 文档渲染失败');
                });
        }
    }, [documentType, wordData, windowWidth]);

    useEffect(() => {
        if (documentType !== 'pdf' || !contentAreaRef.current) return;

        const contentArea = contentAreaRef.current;
        const bufferPages = 5;
        setVisiblePages((prev) => {
            const newSet = new Set(prev);
            for (let i = 1; i <= Math.min(totalPages, bufferPages + 1); i++) {
                newSet.add(i);
            }
            return newSet;
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const pageNumber = parseInt(entry.target.dataset
                        .pageNumber);

                    if (entry.isIntersecting) {
                        setVisiblePages((prev) => {
                            const newSet = new Set(prev);
                            for (let i = Math.max(1, pageNumber -
                                bufferPages); i <= Math.min(totalPages,
                                pageNumber + bufferPages); i++) {
                                newSet.add(i);
                            }
                            return newSet;
                        });
                    }
                });
            }, {
                root: contentArea,
                rootMargin: `${bufferPages * 100}% 0px`,
                threshold: 0
            }
        );

        const timeoutId = setTimeout(() => {
            Object.values(pageRefs.current).forEach((ref) => {
                if (ref) observer.observe(ref);
            });
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [documentType, totalPages]);

    const handleDownload = async () => {
        try {
            let cleanSrc = src;

            if (cleanSrc.includes('?')) {
                cleanSrc = cleanSrc.split('?')[0];
            }

            if (
                cleanSrc.startsWith('http://127.0.0.1:2222') ||
                cleanSrc.startsWith('http://localhost:2222')
            ) {
                cleanSrc = cleanSrc.replace(
                    /^http:\/\/(127\.0\.0\.1|localhost):2222/,
                    ''
                );
            }

            const response = await fetch(cleanSrc, {
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.href = url;
            link.download = filename;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('下载失败:', err);
        }
    };

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 0.5));
    };

    if (!src) return null;

    const extension = filename
        .toLowerCase()
        .split('.')
        .pop();

    const isPdf = extension === 'pdf';
    const isWord = ['doc', 'docx'].includes(extension);

    let fileTypeLabel = '文档';
    let iconColor = 'bg-purple-500';

    if (isPdf) {
        fileTypeLabel = 'PDF文档';
        iconColor = 'bg-red-500';
    }

    if (isWord) {
        fileTypeLabel = 'Word文档';
        iconColor = 'bg-blue-500';
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 md:p-8">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md document-preview-modal-overlay"
                onClick={onClose}
            />

            <div className="relative bg-white w-full h-full md:h-[90vh] md:max-w-6xl md:mt-16 md:rounded-lg shadow-xl flex flex-col overflow-hidden document-preview-modal-container">

                <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 flex justify-between items-center document-preview-header">
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <div
                            className={`w-8 h-8 md:w-10 md:h-10 ${iconColor} rounded-lg flex items-center justify-center`}
                        >
                            <FileText className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-base md:text-lg font-medium text-gray-900 document-preview-title truncate">
                                {filename}
                            </h3>

                            <p className="text-xs md:text-sm text-gray-500 document-preview-subtitle">
                                {fileTypeLabel}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">

                        {documentType === 'pdf' && (
                            <>
                                <button
                                    onClick={handleZoomOut}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                                >
                                    <ZoomOut className="h-5 w-5 text-gray-600" />
                                </button>

                                <span className="text-sm text-gray-600 min-w-[60px] text-center document-preview-page-info">
                                    {Math.round(scale * 100)}%
                                </span>

                                <button
                                    onClick={handleZoomIn}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                                >
                                    <ZoomIn className="h-5 w-5 text-gray-600" />
                                </button>

                                <div className="w-px h-6 bg-gray-300 mx-2 document-preview-toolbar-divider" />

                                <span className="text-sm text-gray-600 min-w-[80px] text-center document-preview-page-info">
                                    {totalPages} 页
                                </span>
                            </>
                        )}

                        <button
                            onClick={handleDownload}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                        >
                            <Download className="h-5 w-5 text-gray-600" />
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div
                    ref={contentAreaRef}
                    className="flex-1 overflow-auto bg-gray-50 p-3 md:p-6 document-preview-content-area"
                >

                    {loading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4 document-preview-loading-spinner" />

                                <p className="text-gray-600 document-preview-loading-text">
                                    正在加载文档...
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-red-500">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        documentType === 'pdf' &&
                        pdfData && (
                            <div className="flex flex-col items-center space-y-4 md:space-y-6 pb-6">
                                <Document
                                    file={pdfData}
                                    loading=""
                                    onLoadSuccess={({ numPages }) => {
                                        setTotalPages(numPages);
                                    }}
                                    onLoadError={(err) => {
                                        console.error(err);
                                        setError('PDF 加载失败');
                                    }}
                                >
                                    {Array.from({ length: totalPages }, (_, index) => {
                                        const pageNumber = index + 1;
                                        const isVisible = visiblePages.has(pageNumber);

                                        return (
                                            <div
                                                key={pageNumber}
                                                ref={(el) => { pageRefs.current[pageNumber] = el; }}
                                                data-page-number={pageNumber}
                                                className="bg-white shadow-lg w-full max-w-full"
                                                style={{ minHeight: '400px' }}
                                            >
                                                {isVisible ? (
                                                    <Page
                                                        pageNumber={pageNumber}
                                                        scale={scale}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                        className="document-preview-canvas"
                                                        width={windowWidth < 768 ? windowWidth - 40 : undefined}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-[400px] md:h-[600px] text-gray-400">
                                                        第 {pageNumber} 页
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </Document>
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        documentType === 'word' &&
                        wordData && (
                            <div
                                ref={wordContainerRef}
                                className="bg-white shadow-lg mx-auto w-full max-w-4xl p-4 md:p-8 document-preview-word-container"
                                style={{ overflowX: 'auto' }}
                            />
                        )}
                </div>
            </div>
        </div>
    );
}