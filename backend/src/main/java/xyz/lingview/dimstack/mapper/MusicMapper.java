package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.Music;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/01/24 00:40:05
 * @Description: 站点音乐接口
 * @Version: 1.0
 */
@Mapper
@Repository
public interface MusicMapper {
    // 添加音乐
    int insertMusic(Music music);

    // 根据ID更新音乐
    int updateMusicById(Music music);

    // 软删除音乐
    int deleteMusicById(Integer id);

    // 获取所有启用的音乐
    List<Music> selectAllEnabledMusics();

    // 根据ID获取音乐
    Music selectMusicById(Integer id);

    // 获取所有音乐（包括已删除的）
    List<Music> selectAllMusics();
}
