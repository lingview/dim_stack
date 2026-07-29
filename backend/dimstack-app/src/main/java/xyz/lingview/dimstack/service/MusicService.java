package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.Music;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/01/24 00:43:33
 * @Description: 站点音乐服务定义
 * @Version: 1.0
 */
public interface MusicService {
    boolean addMusic(Music music);
    boolean updateMusic(Music music);
    boolean deleteMusic(Integer id);
    List<Music> getAllEnabledMusics();
    List<Music> getAllMusics();
    Music getMusicById(Integer id);
}
