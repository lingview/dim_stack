package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.mapper.StatisticsMapper;

@RestController
@RequestMapping("/api/statistics")
@Slf4j
public class StatisticsController {

    private final StatisticsMapper statisticsMapper;

    public StatisticsController(StatisticsMapper statisticsMapper) {
        this.statisticsMapper = statisticsMapper;
    }

    @GetMapping("/articlecount")
    public Long getArticleCount() {
        return statisticsMapper.countArticles();
    }

    @GetMapping("/usercount")
    public Long getUserCount() {
        return statisticsMapper.countUsers();
    }

    @GetMapping("/commentcount")
    public Long getCommentCount() {
        return statisticsMapper.countComments();
    }

    @GetMapping("/browsecount")
    public Long getBrowseCount() {
        return statisticsMapper.sumPageViews();
    }
}
