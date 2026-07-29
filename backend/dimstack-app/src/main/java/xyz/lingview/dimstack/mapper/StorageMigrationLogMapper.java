package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.StorageMigrationFailedItem;
import xyz.lingview.dimstack.domain.StorageMigrationLog;

import java.util.List;

@Mapper
@Repository
public interface StorageMigrationLogMapper {
    int insertLog(StorageMigrationLog log);

    int updateLog(StorageMigrationLog log);

    void insertFailedItem(StorageMigrationFailedItem item);

    void insertFailedItems(List<StorageMigrationFailedItem> items);

    StorageMigrationLog selectById(int id);

    List<StorageMigrationLog> selectAll();
}