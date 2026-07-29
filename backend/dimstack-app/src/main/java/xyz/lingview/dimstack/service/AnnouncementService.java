package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.Announcement;

public interface AnnouncementService {

    Announcement getLatest();

    boolean save(String content);
}
