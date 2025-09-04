package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.mapper.ReadArticleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public interface ReadArticleService {
    boolean isArticleNeedPassword(String alias);
    ReadArticle getArticleByAlias(String alias, String password) throws Exception;
}
