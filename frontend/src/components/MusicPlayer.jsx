import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as musicMetadata from 'music-metadata-browser';
import axios from 'axios';
import apiClient from '../utils/axios';
import { getConfig } from '../utils/config';

const MusicPlayer = () => {
    const [musics, setMusics] = useState([]);
    const [currentMusic, setCurrentMusic] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [totalTime, setTotalTime] = useState(0);
    const [coverArt, setCoverArt] = useState(null);

    const audioRef = useRef(null);
    const coverCacheRef = useRef({});
    const isPlayingRef = useRef(false);
    const blockTimeUpdateRef = useRef(false);
    const isLoadingPlayRef = useRef(false);
    const hasMusicRef = useRef(false);
    const musicsRef = useRef(musics);
    const currentIndexRef = useRef(currentIndex);

    useEffect(() => { hasMusicRef.current = musics.length > 0; }, [musics]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { musicsRef.current = musics; }, [musics]);
    useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    useEffect(() => {
        if (!isExpanded) return;
        const handleOutsideTouch = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsExpanded(false);
                setShowPlaylist(false);
            }
        };
        document.addEventListener('touchstart', handleOutsideTouch);
        return () => document.removeEventListener('touchstart', handleOutsideTouch);
    }, [isExpanded]);

    const containerRef = useRef(null);

    useEffect(() => {
        const fetchMusics = async () => {
            try {
                const response = await apiClient.get('/music/enabled');
                if (response.code === 200 && response.data && response.data.length > 0) {
                    const config = getConfig();
                    const processedMusics = response.data.map(music => ({
                        ...music,
                        musicUrl: config.getFullUrl(music.musicUrl),
                    }));
                    setMusics(processedMusics);
                    setCurrentMusic(processedMusics[0]);
                    setCurrentIndex(0);
                } else {
                    setMusics([]);
                    setCurrentMusic(null);
                }
            } catch (error) {
                console.error('加载音乐列表失败:', error);
                setMusics([]);
                setCurrentMusic(null);
            }
        };
        fetchMusics();
    }, []);

    const applyCover = (meta, url, cancelled) => {
        const pic = meta.common.picture?.[0];
        if (pic && !cancelled) {
            const blob = new Blob([pic.data], { type: pic.format });
            const objectUrl = URL.createObjectURL(blob);
            coverCacheRef.current[url] = objectUrl;
            setCoverArt(objectUrl);
        } else if (!cancelled) {
            coverCacheRef.current[url] = null;
            setCoverArt(null);
        }
    };

    useEffect(() => {
        if (!currentMusic?.musicUrl) { setCoverArt(null); return; }
        const url = currentMusic.musicUrl;
        if (coverCacheRef.current[url]) {
            setCoverArt(coverCacheRef.current[url]);
            return;
        }
        let cancelled = false;
        const config = getConfig();
        const proxyUrl = currentMusic.musicUrl.startsWith(config.backendUrl)
            ? currentMusic.musicUrl.slice(config.backendUrl.length)
            : currentMusic.musicUrl;
        (async () => {
            try {
                const res = await axios.get(proxyUrl, { responseType: 'arraybuffer', timeout: 30000, withCredentials: true });
                const ct = res.headers?.['content-type'] || 'audio/flac';
                const meta = await musicMetadata.parseBlob(new Blob([res.data], { type: ct }));
                applyCover(meta, url, cancelled);
            } catch (err) {
                console.error('[MusicPlayer] 封面解析异常:', err);
                if (!cancelled) { coverCacheRef.current[url] = null; setCoverArt(null); }
            }
        })();
        return () => { cancelled = true; };
    }, [currentMusic]);

    useEffect(() => {
        if (!audioRef.current || !currentMusic) return;
        const audio = audioRef.current;
        const onTimeUpdate = () => {
            if (blockTimeUpdateRef.current) return;
            if (audio.duration && !isNaN(audio.duration)) {
                setProgress((audio.currentTime / audio.duration) * 100 || 0);
            }
        };
        const onEnded = () => {
            setIsPlaying(false);
            const idx = currentIndexRef.current;
            const len = musicsRef.current.length;
            if (len > 0) selectAndPlay((idx + 1) % len);
        };
        const onError = (e) => {
            console.error('音频加载错误:', e);
            setIsPlaying(false);
        };
        const onLoadedMetadata = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setTotalTime(audio.duration);
            }
        };
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, [currentMusic]);

    useEffect(() => {
        const onKey = (e) => {
            if (!hasMusicRef.current || !isPlayingRef.current) return;
            const len = musicsRef.current.length;
            const idx = currentIndexRef.current;
            if (e.key === 'ArrowRight') { e.preventDefault(); selectAndPlay((idx + 1) % len); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); selectAndPlay((idx - 1 + len) % len); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const playAudio = useCallback(() => {
        if (!audioRef.current || isLoadingPlayRef.current) return;
        isLoadingPlayRef.current = true;
        const attemptPlay = () => {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false))
                .finally(() => {
                    isLoadingPlayRef.current = false;
                    audioRef.current?.removeEventListener('canplay', attemptPlay);
                });
        };
        if (audioRef.current.readyState >= 2) { attemptPlay(); }
        else {
            audioRef.current.addEventListener('canplay', attemptPlay, { once: true });
            audioRef.current.load();
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { playAudio(); }
    }, [isPlaying, playAudio]);

    const selectAndPlay = useCallback((index) => {
        const list = musicsRef.current;
        if (!audioRef.current || index < 0 || index >= list.length || isLoadingPlayRef.current) return;
        isLoadingPlayRef.current = true;
        blockTimeUpdateRef.current = true;
        setProgress(0);
        setCurrentIndex(index);
        setCurrentMusic(list[index]);
        setShowPlaylist(false);
        audioRef.current.src = list[index].musicUrl;
        audioRef.current.load();
        const onReady = () => {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false))
                .finally(() => {
                    isLoadingPlayRef.current = false;
                    blockTimeUpdateRef.current = false;
                });
            audioRef.current.removeEventListener('canplay', onReady);
        };
        audioRef.current.addEventListener('canplay', onReady, { once: true });
    }, []);

    const handleSeek = (e) => {
        if (!audioRef.current || !audioRef.current.duration || isNaN(audioRef.current.duration)) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const time = percent * audioRef.current.duration;
        if (isFinite(time)) { audioRef.current.currentTime = time; setProgress(percent * 100); }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (musics.length === 0) return null;

    return (
        <div
            ref={containerRef}
            className="music-player fixed z-50 flex flex-col items-stretch transition-all duration-300 ease-out"
            style={{
                left: isExpanded ? 0 : isMobile ? '-13.5rem' : '-15.84rem',
                bottom: isMobile ? '1.75rem' : '2rem',
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => { setIsExpanded(false); setShowPlaylist(false); }}
        >
            {showPlaylist && (
                <div className="music-playlist-panel">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="music-track-name text-xs font-medium">播放列表</span>
                        <span className="music-time text-[10px]">{musics.length} 首</span>
                    </div>
                    <div className="music-playlist max-h-40 overflow-y-auto custom-scrollbar rounded-lg p-1">
                        {musics.map((music, idx) => (
                            <div
                                key={music.id}
                                onClick={() => selectAndPlay(idx)}
                                className={`p-1.5 rounded cursor-pointer transition-all mb-0.5 last:mb-0 flex items-center gap-2 ${
                                    currentMusic?.id === music.id ? 'music-playlist-active' : 'music-playlist-item'
                                }`}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium text-[10px] truncate">{music.musicName}</div>
                                    <div className="text-[10px] opacity-60 truncate">{music.musicAuthor}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div
                className={`music-player-panel${showPlaylist ? ' has-playlist' : ''}`}
                onClick={isExpanded ? undefined : (e) => { e.stopPropagation(); setIsExpanded(true); }}
            >
                <div className={`music-cover-wrapper${isExpanded ? '' : ' pointer-events-none'}`} onClick={togglePlay} title={isPlaying ? '暂停' : '播放'}>
                    {coverArt ? (
                        <img src={coverArt} alt="" className="music-cover-img" />
                    ) : (
                        <div className="music-cover-placeholder">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                            </svg>
                        </div>
                    )}
                    <div className="music-cover-overlay">
                        {isPlaying ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                </div>

                <div className={`music-body${isExpanded ? '' : ' pointer-events-none'}`}>
                    <div className="flex items-center justify-between">
                        <div className="music-track-name text-[11px] font-medium truncate">
                            {currentMusic?.musicName || '暂无音乐'}
                        </div>
                        <button
                            className="music-list-toggle shrink-0"
                            onClick={(e) => { e.stopPropagation(); setShowPlaylist(!showPlaylist); }}
                        >
                            {showPlaylist ? '收起' : '列表'}
                        </button>
                    </div>
                    <div className="music-seek-area cursor-pointer" onClick={handleSeek}>
                        <div className="music-progress-track relative h-[3px] rounded-full overflow-hidden group">
                            <div
                                className="music-progress-bar h-full rounded-full transition-all relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="music-progress-handle absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <div className="flex justify-between mt-0.5">
                            <span className="music-time text-[9px]">{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
                            <span className="music-time text-[9px]">{formatTime(totalTime)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {currentMusic && <audio ref={audioRef} src={currentMusic.musicUrl} preload="auto" />}

            <style>{`
                .music-player-panel {
                    display: flex;
                    border-radius: 0.75rem;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(229, 231, 235, 0.5);
                    box-shadow: 4px 4px 24px rgba(0, 0, 0, 0.08), 2px 2px 8px rgba(0, 0, 0, 0.04);
                    width: ${isMobile ? '15.5rem' : '18rem'};
                    height: ${isMobile ? '4rem' : '4.25rem'};
                    padding: 0.5rem;
                    gap: 0.5rem;
                    align-items: stretch;
                }
                .music-player-panel.has-playlist {
                    border-radius: 0 0 0.75rem 0.75rem;
                    border-top: none;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
                }

                .music-cover-wrapper {
                    position: relative;
                    width: ${isMobile ? '3rem' : '3.25rem'};
                    height: ${isMobile ? '3rem' : '3.25rem'};
                    border-radius: 0.5rem;
                    overflow: hidden;
                    cursor: pointer;
                    flex-shrink: 0;
                }
                .music-cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
                .music-cover-placeholder {
                    width: 100%; height: 100%;
                    background-color: #dbeafe;
                    display: flex; align-items: center; justify-content: center;
                    color: #3b82f6;
                }
                .music-cover-overlay {
                    position: absolute; inset: 0;
                    background: rgba(0, 0, 0, 0.3);
                    display: flex; align-items: center; justify-content: center;
                    color: white; opacity: 0; transition: opacity 0.2s ease;
                }
                .music-cover-wrapper:hover .music-cover-overlay { opacity: 1; }

                .music-body {
                    flex: 1; min-width: 0;
                    display: flex; flex-direction: column;
                    justify-content: center; gap: 0.25rem;
                }
                .music-track-name { color: #1f2937; }
                .music-list-toggle {
                    font-size: 9px; color: #9ca3af; cursor: pointer;
                    transition: color 0.15s ease;
                    background: none; border: none; padding: 0; line-height: 1; white-space: nowrap;
                }
                .music-list-toggle:hover { color: #3b82f6; }
                .music-time { color: #9ca3af; font-variant-numeric: tabular-nums; }

                .music-progress-track { background-color: #e5e7eb; }
                .music-progress-bar { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
                .music-progress-handle { background-color: #3b82f6; box-shadow: 0 0 6px rgba(59, 130, 246, 0.4); }

                .music-playlist-panel {
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(229, 231, 235, 0.5);
                    border-bottom: none;
                    border-radius: 0.75rem 0.75rem 0 0;
                    padding: 0.625rem;
                    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
                    width: ${isMobile ? '15.5rem' : '18rem'};
                }
                .music-playlist { background-color: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.05); }
                .music-playlist-item { color: #374151; }
                .music-playlist-item:hover { background-color: rgba(0, 0, 0, 0.04); }
                .music-playlist-active { background-color: rgba(59, 130, 246, 0.1); color: #1d4ed8; }

                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}</style>
        </div>
    );
};

export default MusicPlayer;
