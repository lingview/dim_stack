package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.service.StatisticsService;

@RestController
@RequestMapping("/api/statistics")
@Slf4j
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/articlecount")
    public ApiResponse<Long> getArticleCount() {
        return ApiResponse.success(statisticsService.getTotalArticles());
    }

    @GetMapping("/usercount")
    public ApiResponse<Long> getUserCount() {
        return ApiResponse.success(statisticsService.getTotalUsers());
    }

    @GetMapping("/commentcount")
    public ApiResponse<Long> getCommentCount() {
        return ApiResponse.success(statisticsService.getTotalComments());
    }

    @GetMapping("/browsecount")
    public ApiResponse<Long> getBrowseCount() {
        return ApiResponse.success(statisticsService.getTotalPageViews());
    }
}