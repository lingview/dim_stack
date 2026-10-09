package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PermissionMapper {

    List<String> findCodesByLiteralPrefix(@Param("prefix") String prefix);

    int upsertCode(@Param("code") String code, @Param("name") String name);

    int deleteByCodes(@Param("codes") List<String> codes);
}
