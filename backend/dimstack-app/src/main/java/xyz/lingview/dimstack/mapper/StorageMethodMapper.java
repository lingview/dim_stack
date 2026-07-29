package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.StorageMethod;

import java.util.List;

@Mapper
@Repository
public interface StorageMethodMapper {
    StorageMethod selectByUuid(String uuid);

    StorageMethod selectByName(String name);

    StorageMethod selectByType(String type);

    List<StorageMethod> selectAll();

    int insert(StorageMethod storageMethod);

    int update(StorageMethod storageMethod);

    int disable(String uuid);

    int enable(String uuid);

    int deletePhysical(String uuid);
}