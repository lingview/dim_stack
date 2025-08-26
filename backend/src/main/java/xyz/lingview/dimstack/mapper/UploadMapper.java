package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.UploadArticle;
import xyz.lingview.dimstack.domain.UploadAttachment;

@Mapper
@Repository
public interface  UploadMapper { ;
    int insertUploadAttachment(UploadAttachment UploadAttachment);
    int insertUploadArticle(UploadArticle UploadArticle);
}
