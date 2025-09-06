package xyz.lingview.dimstack.controller;

import xyz.lingview.dimstack.dto.HotArticleDTO;
import xyz.lingview.dimstack.service.HotArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/hot")
public class HotArticleController {

    @Autowired
    private HotArticleService hotArticleService;

    @GetMapping("/articles")
    public List<HotArticleDTO> getHotArticles() {
        return hotArticleService.getHotArticles();
    }
}
