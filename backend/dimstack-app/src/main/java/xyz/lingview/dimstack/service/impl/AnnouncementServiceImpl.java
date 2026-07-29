package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Announcement;
import xyz.lingview.dimstack.mapper.AnnouncementMapper;
import xyz.lingview.dimstack.service.AnnouncementService;

@Service
@Slf4j
public class AnnouncementServiceImpl implements AnnouncementService {

    @Autowired
    private AnnouncementMapper announcementMapper;

    @Override
    public Announcement getLatest() {
        return announcementMapper.selectLatest();
    }

    @Override
    public boolean save(String content) {
        return announcementMapper.insert(content) > 0;
    }
}
