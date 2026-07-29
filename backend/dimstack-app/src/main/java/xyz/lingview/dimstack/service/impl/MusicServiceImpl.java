package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Music;
import xyz.lingview.dimstack.mapper.MusicMapper;
import xyz.lingview.dimstack.service.MusicService;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/01/24 00:44:15
 * @Description: 站点音乐服务实现
 * @Version: 1.0
 */

@Service
@Slf4j
public class MusicServiceImpl implements MusicService {

    @Autowired
    private MusicMapper musicMapper;

    @Override
    public boolean addMusic(Music music) {
        try {
            int result = musicMapper.insertMusic(music);
            return result > 0;
        } catch (Exception e) {
            log.error("添加音乐失败", e);
            return false;
        }
    }

    @Override
    public boolean updateMusic(Music music) {
        try {
            int result = musicMapper.updateMusicById(music);
            return result > 0;
        } catch (Exception e) {
            log.error("更新音乐失败", e);
            return false;
        }
    }

    @Override
    public boolean deleteMusic(Integer id) {
        try {
            int result = musicMapper.deleteMusicById(id);
            return result > 0;
        } catch (Exception e) {
            log.error("删除音乐失败", e);
            return false;
        }
    }

    @Override
    public List<Music> getAllEnabledMusics() {
        try {
            return musicMapper.selectAllEnabledMusics();
        } catch (Exception e) {
            log.error("获取启用的音乐列表失败", e);
            return null;
        }
    }

    @Override
    public List<Music> getAllMusics() {
        try {
            return musicMapper.selectAllMusics();
        } catch (Exception e) {
            log.error("获取所有音乐列表失败", e);
            return null;
        }
    }

    @Override
    public Music getMusicById(Integer id) {
        try {
            return musicMapper.selectMusicById(id);
        } catch (Exception e) {
            log.error("获取音乐详情失败", e);
            return null;
        }
    }
}
