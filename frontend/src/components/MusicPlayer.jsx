import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../utils/axios';
import { getConfig } from '../utils/config';

const MusicPlayer = () => {
    const [musics, setMusics] = useState([]);
    const [currentMusic, setCurrentMusic] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    // 加载音乐列表
    useEffect(() => {
        const fetchMusics = async () => {
            try {
                const response = await apiClient.get('/music/enabled');
                if (response.success && response.data && response.data.length > 0) {
                    const config = getConfig();
                    const processedMusics = response.data.map(music => ({
                        ...music,
                        musicUrl: config.getFullUrl(music.musicUrl)
                    }));
                    setMusics(processedMusics);
                    if (processedMusics.length > 0) {
                        setCurrentMusic(processedMusics[0]);
                    }
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

    // 音频控制
    useEffect(() => {
        if (!audioRef.current || !currentMusic) return;
        const audio = audioRef.current;

        const updateTime = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                setProgress((audio.currentTime / audio.duration) * 100 || 0);
            }
        };

        const onEnded = () => {
            setIsPlaying(false);
            playNext();
        };

        const onError = (e) => {
            console.error('音频加载错误:', e);
            console.error('错误的URL:', currentMusic.musicUrl);
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
        };
    }, [currentMusic]);

    // 播放/暂停
    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (audioRef.current.readyState >= 2) {
                audioRef.current.play().catch(error => {
                    console.error('播放失败:', error);
                    setIsPlaying(false);
                });
                setIsPlaying(true);
            } else {
                audioRef.current.load();
                const canPlayHandler = () => {
                    audioRef.current.play().catch(error => {
                        console.error('播放失败:', error);
                        setIsPlaying(false);
                    });
                    setIsPlaying(true);
                    audioRef.current.removeEventListener('canplay', canPlayHandler);
                };
                audioRef.current.addEventListener('canplay', canPlayHandler);
            }
        }
    };

    // 播放下一首
    const playNext = () => {
        if (musics.length === 0) return;
        const currentIndex = musics.findIndex(music => music.id === currentMusic?.id);
        const nextIndex = (currentIndex + 1) % musics.length;
        setCurrentMusic(musics[nextIndex]);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.load();
                const canPlayHandler = () => {
                    audioRef.current.play().catch(error => {
                        console.error('播放失败:', error);
                        setIsPlaying(false);
                    });
                    setIsPlaying(true);
                    audioRef.current.removeEventListener('canplay', canPlayHandler);
                };
                audioRef.current.addEventListener('canplay', canPlayHandler);
            }
        }, 100);
    };

    // 播放上一首
    const playPrev = () => {
        if (musics.length === 0) return;
        const currentIndex = musics.findIndex(music => music.id === currentMusic?.id);
        const prevIndex = (currentIndex - 1 + musics.length) % musics.length;
        setCurrentMusic(musics[prevIndex]);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.load();
                const canPlayHandler = () => {
                    audioRef.current.play().catch(error => {
                        console.error('播放失败:', error);
                        setIsPlaying(false);
                    });
                    setIsPlaying(true);
                    audioRef.current.removeEventListener('canplay', canPlayHandler);
                };
                audioRef.current.addEventListener('canplay', canPlayHandler);
            }
        }, 100);
    };

    // 切换歌曲
    const selectMusic = (music) => {
        setCurrentMusic(music);
        setShowPlaylist(false);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.load();
                const canPlayHandler = () => {
                    audioRef.current.play().catch(error => {
                        console.error('播放失败:', error);
                        setIsPlaying(false);
                    });
                    setIsPlaying(true);
                    audioRef.current.removeEventListener('canplay', canPlayHandler);
                };
                audioRef.current.addEventListener('canplay', canPlayHandler);
            }
        }, 100);
    };

    // 跳转进度
    const handleSeek = (e) => {
        if (!audioRef.current || !audioRef.current.duration || isNaN(audioRef.current.duration)) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * audioRef.current.duration;
        if (isFinite(time)) {
            audioRef.current.currentTime = time;
            setProgress(percent * 100);
        }
    };

    // 调节音量
    const handleVolumeChange = (e) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
    };

    // 格式化时间
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (musics.length === 0) return null;

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            className={`fixed z-50 transition-all duration-300 ease-out ${
                isMobile 
                    ? "left-0 bottom-2 w-60"
                    : "left-0 bottom-20 w-64"
            }`}
            style={
                isMobile
                    ? {
                          transform: `translateX(${isExpanded ? '0' : '-95%'})`,
                          bottom: '0.5rem',
                          zIndex: 50
                      }
                    : {
                          transform: `translateX(${isExpanded ? '0' : '-92%'})`,
                          bottom: '5rem'
                      }
            }
            onMouseEnter={!isMobile ? () => setIsExpanded(true) : undefined}
            onMouseLeave={!isMobile ? () => setIsExpanded(false) : undefined}
        >
            {isMobile ? (
                <div className="music-player-container bg-white/80 backdrop-blur-lg rounded-r-xl shadow-xl border border-gray-200/50 border-l-0 h-40">
                    <div
                        className="absolute -right-5 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-1 py-3 rounded-r-md shadow-md cursor-pointer hover:bg-blue-600 transition-colors flex flex-col items-center gap-1"
                        onClick={toggleExpand}
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                        <span className="text-[8px] font-medium writing-mode-vertical">音乐</span>
                    </div>

                    <div className="p-2 h-full flex flex-col">
                        <div className="music-player-header flex items-center justify-between mb-1 pb-1 border-b border-gray-200">
                            <h3 className="music-player-title text-gray-800 font-medium text-xs flex items-center gap-1">
                                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                                </svg>
                                音乐
                            </h3>
                            <button
                                onClick={() => setShowPlaylist(!showPlaylist)}
                                className="music-player-list-btn text-gray-600 hover:text-blue-500 text-[10px] bg-gray-100/60 backdrop-blur-sm hover:bg-gray-200/60 px-1 py-0.5 rounded transition-colors border border-gray-200/30"
                            >
                                {showPlaylist ? '×' : '列表'}
                            </button>
                        </div>

                        {/* 当前歌曲信息 */}
                        {!showPlaylist && (
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="music-name text-gray-800 font-medium text-xs truncate flex-1 mr-1">
                                        {currentMusic?.musicName || '暂无音乐'}
                                    </div>
                                    {isPlaying && (
                                        <div className="flex items-center gap-0.5">
                                            <div className="w-0.5 bg-blue-500 rounded-full animate-wave" style={{ height: '8px', animationDelay: '0ms' }}></div>
                                            <div className="w-0.5 bg-blue-500 rounded-full animate-wave" style={{ height: '5px', animationDelay: '150ms' }}></div>
                                            <div className="w-0.5 bg-blue-500 rounded-full animate-wave" style={{ height: '10px', animationDelay: '300ms' }}></div>
                                            <div className="w-0.5 bg-blue-500 rounded-full animate-wave" style={{ height: '6px', animationDelay: '450ms' }}></div>
                                        </div>
                                    )}
                                </div>
                                <div className="music-author text-gray-500 text-[10px] truncate mb-2">
                                    {currentMusic?.musicAuthor || '未知艺术家'}
                                </div>

                                {/* 进度条 */}
                                <div
                                    onClick={handleSeek}
                                    className="music-progress-track bg-gray-200 rounded-full h-1 cursor-pointer group relative overflow-hidden mb-1"
                                >
                                    <div
                                        className="music-progress-bar bg-blue-500 h-full rounded-full transition-all relative"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="music-progress-handle absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
                                    </div>
                                </div>
                                <div className="flex justify-between music-time text-gray-500 text-[10px]">
                                    <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
                                    <span>{audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}</span>
                                </div>
                            </div>
                        )}

                        {/* 播放列表 */}
                        {showPlaylist && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {musics.map((music) => (
                                    <div
                                        key={music.id}
                                        onClick={() => selectMusic(music)}
                                        className={`p-1 rounded-md cursor-pointer transition-all mb-1 last:mb-0 ${
                                            currentMusic?.id === music.id
                                                ? 'bg-blue-500/90 backdrop-blur-sm text-white shadow-sm'
                                                : 'music-playlist-item bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-gray-100/80'
                                        }`}
                                    >
                                        <div className="font-medium text-[10px] truncate">{music.musicName}</div>
                                        <div className="text-[10px] opacity-70 truncate">{music.musicAuthor}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!showPlaylist && (
                            <div className="flex items-center justify-center gap-2 pt-1">
                                <button
                                    onClick={playPrev}
                                    className="music-control-btn text-gray-600 hover:text-blue-500 hover:scale-110 transition-all"
                                    title="上一首"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="bg-blue-500/90 backdrop-blur-sm text-white rounded-full p-1 hover:bg-blue-600/90 hover:scale-110 transition-all shadow-lg"
                                    title={isPlaying ? '暂停' : '播放'}
                                >
                                    {isPlaying ? (
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>

                                <button
                                    onClick={playNext}
                                    className="music-control-btn text-gray-600 hover:text-blue-500 hover:scale-110 transition-all"
                                    title="下一首"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {currentMusic && (
                        <audio
                            ref={audioRef}
                            src={currentMusic.musicUrl}
                            preload="auto"
                        />
                    )}
                </div>
            ) : (
                // 桌面端版本
                <div className="music-player-container bg-white/80 backdrop-blur-lg rounded-r-xl shadow-xl w-64 border border-gray-200/50 border-l-0">
                    <div
                        className="absolute -right-6 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-1.5 py-4 rounded-r-md shadow-md cursor-pointer hover:bg-blue-600 transition-colors flex flex-col items-center gap-1"
                        onClick={toggleExpand}
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                        <span className="text-[10px] font-medium writing-mode-vertical">音乐</span>
                    </div>

                    <div className="p-2">
                        <div className="music-player-header flex items-center justify-between mb-1.5 pb-1.5 border-b border-gray-200">
                            <h3 className="music-player-title text-gray-800 font-medium text-xs flex items-center gap-1.5">
                                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                                </svg>
                                音乐播放器
                            </h3>
                            <button
                                onClick={() => setShowPlaylist(!showPlaylist)}
                                className="music-player-list-btn text-gray-600 hover:text-blue-500 text-[10px] bg-gray-100/60 backdrop-blur-sm hover:bg-gray-200/60 px-1.5 py-0.5 rounded transition-colors border border-gray-200/30"
                            >
                                {showPlaylist ? '隐藏' : '列表'}
                            </button>
                        </div>

                        {/* 当前歌曲信息 */}
                        {!showPlaylist && (
                            <div className="music-info-card bg-gray-50/60 backdrop-blur-sm rounded-lg p-2 mb-2 border border-gray-200/30">
                                <div className="flex items-center justify-between mb-0.5">
                                    <div className="music-name text-gray-800 font-medium text-xs truncate flex-1">
                                        {currentMusic?.musicName || '暂无音乐'}
                                    </div>
                                    {isPlaying && (
                                        <div className="flex items-center gap-0.5 ml-1">
                                            <div className="w-0.5 bg-blue-500 rounded-full animate-wave" style={{ height: '10px', animationDelay: '0ms' }}></div>
                                            <div className="w-0.5 bg-blue-500 rounded-full animate-wave" style={{ height: '6px', animationDelay: '150ms' }}></div>
                                            <div className="w-0.5 bg-blue-500 rounded-full animate-wave" style={{ height: '12px', animationDelay: '300ms' }}></div>
                                            <div className="w-0.5 bg-blue-500 rounded-full animate-wave" style={{ height: '8px', animationDelay: '450ms' }}></div>
                                        </div>
                                    )}
                                </div>
                                <div className="music-author text-gray-500 text-[10px] truncate">
                                    {currentMusic?.musicAuthor || '未知艺术家'}
                                </div>
                            </div>
                        )}

                        {/* 播放列表 */}
                        {showPlaylist && (
                            <div className="music-playlist bg-gray-50/60 backdrop-blur-sm rounded-lg p-1.5 mb-2 max-h-32 overflow-y-auto custom-scrollbar border border-gray-200/30">
                                {musics.map((music) => (
                                    <div
                                        key={music.id}
                                        onClick={() => selectMusic(music)}
                                        className={`p-1.5 rounded-md cursor-pointer transition-all mb-1 last:mb-0 ${
                                            currentMusic?.id === music.id
                                                ? 'bg-blue-500/90 backdrop-blur-sm text-white shadow-sm'
                                                : 'music-playlist-item bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-gray-100/80'
                                        }`}
                                    >
                                        <div className="font-medium text-[10px] truncate">{music.musicName}</div>
                                        <div className="text-[10px] opacity-70 truncate">{music.musicAuthor}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 进度条 */}
                        <div className="mb-2">
                            <div
                                onClick={handleSeek}
                                className="music-progress-track bg-gray-200 rounded-full h-1 cursor-pointer group relative overflow-hidden"
                            >
                                <div
                                    className="music-progress-bar bg-blue-500 h-full rounded-full transition-all relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="music-progress-handle absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
                                </div>
                            </div>
                            <div className="flex justify-between music-time text-gray-500 text-[10px] mt-0.5">
                                <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
                                <span>{audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}</span>
                            </div>
                        </div>

                        {/* 控制按钮 */}
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <button
                                onClick={playPrev}
                                className="music-control-btn text-gray-600 hover:text-blue-500 hover:scale-110 transition-all"
                                title="上一首"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                                </svg>
                            </button>

                            <button
                                onClick={togglePlay}
                                className="bg-blue-500/90 backdrop-blur-sm text-white rounded-full p-2 hover:bg-blue-600/90 hover:scale-110 transition-all shadow-lg"
                                title={isPlaying ? '暂停' : '播放'}
                            >
                                {isPlaying ? (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={playNext}
                                className="music-control-btn text-gray-600 hover:text-blue-500 hover:scale-110 transition-all"
                                title="下一首"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <svg className="music-volume-icon w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="music-volume-track flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                            />
                        </div>

                        {currentMusic && (
                            <audio
                                ref={audioRef}
                                src={currentMusic.musicUrl}
                                preload="auto"
                            />
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                }
                .slider::-moz-range-thumb {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: none;
                }
                .writing-mode-vertical {
                    writing-mode: vertical-rl;
                    text-orientation: upright;
                }
                @keyframes wave {
                    0%, 100% {
                        transform: scaleY(0.5);
                    }
                    50% {
                        transform: scaleY(1);
                    }
                }
                .animate-wave {
                    animation: wave 0.8s ease-in-out infinite;
                    transform-origin: center;
                }
            `}</style>
        </div>
    );
};

export default MusicPlayer;
