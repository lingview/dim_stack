import React, { useState, useEffect } from 'react';

const ImageLightbox = ({ images, currentIndex, onClose, onNavigate }) => {
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onNavigate(-1);
      } else if (e.key === 'ArrowRight') {
        onNavigate(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  const currentImage = images[currentIndex];

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onNavigate(-1);
      } else if (e.key === 'ArrowRight') {
        onNavigate(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNavigate]);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setLoaded(false);
  }, [currentIndex]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 3));
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
      <div
          className="fixed inset-0  bg-opacity-30 backdrop-blur-lg z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
          onWheel={handleWheel}
      >
        <div
            className="relative max-w-full max-h-full flex items-center justify-center w-full h-full"
            onClick={(e) => e.stopPropagation()}
        >
          {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
          )}

          <img
              src={currentImage.src}
              alt={currentImage.alt || '图片'}
              className={`max-w-full max-h-[90vh] object-contain ${loaded ? 'block' : 'hidden'} cursor-${scale > 1 ? 'move' : 'zoom-in'}`}
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
              onLoad={() => setLoaded(true)}
              onError={(e) => {
                e.target.src = '/image_error.svg';
                setLoaded(true);
              }}
              onMouseDown={handleMouseDown}
          />

          {images.length > 1 && (
              <>
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(-1);
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm z-20 shadow-lg"
                    aria-label="上一张"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(1);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm z-20 shadow-lg"
                    aria-label="下一张"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
          )}

          <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="bg-white bg-opacity-80 text-gray-800 p-2 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm shadow-lg"
                aria-label="重置视图"
                title="重置视图"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <div className="bg-white bg-opacity-80 text-gray-800 px-3 py-1 rounded-full text-sm backdrop-blur-sm shadow-lg">
              {Math.round(scale * 100)}%
            </div>
          </div>

          <button
              onClick={onClose}
              className="absolute top-20 right-4 bg-white bg-opacity-80 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm z-20 shadow-lg"
              aria-label="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 text-gray-800 px-4 py-2 rounded-full text-sm backdrop-blur-sm z-20 shadow-lg">
                {currentIndex + 1} / {images.length}
              </div>
          )}
        </div>
      </div>
  );
};

export default ImageLightbox;
