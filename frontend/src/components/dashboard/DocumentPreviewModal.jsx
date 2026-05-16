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
    ZoomOut,
    Maximize2,
    Minimize2
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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordRendered, setWordRendered] = useState(false);
    const wordContainerRef = useRef(null);
    const contentAreaRef = useRef(null);
    const pageRefs = useRef({});
    const modalRef = useRef(null);
    const wordScrollPositionRef = useRef(0);

    useEffect(() => {
        if (!src || !filename) return;

        let cancelled = false;
        document.body.style.overflow = 'hidden';

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isFullscreen) {
                    setIsFullscreen(false);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);

        const loadDocument = async () => {
            try {
                setLoading(true);
                setError(null);
                setPdfData(null);
                setWordData(null);
                setDocumentType(null);
                setTotalPages(0);

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

                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:2222';
                const backendHost = backendUrl.replace(/^https?:\/\//, '').split(':')[0];
                const backendPort = backendUrl.split(':').pop();
                
                const hostPattern = new RegExp(`^http://(${backendHost}|localhost):${backendPort}`);
                if (hostPattern.test(cleanSrc)) {
                    cleanSrc = cleanSrc.replace(hostPattern, '');
                }

                const response = await fetch(cleanSrc, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,*/*'
                    }
                });

                if (!response.ok) {
                    throw new Error(`文件加载失败: ${response.status} ${response.statusText}`);
                }

                const blob = await response.blob();
                
                if (blob.size === 0) {
                    throw new Error('文件为空');
                }

                if (cancelled) return;

                const arrayBuffer = await blob.arrayBuffer();

                if (cancelled) return;

                if (isPdf) {
                    setDocumentType('pdf');
                    setPdfData(arrayBuffer);
                } else if (isWord) {
                    setDocumentType('word');
                    setWordData(arrayBuffer);
                }

                setLoading(false);
            } catch (err) {
                if (!cancelled) {
                    console.error('文档加载失败:', err);
                    setError(err.message || '文档加载失败');
                    setLoading(false);
                }
            }
        };

        loadDocument();

        return () => {
            cancelled = true;
            document.body.style.overflow = '';
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [src, filename, onClose]);

    useEffect(() => {
        if (
            documentType === 'word' &&
            wordData &&
            wordContainerRef.current &&
            !wordRendered
        ) {
            let cancelled = false;
            
            import('docx-preview')
                .then(({ renderAsync }) => {
                    if (cancelled || !wordContainerRef.current) return;
                    
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
                    ).then(() => {
                        if (!cancelled) {
                            setWordRendered(true);
                            if (contentAreaRef.current) {
                                contentAreaRef.current.scrollTop = wordScrollPositionRef.current;
                            }

                            setupWordAnchorLinks();
                        }
                    });
                })
                .catch((err) => {
                    if (!cancelled) {
                        console.error('Word渲染失败:', err);
                        setError('Word 文档渲染失败');
                    }
                });
            
            return () => {
                cancelled = true;
            };
        }
    }, [documentType, wordData]);

    const setupWordAnchorLinks = () => {
        if (!wordContainerRef.current || !contentAreaRef.current) return;
        
        const handleAnchorClick = (e) => {
            const target = e.target.closest('a');
            if (!target) return;
            
            const href = target.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const anchorId = href.substring(1);
            const targetElement = wordContainerRef.current.querySelector(`[id="${anchorId}"]`);
            
            if (targetElement && contentAreaRef.current) {
                const containerRect = contentAreaRef.current.getBoundingClientRect();
                const targetRect = targetElement.getBoundingClientRect();
                const scrollTop = contentAreaRef.current.scrollTop;
                const offsetTop = targetRect.top - containerRect.top + scrollTop;

                contentAreaRef.current.scrollTo({
                    top: offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        };
        
        wordContainerRef.current.addEventListener('click', handleAnchorClick, true);

        return () => {
            if (wordContainerRef.current) {
                wordContainerRef.current.removeEventListener('click', handleAnchorClick, true);
            }
        };
    };

    useEffect(() => {
        if (documentType !== 'word' || !wordRendered) return;

        const wasMobile = windowWidth < 768;
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;

            if (contentAreaRef.current) {
                wordScrollPositionRef.current = contentAreaRef.current.scrollTop;
            }

            if (wasMobile !== isMobile) {
                setWordRendered(false);
                setWindowWidth(window.innerWidth);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [documentType, wordRendered, windowWidth]);

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

            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:2222';
            const backendHost = backendUrl.replace(/^https?:\/\//, '').split(':')[0];
            const backendPort = backendUrl.split(':').pop();
            
            const hostPattern = new RegExp(`^http://(${backendHost}|localhost):${backendPort}`);
            if (hostPattern.test(cleanSrc)) {
                cleanSrc = cleanSrc.replace(hostPattern, '');
            }

            const response = await fetch(cleanSrc, {
                credentials: 'include'
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

    const toggleFullscreen = () => {
        setIsFullscreen((prev) => !prev);
    };

    const getTruncatedFilename = () => {
        if (windowWidth >= 768) return filename;
        
        const maxMobileLength = 20;
        const dotIndex = filename.lastIndexOf('.');
        const nameWithoutExt = dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
        const extension = dotIndex > 0 ? filename.substring(dotIndex) : '';
        
        if (nameWithoutExt.length <= maxMobileLength) {
            return filename;
        }
        
        const truncatedName = nameWithoutExt.substring(0, maxMobileLength - 3) + '...';
        return truncatedName + extension;
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
        <div className={`fixed inset-0 flex items-center justify-center z-[9999] ${
            isFullscreen ? 'p-0' : 'p-0 md:p-4 lg:p-8'
        }`}>
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md document-preview-modal-overlay"
                onClick={onClose}
            />

            <div 
                ref={modalRef}
                className={`relative bg-white flex flex-col overflow-hidden document-preview-modal-container ${
                    isFullscreen 
                        ? 'w-full h-full rounded-none' 
                        : 'w-full h-full md:h-[90vh] md:max-w-6xl md:mt-16 md:rounded-lg shadow-xl'
                }`}
            >

                <div className="px-3 py-2 md:px-6 md:py-4 border-b border-gray-200 flex justify-between items-center document-preview-header">
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                        <div
                            className={`w-7 h-7 md:w-10 md:h-10 ${iconColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                            <FileText className="h-3.5 w-3.5 md:h-5 md:w-5 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm md:text-lg font-medium text-gray-900 document-preview-title truncate" title={filename}>
                                {getTruncatedFilename()}
                            </h3>

                            <p className="text-xs md:text-sm text-gray-500 document-preview-subtitle hidden sm:block">
                                {fileTypeLabel}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">

                        {documentType === 'pdf' && (
                            <>
                                <button
                                    onClick={handleZoomOut}
                                    className="p-1.5 md:p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                                >
                                    <ZoomOut className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                                </button>

                                <span className="text-xs md:text-sm text-gray-600 min-w-[50px] md:min-w-[60px] text-center document-preview-page-info">
                                    {Math.round(scale * 100)}%
                                </span>

                                <button
                                    onClick={handleZoomIn}
                                    className="p-1.5 md:p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                                >
                                    <ZoomIn className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                                </button>

                                <div className="w-px h-5 md:h-6 bg-gray-300 mx-1 md:mx-2 document-preview-toolbar-divider hidden sm:block" />

                                <span className="text-xs md:text-sm text-gray-600 min-w-[60px] md:min-w-[80px] text-center document-preview-page-info hidden sm:block">
                                    {totalPages} 页
                                </span>
                            </>
                        )}

                        <button
                            onClick={toggleFullscreen}
                            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                            ) : (
                                <Maximize2 className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                            )}
                        </button>

                        <button
                            onClick={handleDownload}
                            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                        >
                            <Download className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                        </button>

                        <button
                            onClick={onClose}
                            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                        >
                            <X className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div
                    ref={contentAreaRef}
                    className={`flex-1 overflow-auto bg-gray-50 ${
                        isFullscreen ? 'p-0' : 'p-3 md:p-6'
                    } document-preview-content-area`}
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
                                        console.error('PDF 渲染错误:', err);
                                        if (err.name === 'InvalidPDFException') {
                                            setError('PDF 文件无效或已损坏');
                                        } else {
                                            setError('PDF 加载失败');
                                        }
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