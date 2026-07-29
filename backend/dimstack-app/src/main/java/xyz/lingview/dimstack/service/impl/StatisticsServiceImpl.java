package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.mapper.StatisticsMapper;
import xyz.lingview.dimstack.service.StatisticsService;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    @Autowired
    private StatisticsMapper statisticsMapper;

    @Override
    public long getTotalArticles() {
        Long count = statisticsMapper.countArticles();
        return count != null ? count : 0L;
    }

    @Override
    public long getTotalComments() {
        Long count = statisticsMapper.countComments();
        return count != null ? count : 0L;
    }

    @Override
    public long getTotalPageViews() {
        Long sum = statisticsMapper.sumPageViews();
        return sum != null ? sum : 0L;
    }

    @Override
    public long getTotalUsers() {
        Long count = statisticsMapper.countUsers();
        return count != null ? count : 0L;
    }
}