package xyz.lingview.dimstack.service.impl;

import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.mapper.ReadArticleMapper;
import xyz.lingview.dimstack.service.ReadArticleService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReadArticleServiceImpl implements ReadArticleService {

    @Autowired
    private ReadArticleMapper readArticleMapper;

    @Override
    public boolean isArticleNeedPassword(String alias) {
        return readArticleMapper.isArticleNeedPassword(alias);
    }

    @Override
    public ReadArticle getArticleByAlias(String alias, String password) throws Exception {
        ReadArticle article = readArticleMapper.selectByAlias(alias);
        if (article == null) {
            throw new Exception("文章不存在");
        }

        if (article.getPassword() != null && !article.getPassword().isEmpty()) {
            if (password == null) {
                throw new Exception("文章密码错误");
            }
            if (!BCrypt.checkpw(password, article.getPassword())) {
                throw new Exception("文章密码错误");
            }
        }
        readArticleMapper.updatePageViews(alias);

        return article;
    }

    @Override
    public void updatePageViews(String alias) {
        readArticleMapper.updatePageViews(alias);
    }

}
