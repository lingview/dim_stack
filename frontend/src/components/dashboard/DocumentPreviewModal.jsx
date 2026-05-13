import React, { useState, useEffect, useRef } from 'react';
import { X, Download, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function DocumentPreviewModal({ src, filename, onClose }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [documentType, setDocumentType] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [wordData, setWordData] = useState(null);
    const canvasRef = useRef(null);
    const wordContainerRef = useRef(null);

    useEffect(() => {
        if (!src) return;

        const loadDocument = async () => {
            setLoading(true);
            setError(null);

            try {
                const fileExtension = filename.toLowerCase().split('.').pop();
                const isPdf = fileExtension === 'pdf';
                const isWord = ['doc', 'docx'].includes(fileExtension);

                if (!isPdf && !isWord) {
                    setError('不支持的文件格式');
                    setLoading(false);
                    return;
                }

                let cleanSrc = src;
                if (src.includes('?')) {
                    cleanSrc = src.split('?')[0];
                }

                if (cleanSrc.startsWith('http://127.0.0.1:2222') || cleanSrc.startsWith('http://localhost:2222')) {
                    cleanSrc = cleanSrc.replace(/^http:\/\/(127\.0\.0\.1|localhost):2222/, '');
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
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    setPdfDoc(pdf);
                    setTotalPages(pdf.numPages);
                } else if (isWord) {
                    setDocumentType('word');
                    setWordData(arrayBuffer);
                }

                setLoading(false);
            } catch (err) {
                console.error('文档加载错误:', err);
                setError('文档加载失败（可能是被IDM等下载插件拦截）: ' + err.message);
                setLoading(false);
            }
        };

        loadDocument();
    }, [src, filename]);

    useEffect(() => {
        if (documentType === 'pdf' && pdfDoc && canvasRef.current) {
            const renderPage = async () => {
                try {
                    const page = await pdfDoc.getPage(currentPage);
                    const viewport = page.getViewport({ scale });

                    const canvas = canvasRef.current;
                    const context = canvas.getContext('2d');

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                } catch (err) {
                    console.error('PDF页面渲染错误:', err);
                }
            };

            renderPage();
        }
    }, [documentType, pdfDoc, currentPage, scale]);

    useEffect(() => {
        if (documentType !== 'pdf' || !pdfDoc) return;

        const handleWheel = (e) => {
            e.preventDefault();
            
            if (e.deltaY > 0) {
                if (currentPage < totalPages) {
                    setCurrentPage(prev => prev + 1);
                }
            } else {
                if (currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
            }
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('wheel', handleWheel);
            }
        };
    }, [documentType, pdfDoc, currentPage, totalPages]);

    useEffect(() => {
        if (documentType === 'word' && wordData && wordContainerRef.current) {
            import('docx-preview').then(({ renderAsync }) => {
                renderAsync(wordData, wordContainerRef.current, null, {
                    className: "docx",
                    inWrapper: false,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    ignoreFonts: false,
                    breakPages: true,
                    ignoreLastRenderedPageBreak: true,
                    experimentalCacheTables: true,
                }).catch(err => {
                    console.error('Word文档渲染错误:', err);
                    setError('Word文档渲染失败');
                });
            });
        }
    }, [documentType, wordData]);

    const handleDownload = () => {
        let cleanSrc = src;
        if (src.includes('?')) {
            cleanSrc = src.split('?')[0];
        }

        if (cleanSrc.startsWith('http://127.0.0.1:2222') || cleanSrc.startsWith('http://localhost:2222')) {
            cleanSrc = cleanSrc.replace(/^http:\/\/(127\.0\.0\.1|localhost):2222/, '');
        }

        fetch(cleanSrc, {
            credentials: 'include',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(err => {
                console.error('下载失败:', err);
                const link = document.createElement('a');
                link.href = cleanSrc;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.2, 3.0));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.2, 0.5));
    };

    if (!src) return null;

    const fileExtension = filename.toLowerCase().split('.').pop();
    const isPdf = fileExtension === 'pdf';
    const isWord = ['doc', 'docx'].includes(fileExtension);

    let fileTypeLabel = '文档';
    let iconColor = 'bg-purple-500';

    if (isPdf) {
        fileTypeLabel = 'PDF文档';
        iconColor = 'bg-red-500';
    } else if (isWord) {
        fileTypeLabel = 'Word文档';
        iconColor = 'bg-blue-500';
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md document-preview-modal-overlay"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col document-preview-modal-container">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center document-preview-header">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}>
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 document-preview-title">{filename}</h3>
                            <p className="text-sm text-gray-500 document-preview-subtitle">{fileTypeLabel}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {documentType === 'pdf' && pdfDoc && (
                            <>
                                <button
                                    onClick={handleZoomOut}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                                    title="缩小"
                                >
                                    <ZoomOut className="h-5 w-5 text-gray-600" />
                                </button>
                                <span className="text-sm text-gray-600 min-w-[60px] text-center document-preview-page-info">
                                    {Math.round(scale * 100)}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                                    title="放大"
                                >
                                    <ZoomIn className="h-5 w-5 text-gray-600" />
                                </button>
                                <div className="w-px h-6 bg-gray-300 mx-2 document-preview-toolbar-divider"></div>
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage <= 1}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 document-preview-toolbar-btn"
                                    title="上一页"
                                >
                                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <span className="text-sm text-gray-600 min-w-[80px] text-center document-preview-page-info">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage >= totalPages}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 document-preview-toolbar-btn"
                                    title="下一页"
                                >
                                    <ChevronRight className="h-5 w-5 text-gray-600" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleDownload}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                            title="下载文件"
                        >
                            <Download className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors document-preview-toolbar-btn"
                            title="关闭"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-gray-100 p-4 document-preview-content-area">
                    {loading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4 document-preview-loading-spinner"></div>
                                <p className="text-gray-600 document-preview-loading-text">正在加载文档...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center max-w-md px-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 document-preview-error-icon-bg">
                                    <X className="h-8 w-8 text-red-500 document-preview-error-icon" />
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2 document-preview-error-title">预览失败</h4>
                                <p className="text-gray-600 mb-4 document-preview-error-message">{error}</p>
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center document-preview-download-btn"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    下载文件查看
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && documentType === 'pdf' && pdfDoc && (
                        <div className="flex justify-center">
                            <canvas ref={canvasRef} className="shadow-lg document-preview-canvas" />
                        </div>
                    )}

                    {!loading && !error && documentType === 'word' && wordData && (
                        <div
                            className="bg-white shadow-lg mx-auto max-w-4xl p-8 document-preview-word-container"
                            ref={wordContainerRef}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
